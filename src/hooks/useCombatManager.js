import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function useCombatManager(user, showNotification) {
  const [combatData, setCombatData] = useState(null);
  const [localLogs, setLocalLogs] = useState([]);
  
  const combatDataRef = useRef(combatData);
  const logsRef = useRef([]);

  useEffect(() => {
    combatDataRef.current = combatData;
  }, [combatData]);

  useEffect(() => {
    logsRef.current = localLogs;
  }, [localLogs]);

  // Função auxiliar para salvar no LocalStorage e no Estado
  const appendLog = useCallback((newLog) => {
    if (!newLog || !newLog.id) return;

    const exists = logsRef.current.some(l => l.id === newLog.id);
    if (exists) return;

    const updatedLogs = [...logsRef.current, newLog];
    setLocalLogs(updatedLogs);

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
        const savedLogs = localStorage.getItem(`combat_logs_${data.id}`);
        if (savedLogs) {
          try { setLocalLogs(JSON.parse(savedLogs)); } catch (e) { console.error(e); }
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
            setCombatData(prev => ({ ...prev, ...newData }));
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
        
        return {
          character_id: char.id,
          user_id: char.userId || char.user_id || null,
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

      const validIds = participants.filter(p => p.id && !p.id.toString().startsWith('npc_temp')).map(p => p.id);
      if (validIds.length > 0) {
        await supabase.from('characters').update({ active_combat_id: newCombat.id }).in('id', validIds);
      }

      localStorage.removeItem(`combat_logs_${newCombat.id}`);
      setLocalLogs([]);
      setCombatData(newCombat);
      showNotification("Combate criado!", "success");
    } catch (error) {
      console.error(error);
      showNotification("Erro ao criar combate.", "error");
    }
  };

  const startRound = async () => {
    if (!combatData) return;
    try {
        const { data: freshCombat } = await supabase.from('combat').select('*').eq('id', combatData.id).single();
        if (!freshCombat) throw new Error("Falha de sync");

        const updatedOrder = freshCombat.turn_order.map(p => {
            if (p.initiative === null || p.initiative === undefined) {
                return { ...p, initiative: Math.floor(Math.random() * 20) + 1 + (p.attributes?.agility || 0) };
            }
            return p;
        }).sort((a, b) => (b.initiative || 0) - (a.initiative || 0));

        setCombatData({ ...freshCombat, turn_order: updatedOrder, status: 'active', current_turn_index: 0 });

        await supabase.from('combat').update({
            turn_order: updatedOrder, status: 'active', current_turn_index: 0
        }).eq('id', combatData.id);
        
        showNotification("Rodada Iniciada!", "success");
    } catch (err) { console.error(err); showNotification("Erro ao iniciar.", "error"); }
  };

  const nextTurn = async () => {
    const currentData = combatDataRef.current || combatData;
    if (!currentData) return;
    setCombatData(prev => ({ ...prev, current_turn_index: (prev.current_turn_index + 1) % prev.turn_order.length }));

    try {
        const { data: fresh } = await supabase.from('combat').select('current_turn_index, turn_order').eq('id', currentData.id).single();
        const nextIdx = (fresh.current_turn_index + 1) % fresh.turn_order.length;
        await supabase.from('combat').update({ current_turn_index: nextIdx }).eq('id', currentData.id);
    } catch (err) { console.error(err); }
  };

  const endCombat = async () => {
    const currentId = combatData?.id;
    setCombatData(null);
    setLocalLogs([]);
    try {
        if (currentId) {
             await supabase.from('characters').update({ active_combat_id: null }).eq('active_combat_id', currentId);
             localStorage.removeItem(`combat_logs_${currentId}`);
        }
        await supabase.from('combat').delete().eq('gm_id', user.id);
        showNotification("Combate encerrado.", "success");
    } catch (error) { console.error(error); }
  };

  const gmRoll = async (index) => {
      if (!combatData) return;
      const order = [...combatData.turn_order];
      const p = order[index];
      const total = Math.floor(Math.random() * 20) + 1 + (p.attributes?.agility || 0);
      order[index] = { ...p, initiative: total };
      setCombatData(prev => ({ ...prev, turn_order: order }));
      await supabase.from('combat').update({ turn_order: order }).eq('id', combatData.id);
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

  // ATUALIZADO: Adiciona Log Localmente (para ações do Mestre)
  const addCombatLog = async (message, type = 'info', damageFormula = null) => {
    const newLog = {
        id: Date.now(),
        message,
        type, 
        timestamp: new Date().toISOString(),
        damageFormula // Salva a fórmula aqui
    };
    
    // Adiciona ao histórico local do Mestre imediatamente
    appendLog(newLog);
    
    // Opcional: Enviar para o banco se quiser que jogadores vejam no futuro
    // Por enquanto, apenas salva no last_roll para disparar triggers se necessário
    // mas a persistencia principal é o localStorage do Mestre.
  };

  // ATUALIZADO: Envia Log via Banco (Simulando Player ou Sync)
  const sendCombatLog = async (message, type = 'info', damageFormula = null) => {
    const currentData = combatDataRef.current || combatData;
    if (!currentData) return;

    const newLog = {
        id: Date.now(),
        message,
        type, 
        timestamp: new Date().toISOString(),
        damageFormula
    };

    // Adiciona localmente para feedback instantaneo
    appendLog(newLog);

    // Envia para last_roll
    await supabase.from('combat').update({ last_roll: newLog }).eq('id', currentData.id);
  };

  return {
    combatData, localLogs, createCombat, startRound, nextTurn, endCombat, gmRoll, updateStat,
    addCombatLog, sendCombatLog 
  };
}