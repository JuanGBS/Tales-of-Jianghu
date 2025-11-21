import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function useCombatManager(user, showNotification) {
  const [combatData, setCombatData] = useState(null);
  const [localLogs, setLocalLogs] = useState([]);
  
  const combatDataRef = useRef(combatData);
  const logsRef = useRef([]); // Ref para evitar closures antigas no realtime

  useEffect(() => {
    combatDataRef.current = combatData;
  }, [combatData]);

  useEffect(() => {
    logsRef.current = localLogs;
  }, [localLogs]);

  // Função auxiliar para salvar no LocalStorage e no Estado
  const appendLog = useCallback((newLog) => {
    if (!newLog || !newLog.id) return;

    // Evita duplicatas (caso o realtime envie o que a gente acabou de salvar otimistamente)
    const exists = logsRef.current.some(l => l.id === newLog.id);
    if (exists) return;

    const updatedLogs = [...logsRef.current, newLog];
    setLocalLogs(updatedLogs);

    // Salva no LocalStorage
    const combatId = combatDataRef.current?.id;
    if (combatId) {
      localStorage.setItem(`combat_logs_${combatId}`, JSON.stringify(updatedLogs));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchInitial = async () => {
      const { data } = await supabase
        .from('combat')
        .select('*')
        .eq('gm_id', user.id)
        .maybeSingle();
      
      if (data) {
        setCombatData(data);
        
        // Carrega logs do LocalStorage
        const savedLogs = localStorage.getItem(`combat_logs_${data.id}`);
        if (savedLogs) {
          try {
            setLocalLogs(JSON.parse(savedLogs));
          } catch (e) {
            console.error("Erro ao ler logs locais", e);
          }
        }
      }
    };

    fetchInitial();

    const channel = supabase
      .channel(`gm_combat_manager_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'combat', filter: `gm_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setCombatData(null);
            setLocalLogs([]);
          } else if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newData = payload.new;
            
            // Atualiza dados gerais (Turno, Status)
            setCombatData(prev => ({ ...prev, ...newData }));

            // Se houve uma nova rolagem vinda de fora (ex: Jogador), adiciona ao log
            if (newData.last_roll) {
                appendLog(newData.last_roll);
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, appendLog]);

  // --- AÇÕES ---

  const createCombat = async (participants) => {
    try {
      const turnOrder = participants.map((char) => {
        const isNpc = !!char.isNpc || !!char.is_npc || (typeof char.id === 'string' && char.id.startsWith('npc_'));
        let initiative = null;
        if (isNpc) {
          const roll = Math.floor(Math.random() * 20) + 1;
          const bonus = (char.attributes?.agility || 0);
          initiative = roll + bonus;
        }

        const finalImage = char.imageUrl || char.image_url || null;
        const finalUserId = char.userId || char.user_id || null;
        
        return {
          character_id: char.id,
          user_id: finalUserId,
          name: char.name,
          image_url: finalImage, 
          attributes: char.attributes || {},
          is_npc: isNpc,
          initiative: initiative,
        };
      });

      await supabase.from("combat").delete().gt("id", "00000000-0000-0000-0000-000000000000");

      const { data: newCombat, error } = await supabase.from("combat").insert({
        gm_id: user.id,
        status: "pending_initiative",
        turn_order: turnOrder,
        current_turn_index: 0,
        last_roll: null
      }).select().single();

      if (error) throw error;

      const validIds = participants
        .filter(p => p.id && !p.id.toString().startsWith('npc_temp'))
        .map(p => p.id);

      if (validIds.length > 0) {
        await supabase.from('characters').update({ active_combat_id: newCombat.id }).in('id', validIds);
      }

      // Limpa logs antigos do storage se criar um novo combate
      localStorage.removeItem(`combat_logs_${newCombat.id}`);
      setLocalLogs([]);
      setCombatData(newCombat);
      showNotification("Combate criado!", "success");

    } catch (error) {
      console.error("Erro createCombat:", error);
      showNotification("Erro ao criar combate.", "error");
    }
  };

  const startRound = async () => {
    if (!combatData) return;
    
    try {
        // Busca dados frescos
        const { data: freshCombat } = await supabase
            .from('combat')
            .select('*')
            .eq('id', combatData.id)
            .single();

        if (!freshCombat) throw new Error("Falha de sync");

        const updatedOrder = freshCombat.turn_order.map(p => {
            if (p.initiative === null || p.initiative === undefined) {
                return { ...p, initiative: Math.floor(Math.random() * 20) + 1 + (p.attributes?.agility || 0) };
            }
            return p;
        }).sort((a, b) => (b.initiative || 0) - (a.initiative || 0));

        const optimisticData = {
            ...freshCombat,
            turn_order: updatedOrder,
            status: 'active',
            current_turn_index: 0
        };
        setCombatData(optimisticData);

        const { data: serverData, error } = await supabase
            .from('combat')
            .update({
                turn_order: updatedOrder,
                status: 'active',
                current_turn_index: 0
            })
            .eq('id', combatData.id)
            .select()
            .single();

        if (error) throw error;
        if (serverData) setCombatData(serverData);
        
        showNotification("Rodada Iniciada!", "success");
    } catch (err) {
        console.error("Erro startRound:", err);
        showNotification("Erro ao iniciar.", "error");
    }
  };

  const nextTurn = async () => {
    const currentData = combatDataRef.current || combatData;
    if (!currentData) return;

    const len = currentData.turn_order?.length || 1;
    const currentIdx = currentData.current_turn_index || 0;
    const nextIdx = (currentIdx + 1) % len;

    // Otimista
    setCombatData(prev => ({ ...prev, current_turn_index: nextIdx }));

    try {
        const { data: serverData, error } = await supabase
            .from('combat')
            .update({ current_turn_index: nextIdx })
            .eq('id', currentData.id)
            .select()
            .single();

        if (error) throw error;
        if (serverData) setCombatData(serverData);

    } catch (err) {
        console.error("Erro nextTurn:", err);
        showNotification("Erro ao salvar turno.", "error");
    }
  };

  const endCombat = async () => {
    const currentId = combatData?.id;
    setCombatData(null);
    setLocalLogs([]);

    try {
        if (currentId) {
             await supabase.from('characters').update({ active_combat_id: null }).eq('active_combat_id', currentId);
             // Limpa LocalStorage
             localStorage.removeItem(`combat_logs_${currentId}`);
        }
        await supabase.from('combat').delete().eq('gm_id', user.id);
        showNotification("Combate encerrado.", "success");
    } catch (error) {
        console.error("Erro endCombat:", error);
    }
  };

  const gmRoll = async (index) => {
      if (!combatData) return;
      const order = [...combatData.turn_order];
      const p = order[index];
      const total = Math.floor(Math.random() * 20) + 1 + (p.attributes?.agility || 0);
      order[index] = { ...p, initiative: total };
      
      setCombatData(prev => ({ ...prev, turn_order: order }));

      await supabase
        .from('combat')
        .update({ turn_order: order })
        .eq('id', combatData.id);
      
      showNotification(`Rolado ${total} para ${p.name}`, "success");
  };

  const updateStat = async (charId, field, value) => {
     const val = parseInt(value) || 0;
     const { data } = await supabase.from('characters').select('stats').eq('id', charId).single();
     if (data) {
         const newStats = { ...data.stats, [field]: val };
         await supabase.from('characters').update({ stats: newStats }).eq('id', charId);
     }
  };

  // NOVA FUNÇÃO: ENVIA ROLAGEM PARA A COLUNA last_roll
  const sendCombatLog = async (message, type = 'info') => {
    const currentData = combatDataRef.current || combatData;
    if (!currentData) return;

    const newLog = {
        id: Date.now(),
        message,
        type, 
        timestamp: new Date().toISOString()
    };

    // 1. Adiciona Localmente Imediatamente (Feedback instantâneo)
    appendLog(newLog);

    // 2. Envia para o banco para que outros vejam (se implementarmos a visão do player depois)
    // Isso não afeta o turno, pois é uma coluna diferente
    await supabase
        .from('combat')
        .update({ last_roll: newLog })
        .eq('id', currentData.id);
  };

  return {
    combatData,
    localLogs, // Exporta os logs locais
    createCombat,
    startRound,
    nextTurn,
    endCombat,
    gmRoll,
    updateStat,
    sendCombatLog 
  };
}