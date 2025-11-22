import { useCallback } from 'react';
import { parseDiceString, rollDice } from '../utils/dice';

export function useDamageSystem() {
  
  const calculateDamage = useCallback((character, isCrit, manualFormula = null, manualBonus = null) => {
    if (!character) return null;

    // 1. Obter dados da arma do inventário
    const weapon = character.inventory?.weapon || {};
    const category = (weapon.category || '').toLowerCase();
    const damageStr = manualFormula || weapon.damage || '1d4';
    
    // 2. Configurar dados
    const diceConfig = parseDiceString(damageStr);
    
    // 3. Regra de Crítico
    // Armas Pesadas (category 'pesada') causam 3x no crítico. Outras causam 2x.
    let multiplier = 1;
    if (isCrit) {
        if (category === 'pesada') {
            multiplier = 3;
        } else {
            multiplier = 2;
        }
    }

    const count = diceConfig.count * multiplier;
    
    // 4. Bônus de Atributo
    // Se um bônus manual foi passado (do log), usa ele. 
    // Se não, tenta calcular baseado no atributo da arma na ficha.
    let finalBonus = 0;
    if (manualBonus !== null && manualBonus !== undefined) {
        finalBonus = manualBonus;
    } else {
        const attrKey = (weapon.attribute || 'agility').toLowerCase();
        finalBonus = character.attributes?.[attrKey] || 0;
    }
    
    // Soma bônus fixo da fórmula (ex: 1d8+1) com bônus de atributo
    finalBonus += diceConfig.modifier;

    // 5. Rolar
    const { total, rolls } = rollDice(count, diceConfig.faces);
    const finalTotal = total + finalBonus;

    // 6. Formatar Mensagem
    const critText = isCrit ? ` (Crítico x${multiplier}!)` : '';
    const rollsStr = rolls.join('+');
    const bonusStr = finalBonus ? ` + ${finalBonus}` : '';
    
    const message = `Dano: **${finalTotal}** [${rollsStr}${bonusStr}]${critText}`;

    return {
        total: finalTotal,
        message: message,
        rolls: rolls,
        multiplier: multiplier
    };
  }, []);

  return { calculateDamage };
}