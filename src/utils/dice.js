// ARQUIVO: src/utils/dice.js

export const parseDiceString = (diceString) => {
  // Padrão aceito: XdY+Z ou XdY-Z ou apenas XdY
  // Ex: "1d6", "2d8+2", "1d10-1"
  
  if (!diceString || typeof diceString !== 'string') {
    return { count: 1, faces: 20, modifier: 0, isValid: false };
  }

  const cleanStr = diceString.toLowerCase().replace(/\s/g, '');
  const match = cleanStr.match(/^(\d+)d(\d+)([+-]\d+)?$/);

  if (match) {
    return {
      count: parseInt(match[1], 10),
      faces: parseInt(match[2], 10),
      modifier: match[3] ? parseInt(match[3], 10) : 0,
      isValid: true
    };
  }

  return { count: 1, faces: 20, modifier: 0, isValid: false };
};

export const rollDice = (count, faces) => {
  let total = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const result = Math.floor(Math.random() * faces) + 1;
    rolls.push(result);
    total += result;
  }
  return { total, rolls };
};