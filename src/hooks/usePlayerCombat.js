import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function usePlayerCombat(character, showNotification) {
  const [combatData, setCombatData] = useState(null);
  const [showInitiativeRoll, setShowInitiativeRoll] = useState(false);
  
  const characterIdRef = useRef(character?.id);
  const activeCombatIdRef = useRef(character?.activeCombatId);
  const combatDataRef = useRef(null);

  useEffect(() => {
    characterIdRef.current = character?.id;
    activeCombatIdRef.current = character?.activeCombatId;
  }, [character]);

  const fetchCombat = useCallback(async () => {
    const combatId = activeCombatIdRef.current;
    if (!combatId) {
      if (combatDataRef.current) {
          setCombatData(null);
          combatDataRef.current = null;
          setShowInitiativeRoll(false);
      }
      return;
    }

    const { data } = await supabase.from('combat').select('*').eq('id', combatId).maybeSingle();

    if (data) {
      if (JSON.stringify(data) !== JSON.stringify(combatDataRef.current)) {
        setCombatData(data);
        combatDataRef.current = data;
        
        if (data.status === 'pending_initiative') {
            const me = data.turn_order.find(p => p.character_id === characterIdRef.current);
            if (me && me.initiative === null) {
                setShowInitiativeRoll(true);
            } else {
                setShowInitiativeRoll(false);
            }
        } else if (data.status === 'active') {
            setShowInitiativeRoll(false);
        }
      }
    } else {
      if (combatDataRef.current) {
          setCombatData(null);
          combatDataRef.current = null;
          setShowInitiativeRoll(false);
          showNotification("O Combate terminou.", "info");
      }
    }
  }, []);
  
  const sendInitiative = async (value) => {
    if (!combatData) return;
    const { data: fresh } = await supabase.from('combat').select('*').eq('id', combatData.id).single();
    if (!fresh) return;

    const myIndex = fresh.turn_order.findIndex(p => p.character_id === character.id);
    if (myIndex === -1) return;

    const newOrder = [...fresh.turn_order];
    newOrder[myIndex] = { ...newOrder[myIndex], initiative: value };

    setCombatData(prev => ({ ...prev, turn_order: newOrder }));
    setShowInitiativeRoll(false);

    await supabase.from('combat').update({ turn_order: newOrder }).eq('id', combatData.id);
    showNotification(`Iniciativa ${value} enviada!`, "success");
  };

  const endTurn = async () => {
    if (!combatData) return;
    const nextIdx = (combatData.current_turn_index + 1) % combatData.turn_order.length;
    setCombatData(prev => ({ ...prev, current_turn_index: nextIdx }));
    await supabase.from('combat').update({ current_turn_index: nextIdx }).eq('id', combatData.id);
  };

  // ATUALIZADO: Inclui characterId no log
  const sendPlayerLog = async (actionName, rollResult, damageFormula = null, weaponCategory = null, damageBonus = 0) => {
    if (!combatData) return;

    const total = rollResult.total;
    const roll = rollResult.roll;
    const bonus = rollResult.modifier;
    const isCrit = roll === 20;
    const isFail = roll === 1;

    let logMsg = `${character.name} usou **${actionName}**: Rolou **${total}** (${roll}${bonus >= 0 ? '+' : ''}${bonus}).`;
    
    if (isCrit) logMsg += " **CRÍTICO!**";
    if (isFail) logMsg += " **FALHA CRÍTICA!**";

    const newLog = {
        id: Date.now(),
        characterId: character.id, // ID PARA BUSCA NO GM
        message: logMsg,
        type: isCrit ? 'crit' : (isFail ? 'fail' : 'info'),
        timestamp: new Date().toISOString(),
        damageFormula,
        damageBonus
    };

    await supabase.from('combat').update({ last_roll: newLog }).eq('id', combatData.id);
  };

  useEffect(() => {
    fetchCombat();
    const combatId = activeCombatIdRef.current;
    if (!combatId) return;
    const interval = setInterval(fetchCombat, 1000);
    return () => clearInterval(interval);
  }, [character?.activeCombatId, fetchCombat]);

  return {
    combatData, showInitiativeRoll, setShowInitiativeRoll, sendInitiative, endTurn, forceRefresh: fetchCombat,
    sendPlayerLog
  };
}