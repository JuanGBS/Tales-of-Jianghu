// ARQUIVO: src/components/gm/StartCombatModal.jsx (ATUALIZADO)

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { UserIcon, UserPlusIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

function StartCombatModal({ isOpen, onClose, characters, onStartCombat }) {
  const [combatants, setCombatants] = useState([]); // Agora armazena objetos completos
  const [npcName, setNpcName] = useState('');
  const [npcInitiativeBonus, setNpcInitiativeBonus] = useState(0);

  // Adiciona um NPC à lista de combatentes
  const handleAddNpc = (e) => {
    e.preventDefault();
    if (!npcName) return;

    const newNpc = {
      id: `npc_${Date.now()}`, // ID único temporário
      name: npcName,
      image_url: null, // NPCs por padrão não têm imagem
      isNpc: true,
      attributes: {
        agility: npcInitiativeBonus, // O único atributo que precisamos para a iniciativa
      }
    };

    setCombatants(prev => [...prev, newNpc]);
    setNpcName('');
    setNpcInitiativeBonus(0);
  };

  const handleToggleParticipant = (char) => {
    const isSelected = combatants.some(c => c.id === char.id);
    if (isSelected) {
      setCombatants(prev => prev.filter(c => c.id !== char.id));
    } else {
      setCombatants(prev => [...prev, char]);
    }
  };

  const handleStart = () => {
    onStartCombat(combatants);
    handleClose();
  };

  const handleClose = () => {
    setCombatants([]);
    setNpcName('');
    setNpcInitiativeBonus(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-brand-text text-center">Iniciar Combate</h3>
        
        {/* Formulário para Adicionar NPC */}
        <form onSubmit={handleAddNpc} className="bg-gray-100 p-3 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm text-gray-600">Adicionar NPC/Inimigo</h4>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nome do Inimigo"
              value={npcName}
              onChange={(e) => setNpcName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Iniciativa (AGI)"
              value={npcInitiativeBonus}
              onChange={(e) => setNpcInitiativeBonus(parseInt(e.target.value, 10) || 0)}
              className="w-32 p-2 border rounded-md"
            />
            <button type="submit" className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              <UserPlusIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500">Selecione os participantes para a iniciativa.</p>
        
        {/* Lista de Participantes (Jogadores e NPCs) */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
          {[...characters, ...combatants.filter(c => c.isNpc)].map(char => {
            const isSelected = combatants.some(c => c.id === char.id);
            return (
              <button 
                key={char.id} 
                onClick={() => handleToggleParticipant(char)}
                className={`w-full flex items-center p-3 rounded-lg border-2 transition-colors ${
                  isSelected 
                    ? 'bg-purple-100 border-purple-400' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                  {char.image_url ? <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" /> 
                  : (char.isNpc ? <ShieldExclamationIcon className="h-5 w-5 text-red-400" /> : <UserIcon className="h-5 w-5 text-gray-400" />)}
                </div>
                <span className="font-semibold text-brand-text">{char.name}</span>
                {char.isNpc && <span className="ml-auto text-xs font-bold text-red-600">NPC</span>}
              </button>
            )
          })}
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-semibold">Cancelar</button>
          <button 
            type="button" 
            onClick={handleStart} 
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 shadow-sm disabled:opacity-50" 
            disabled={combatants.length === 0}
          >
            Iniciar Combate
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default StartCombatModal