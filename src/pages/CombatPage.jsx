import React from 'react';
import { BoltIcon, ShieldCheckIcon, HandRaisedIcon, PlusCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

function CombatPage({ character, combatState, onNewTurn, openRollModal, onOpenAttackModal, onOpenMinorActionModal, onActionUsed, isMyTurn, onEndTurn }) {

  const handleDodge = () => {
    openRollModal({
      title: 'Teste de Esquiva',
      modifier: character.attributes.agility,
      modifierLabel: 'Agilidade'
    });
  };

  const handleBlock = () => {
    openRollModal({
      title: 'Teste de Bloqueio',
      modifier: character.attributes.vigor,
      modifierLabel: 'Vigor'
    });
  };
  
  const handleMovement = () => {
    if (combatState.actionsUsed.movement) return;
    onActionUsed('movement');
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh] h-full">
      <div className="flex justify-between items-center border-b pb-2 mb-4 flex-shrink-0">
        <h3 className="text-xl font-semibold text-brand-text">Painel de Combate</h3>
        {isMyTurn && <span className="text-sm font-bold text-green-600 animate-pulse">SEU TURNO</span>}
      </div>
      
      <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-700 text-sm">Ações no Turno</h4>
            <button onClick={onNewTurn} className="text-xs font-semibold text-purple-600 hover:text-purple-800">Novo Turno</button>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-2 rounded-lg text-center font-semibold">
            <button 
              onClick={handleMovement} 
              disabled={!isMyTurn || combatState.actionsUsed.movement}
              className={`py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                combatState.actionsUsed.movement 
                  ? 'line-through text-gray-400' 
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              Movimento
            </button>
            <span className={combatState.actionsUsed.major ? 'line-through text-gray-400 py-1' : 'text-gray-800 py-1'}>Ação Maior</span>
            <span className={combatState.actionsUsed.minor ? 'line-through text-gray-400 py-1' : 'text-gray-800 py-1'}>Ação Menor</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-gray-700 block text-sm mb-2">Ação Maior</h4>
            <button 
                onClick={onOpenAttackModal}
                disabled={!isMyTurn || combatState.actionsUsed.major}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-red-100 text-red-800 font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <BoltIcon className="h-5 w-5" />
                <span>Usar Ação</span>
            </button>
          </div>
          <div>
            <h4 className="font-bold text-gray-700 block text-sm mb-2">Ação Menor</h4>
            <button 
                onClick={onOpenMinorActionModal}
                disabled={!isMyTurn || combatState.actionsUsed.minor}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-100 text-blue-800 font-bold rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PlusCircleIcon className="h-5 w-5" />
                <span>Agir</span>
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-700 block text-sm mb-2">Defesa Ativa (Reação)</h4>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={handleDodge} className="flex items-center justify-center space-x-2 p-3 bg-green-100 text-green-800 font-bold rounded-lg hover:bg-green-200">
                <HandRaisedIcon className="h-5 w-5" />
                <span>Esquivar</span>
             </button>
             <button onClick={handleBlock} className="flex items-center justify-center space-x-2 p-3 bg-yellow-100 text-yellow-800 font-bold rounded-lg hover:bg-yellow-200">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Bloquear</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={onEndTurn}
          disabled={!isMyTurn}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircleIcon className="h-6 w-6" />
          <span>Finalizar Turno</span>
        </button>
      </div>
    </div>
  );
}

export default CombatPage;