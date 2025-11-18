// ARQUIVO: src/components/character-sheet/MinorActionModal.jsx (ATUALIZADO)

import React from 'react';
import Modal from '../ui/Modal';
import { MINOR_ACTIONS, LIGHT_WEAPONS } from '../../data/gameData'; // Importei LIGHT_WEAPONS para a verificação do segundo ataque
import { ViewfinderCircleIcon, SparklesIcon, BoltIcon, PuzzlePieceIcon } from '@heroicons/react/24/solid'; // Adicionei BoltIcon e PuzzlePieceIcon

function MinorActionModal({ isOpen, onClose, character, onSelectAction }) {
  const supportTechniques = character.techniques?.filter(
    t => t.type === 'Suporte' || t.type === 'Cura'
  ) || [];

  const equippedWeaponName = character.inventory?.weapon?.name || '';
  const isWieldingLightWeapon = LIGHT_WEAPONS.includes(equippedWeaponName);

  const handleSelect = (action) => {
    onSelectAction(action);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-brand-text mb-6">Escolha sua Ação Menor</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          
          {/* Ação Condicional de Arma Leve */}
          {isWieldingLightWeapon && (
            <div>
              <h4 className="font-bold text-gray-500 text-sm mb-2 text-left">Ação de Arma</h4>
              <button 
                onClick={() => handleSelect({ id: 'second_attack', name: 'Segundo Ataque', description: 'Realiza um ataque adicional com sua arma leve.' })} 
                className="w-full flex items-center p-3 mb-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-left transition-colors"
              >
                <BoltIcon className="h-6 w-6 text-yellow-700 mr-4 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-yellow-800">Segundo Ataque</span>
                  <p className="text-xs text-yellow-700">Realiza um ataque adicional com sua arma leve.</p>
                </div>
              </button>
            </div>
          )}

          <div>
            <h4 className="font-bold text-gray-500 text-sm mb-2 text-left">Ações Comuns</h4>
            {MINOR_ACTIONS.map((action) => (
              <button 
                key={action.id} 
                onClick={() => handleSelect(action)} 
                className="w-full flex items-center p-3 mb-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
              >
                <ViewfinderCircleIcon className="h-6 w-6 text-gray-500 mr-4 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-brand-text">{action.name}</span>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>

          {supportTechniques.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-500 text-sm mb-2 text-left">Técnicas de Suporte</h4>
              {supportTechniques.map((tech, index) => (
                <button 
                  key={index} 
                  onClick={() => handleSelect(tech)} 
                  className="w-full flex items-center p-3 mb-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
                >
                  <SparklesIcon className="h-6 w-6 text-blue-500 mr-4 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-brand-text">{tech.name}</span>
                    <p className="text-xs text-gray-500">{tech.effect.substring(0, 70)}...</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default MinorActionModal;