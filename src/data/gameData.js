import { SparklesIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/solid';

export const SKILL_TYPES = [
  { id: 'Ataque', label: 'Ataque', icon: SparklesIcon },
  { id: 'Suporte', label: 'Suporte', icon: ShieldCheckIcon },
  { id: 'Cura', label: 'Cura/Purificação', icon: HeartIcon }
];

export const ACTION_TYPES = [
  'Ação Maior',
  'Ação Menor',
  'Reação',
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