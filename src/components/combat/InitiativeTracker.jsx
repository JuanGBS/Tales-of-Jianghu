// ARQUIVO: src/components/combat/InitiativeTracker.jsx (NOVO ARQUIVO)

import React from 'react';
import { UserIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/solid';

function InitiativeTracker({ turnOrder, currentIndex }) {
  if (!turnOrder || turnOrder.length === 0) {
    return null;
  }

  const getVisibleParticipants = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % turnOrder.length;
      visible.push(turnOrder[index]);
    }
    return visible;
  };

  const visibleParticipants = getVisibleParticipants();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200">
      <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2 text-center">Iniciativa</h4>
      <div className="flex space-x-3">
        {visibleParticipants.map((participant, index) => (
          <div 
            key={participant.character_id + index} 
            className={`flex flex-col items-center transition-all duration-300 ${index === 0 ? 'scale-110' : 'opacity-60'}`}
          >
            <div 
              className={`w-16 h-16 rounded-lg bg-gray-200 overflow-hidden border-2 ${index === 0 ? 'border-purple-500' : 'border-transparent'}`}
            >
              {participant.image_url ? (
                <img src={participant.image_url} alt={participant.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-full h-full text-gray-400 p-2" />
              )}
            </div>
            <p className="text-sm font-semibold text-brand-text mt-1 truncate w-16 text-center">{participant.name}</p>
            {index === 0 && <ChevronDoubleRightIcon className="h-5 w-5 text-purple-500 absolute -bottom-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InitiativeTracker;