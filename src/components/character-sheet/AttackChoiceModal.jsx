// ARQUIVO: src/components/character-sheet/AttackChoiceModal.jsx (NOVO ARQUIVO)

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { BoltIcon, SparklesIcon, PuzzlePieceIcon } from '@heroicons/react/24/solid';
import { COMBAT_MANEUVERS } from '../../data/gameData';

function AttackChoiceModal({ isOpen, onClose, character, onSelectAction }) {
  const [view, setView] = useState('main'); // 'main', 'techniques', 'maneuvers'

  const weapon = character.inventory?.weapon || { attribute: 'Agilidade', name: 'Desarmado' };
  const combatTechniques = character.techniques?.filter(t => t.type === 'Ataque') || [];

  const handleSelect = (type, data) => {
    onSelectAction(type, data);
    handleClose();
  };

  const handleClose = () => {
    setView('main');
    onClose();
  };

  const renderContent = () => {
    if (view === 'techniques') {
      return (
        <div>
          <h3 className="text-xl font-bold text-brand-text text-center mb-4">Escolha a Técnica</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {combatTechniques.length > 0 ? combatTechniques.map((tech, index) => (
              <button key={index} onClick={() => handleSelect('technique', tech)} className="w-full p-3 bg-gray-100 hover:bg-purple-100 rounded-lg text-left">
                <p className="font-semibold">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.effect.substring(0, 50)}...</p>
              </button>
            )) : <p className="text-center text-gray-400">Nenhuma técnica de ataque aprendida.</p>}
          </div>
          <button onClick={() => setView('main')} className="mt-4 text-sm text-gray-500 hover:text-gray-800">Voltar</button>
        </div>
      );
    }

    if (view === 'maneuvers') {
      return (
        <div>
          <h3 className="text-xl font-bold text-brand-text text-center mb-4">Escolha a Manobra</h3>
          <div className="space-y-2">
            {COMBAT_MANEUVERS.map((maneuver) => (
              <button key={maneuver.id} onClick={() => handleSelect('maneuver', maneuver)} className="w-full p-3 bg-gray-100 hover:bg-purple-100 rounded-lg text-left">
                <p className="font-semibold">{maneuver.name}</p>
                <p className="text-xs text-gray-500">{maneuver.description}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setView('main')} className="mt-4 text-sm text-gray-500 hover:text-gray-800">Voltar</button>
        </div>
      );
    }

    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold text-brand-text mb-6">Escolha sua Ação</h3>
        <div className="space-y-3">
          <button onClick={() => handleSelect('weapon', weapon)} className="w-full flex items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors">
            <BoltIcon className="h-6 w-6 text-red-500 mr-4" />
            <div>
              <span className="font-semibold text-brand-text">Ataque com Arma</span>
              <p className="text-sm text-gray-500">{weapon.name}</p>
            </div>
          </button>
          <button onClick={() => setView('techniques')} className="w-full flex items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors">
            <SparklesIcon className="h-6 w-6 text-blue-500 mr-4" />
            <div>
              <span className="font-semibold text-brand-text">Usar Técnica de Combate</span>
              <p className="text-sm text-gray-500">{combatTechniques.length} técnica(s) disponível(is)</p>
            </div>
          </button>
          <button onClick={() => setView('maneuvers')} className="w-full flex items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors">
            <PuzzlePieceIcon className="h-6 w-6 text-green-500 mr-4" />
            <div>
              <span className="font-semibold text-brand-text">Realizar Manobra</span>
              <p className="text-sm text-gray-500">Desarmar, Empurrar, Derrubar...</p>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {renderContent()}
    </Modal>
  );
}

export default AttackChoiceModal;