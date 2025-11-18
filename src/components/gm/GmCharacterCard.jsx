// ARQUIVO: src/components/gm/GmCharacterCard.jsx

import React from 'react';
import { CLANS_DATA } from '../../data/clans';
import { UserIcon } from '@heroicons/react/24/solid';

function GmCharacterCard({ character, onViewCharacter }) {
  const clan = CLANS_DATA[character.clan_id] || { name: 'Clã Desconhecido' };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:border-purple-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-brand-text">{character.name}</h3>
          <p className="text-sm text-gray-500 font-semibold">{clan.name}</p>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {character.image_url ? (
            <img src={character.image_url} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="h-8 w-8 text-gray-400" />
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-end space-x-2">
          <button className="text-sm font-semibold text-gray-500 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md">Editar</button>
          {/* O onClick agora chama a função recebida via prop */}
          <button 
            onClick={() => onViewCharacter(character)}
            className="text-sm font-semibold text-white bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded-md"
          >
            Ver Ficha
          </button>
        </div>
      </div>
    </div>
  );
}

export default GmCharacterCard;