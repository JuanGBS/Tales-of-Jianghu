export const ARMOR_TYPES = [
  {
    id: 'none',
    name: 'Nenhuma',
    effects: {
      baseArmorClass: null, 
      agilityPenalty: 0 
    }
  },
  {
    id: 'medium',
    name: 'Média',
    effects: {
      baseArmorClass: 14, 
      agilityPenalty: -2 
    }
  },
  {
    id: 'heavy',
    name: 'Pesada',
    effects: {
      baseArmorClass: 16, 
      agilityPenalty: -4 
    }
  }
];