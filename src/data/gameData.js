import { SparklesIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/solid';

export const TECHNIQUE_TYPES   = [
  { id: 'Ataque', label: 'Ataque', icon: SparklesIcon },
  { id: 'Suporte', label: 'Suporte', icon: ShieldCheckIcon },
  { id: 'Cura', label: 'Cura/Purificação', icon: HeartIcon }
];

export const ACTION_TYPES = [
  'Ação Maior',
  'Ação Menor',
  'Reação',
  'Movimento',
  'Preparar Ação',
  'Nenhuma',
];

export const FIGHTING_STYLES = [
  { id: 'lâmina', name: 'Caminho da Lâmina' },
  { id: 'lança', name: 'Caminho da Lança' },
  { id: 'sombra', name: 'Caminho da Sombra' },
  { id: 'punho', name: 'Caminho do Punho' },
  { id: 'instrumentalista', name: 'Caminho do Instrumentalista' },
  { id: 'arco', name: 'Caminho do Arco' },
];

export const ATTRIBUTE_PERICIAS = {
  vigor: ['Resistência', 'Atletismo'],
  agility: ['Acrobacia', 'Furtividade', 'Prestidigitaçao', 'Reflexo'],
  discipline: ['Meditação', 'Força de Vontade', 'Controle do Chi'],
  comprehension: ['Conhecimento do Jianghu', 'Análise Tática', 'Percepção', 'Estratégia', 'Intuição'],
  presence: ['Persuasão', 'Liderança', 'Performance', 'Etiqueta Social', 'Intimidação'],
};

export const BODY_REFINEMENT_LEVELS = [
  { id: 0, name: 'Nenhum', multiplier: 1 },
  { id: 1, name: 'Nível 1: Pele de Ferro', multiplier: 1.2 },
  { id: 2, name: 'Nível 2: Ossos de Aço', multiplier: 1.5 },
  { id: 3, name: 'Nível 3: Coração Inabalável', multiplier: 1.8 },
  { id: 4, name: 'Nível 4: Músculos de Dragão', multiplier: 2.2 },
  { id: 5, name: 'Nível 5: Forja Dourada', multiplier: 2.8 },
  { id: 6, name: 'Nível 6: Vasculho Indestrutível', multiplier: 3.5 },
];

export const CULTIVATION_STAGES = [
  { id: 0, name: 'Estágio I (Praticante)', multiplier: 1 },
  { id: 1, name: 'Estágio II (Iniciado)', multiplier: 1.2 },
  { id: 2, name: 'Estágio III (Intermediário)', multiplier: 1.5 },
  { id: 3, name: 'Estágio IV (Especialista)', multiplier: 1.8 },
  { id: 4, name: 'Estágio V (Mestre)', multiplier: 2.2 },
];

export const MASTERY_LEVELS = [
  { id: 0, name: 'Nenhum', description: 'Ainda não iniciou a jornada.', bonus: 0 },
  { id: 1, name: 'Nível Inicial', description: 'Acesso a novas técnicas do estágio.', bonus: 0 },
  { id: 2, name: 'Nível Intermediário', description: 'Aumenta Pontos de Chi Máximos em +5.', bonus: 5 },
  { id: 3, name: 'Nível Especialista', description: 'Ganha um ponto para aumentar um atributo.', bonus: 0 }, 
];

export const COMBAT_MANEUVERS = [
  { 
    id: 'disarm', 
    name: 'Desarmar', 
    description: 'Teste de Vigor para o alvo manter a arma.',
    attribute: 'vigor',
  },
  { 
    id: 'push', 
    name: 'Empurrar', 
    description: 'Move o alvo 4,5 metros.',
    attribute: 'vigor',
  },
  { 
    id: 'trip', 
    name: 'Derrubar', 
    description: 'O alvo cai e tem desvantagem nos ataques.',
    attribute: 'agility',
  },
];

export const MINOR_ACTIONS = [
  {
    id: 'concentrate',
    name: 'Concentração',
    description: 'Manter técnicas que exigem foco.',
    rollable: true,
    skill: 'Controle do Chi',
    attribute: 'discipline'
  },
  {
    id: 'focused_attack',
    name: 'Ataque Concentrado',
    description: 'Sacrifica a Ação Menor para ganhar Vantagem no próximo ataque.',
    rollable: false,
  },
  {
    id: 'interact',
    name: 'Interagir com o Ambiente',
    description: 'Ações rápidas e simples como abrir uma porta ou pegar um item.',
    rollable: false,
  },
];

export const LIGHT_WEAPONS = [
  'Jian (Espada Reta)',
  'Dao Curto',
  'Fio de Aço',
  'Punhais Duplos',
  'Ganchos de Tigre',
];