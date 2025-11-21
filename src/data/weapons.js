// ARQUIVO: src/data/weapons.js

export const WEAPON_CATEGORIES = {
  leve: {
    name: 'Leve',
    description: 'Velozes e precisas. Ao brandir duas armas leves, pode realizar um segundo ataque (Ação Menor) sem penalidade.'
  },
  media: {
    name: 'Média',
    description: 'Versáteis. Pode alternar postura: Ágil (+1 Ataque) ou Firme (+1 Dano).'
  },
  pesada: {
    name: 'Pesada',
    description: 'Indispensável uso de duas mãos. Acertos críticos causam o triplo do dano (x3).'
  },
  alcance: {
    name: 'Alcance',
    description: 'Permite atacar com 1,5m (5ft) de distância a mais.'
  },
  exotica: {
    name: 'Exótica',
    description: 'Armas com funcionamento único e complexo.'
  }
};

export const WEAPONS_LIST = [
  // --- LEVES ---
  { 
    id: 'jian', 
    name: 'Jian (Espada Reta)', 
    category: 'leve', 
    damage: '1d6', 
    cost: '8 TP', 
    allowedAttributes: ['agility'] 
  },
  { 
    id: 'dao_curto', 
    name: 'Dao Curto', 
    category: 'leve', 
    damage: '1d6', 
    cost: '5 TP', 
    allowedAttributes: ['agility'] 
  },
  { 
    id: 'fio_aco', 
    name: 'Fio de Aço', 
    category: 'leve', 
    damage: '1d4', 
    cost: '1 TP', 
    allowedAttributes: ['agility', 'comprehension'] // Exemplo: Fio pode usar compreensão as vezes
  },
  { 
    id: 'punhais_duplos', 
    name: 'Punhais Duplos', 
    category: 'leve', 
    damage: '1d4', // Sistema deve tratar ataque duplo depois
    cost: '6 TP', 
    allowedAttributes: ['agility'] 
  },
  { 
    id: 'ganchos_tigre', 
    name: 'Ganchos de Tigre', 
    category: 'leve', 
    damage: '1d6', 
    cost: '12 TP', 
    allowedAttributes: ['agility'] 
  },

  // --- MÉDIAS ---
  { 
    id: 'dao', 
    name: 'Dao (Sabre Chinês)', 
    category: 'media', 
    damage: '1d8', 
    cost: '15 TP', 
    allowedAttributes: ['vigor', 'agility'] 
  },
  { 
    id: 'bastao_curto', 
    name: 'Bastão Curto', 
    category: 'media', 
    damage: '1d6', 
    cost: '12 TC', 
    allowedAttributes: ['vigor', 'agility'] 
  },
  { 
    id: 'tonfa', 
    name: 'Tonfa', 
    category: 'media', 
    damage: '1d6', 
    cost: '1 TP', 
    allowedAttributes: ['vigor', 'agility'] 
  },

  // --- PESADAS ---
  { 
    id: 'guandao', 
    name: 'Guandao', 
    category: 'pesada', 
    damage: '1d12', 
    cost: '2 TO', 
    allowedAttributes: ['vigor'] 
  },
  { 
    id: 'qiang_pesada', 
    name: 'Qiang Pesada', 
    category: 'pesada', 
    damage: '1d10', 
    cost: '45 TP', 
    allowedAttributes: ['vigor'] 
  },
  { 
    id: 'martelo_guerra', 
    name: 'Martelo de Guerra Oriental', 
    category: 'pesada', 
    damage: '2d6', 
    cost: '1 TO', 
    allowedAttributes: ['vigor'] 
  },
  { 
    id: 'mangual', 
    name: 'Mangual Oriental', 
    category: 'pesada', 
    damage: '1d10', 
    cost: '60 TP', 
    allowedAttributes: ['vigor'] 
  },

  // --- ALCANCE ---
  { 
    id: 'qiang', 
    name: 'Qiang (Lança Clássica)', 
    category: 'alcance', 
    damage: '1d8', 
    cost: '8 TP', 
    allowedAttributes: ['vigor', 'agility'] 
  },
  { 
    id: 'bastao_longo', 
    name: 'Bastão Longo', 
    category: 'alcance', 
    damage: '1d8', 
    cost: '4 TP', 
    allowedAttributes: ['vigor', 'agility'] 
  },
  { 
    id: 'cajado_cerimonial', 
    name: 'Cajado Cerimonial', 
    category: 'alcance', 
    damage: '1d6', 
    cost: '6 TP', 
    allowedAttributes: ['discipline', 'vigor'] // Exemplo: Cajados podem usar Disciplina
  },

  // --- EXÓTICAS ---
  { 
    id: 'leque_ferro', 
    name: 'Leque de Ferro', 
    category: 'exotica', 
    damage: '1d4', 
    cost: '10 TP', 
    allowedAttributes: ['agility', 'presence'] 
  },
  { 
    id: 'corrente_secoes', 
    name: 'Corrente de Seções Múltiplas', 
    category: 'exotica', 
    damage: '1d8', 
    cost: '1 TO', 
    allowedAttributes: ['agility'] 
  },
  { 
    id: 'kusarigama', 
    name: 'Kusarigama', 
    category: 'exotica', 
    damage: '1d8', 
    cost: '80 TP', 
    allowedAttributes: ['agility'] 
  }
];