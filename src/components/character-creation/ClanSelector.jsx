import React from 'react';
// ÍCONES ATUALIZADOS E MAIS TEMÁTICOS
import { 
  ShieldCheckIcon, // Para Wáng (Resiliência, Proteção)
  BoltIcon,        // Para Míng (Trovão, Velocidade)
  HeartIcon,       // Para Sūn (Tenacidade, Vitalidade)
  AcademicCapIcon, // Para Zhū (Sabedoria, Estratégia)
  CheckBadgeIcon 
} from '@heroicons/react/24/solid';

// MAPEAMENTO DE ÍCONES ATUALIZADO
const clanIcons = {
  wang: ShieldCheckIcon,
  ming: BoltIcon,
  sun: HeartIcon,
  zhu: AcademicCapIcon,
};

function ClanSelector({ clans, onClanSelect, selectedClan }) {
  const selectedClanData = selectedClan ? clans[selectedClan] : null;

  return (
    <div>
      <h3 className="text-xl font-semibold text-brand-text mb-4">Escolha seu Clã</h3>
      <div className="flex justify-around items-center mb-4">
        {Object.values(clans).map((clan) => {
          const Icon = clanIcons[clan.id];
          return (
            <button
              key={clan.id}
              onClick={() => onClanSelect(clan.id)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
                selectedClan === clan.id ? 'bg-brand-accent scale-110 shadow-lg' : 'bg-white'
              }`}
            >
              <Icon className={`h-8 w-8 ${selectedClan === clan.id ? 'text-white' : 'text-gray-500'}`} />
            </button>
          );
        })}
      </div>

      <div className="bg-brand-accent/80 p-6 rounded-3xl text-center min-h-[150px] flex flex-col items-center justify-center shadow-lg">
        {selectedClanData ? (
          <>
            <CheckBadgeIcon className="h-8 w-8 text-purple-900 mb-2" />
            <h4 className="text-2xl font-bold text-purple-900">{selectedClanData.name}</h4>
            <p className="text-sm text-purple-900/80 mt-1">{selectedClanData.description}</p>
          </>
        ) : (
          <p className="text-gray-600/70">Selecione um clã acima</p>
        )}
      </div>
    </div>
  );
}

export default ClanSelector;