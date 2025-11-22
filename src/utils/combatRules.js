import { parseDiceString, rollDice } from './dice';

// Normaliza a categoria para evitar erros de "Pesada" vs "pesada"
export const normalizeCategory = (category) => {
    if (!category) return 'normal';
    const cat = category.toLowerCase().trim();
    if (cat === 'p' || cat.includes('pesada') || cat.includes('heavy')) return 'pesada';
    if (cat === 'l' || cat.includes('leve') || cat.includes('light')) return 'leve';
    return 'normal';
};

export const calculateAttackDamage = (character, weapon, isCrit) => {
    // 1. Dados da Arma
    const damageStr = weapon.damage || '1d4';
    const category = normalizeCategory(weapon.category);
    const attrKey = (weapon.attribute || 'agility').toLowerCase();

    // 2. Configuração do Dado
    const diceConfig = parseDiceString(damageStr);

    // 3. Regra de Crítico
    let multiplier = 1;
    if (isCrit) {
        // AQUI ESTÁ A REGRA CENTRALIZADA
        multiplier = (category === 'pesada') ? 3 : 2;
    }

    const count = diceConfig.count * multiplier;

    // 4. Bônus de Atributo
    // Tenta pegar da ficha do personagem
    let attributeBonus = 0;
    if (character && character.attributes) {
        // Normaliza chaves de atributo
        let key = attrKey;
        if (key === 'agilidade') key = 'agility';
        if (key === 'vigor') key = 'vigor';
        if (key === 'força') key = 'vigor'; // Fallback

        attributeBonus = character.attributes[key] || 0;
        
        // Se for proficiente (lógica simplificada, assumindo que proficientAttribute armazena a chave)
        if (character.proficientAttribute === key) {
             // Se o sistema dobra atributo no dano por proficiência, descomente abaixo:
             // attributeBonus *= 2; 
        }
    }

    // Soma o bônus fixo da arma (ex: 1d8+1) com o atributo
    const finalBonus = diceConfig.modifier + attributeBonus;

    // 5. Rolagem
    const { total, rolls } = rollDice(count, diceConfig.faces);
    const finalTotal = total + finalBonus;

    return {
        total: finalTotal,
        rolls: rolls,
        bonus: finalBonus,
        multiplier: multiplier,
        isCrit: isCrit
    };
};