import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon, FireIcon } from '@heroicons/react/24/solid';

function RollHistoryDrawer({ history, isOpen, onToggle, onClearHistory, onRollDamage }) {
  const drawerWidth = 320;

  const horizontalTransform = isOpen ? 'translateX(0)' : `translateX(${drawerWidth}px)`;
  const verticalTransform = 'translateY(-50%)';

  return (
    <div 
      className="fixed top-1/2 right-0 flex items-center z-40 transition-transform duration-300 ease-in-out"
      style={{ transform: `${horizontalTransform} ${verticalTransform}` }}
    >
      <button 
        onClick={onToggle} 
        className="bg-white h-24 w-8 rounded-l-full shadow-lg flex items-center justify-center"
      >
        {isOpen ? <ChevronRightIcon className="h-6 w-6 text-gray-600" /> : <ChevronLeftIcon className="h-6 w-6 text-gray-600" />}
      </button>
      
      <div 
        className="bg-white h-[90vh] p-6 shadow-2xl flex flex-col rounded-l-2xl"
        style={{ width: `${drawerWidth}px` }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-brand-text">Histórico</h3>
          {history.length > 0 && (
            <button 
              onClick={onClearHistory} 
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 font-semibold transition-colors"
              title="Limpar histórico"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {history.length > 0 ? (
            history.map((item, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded-lg text-sm shadow-sm border border-gray-200">
                <p className="font-bold text-gray-800">{item.name}</p>
                <p className="text-gray-600 mb-2">
                  Resultado: <span className="font-bold text-lg text-purple-700">{item.total}</span> 
                  <span className="text-xs ml-1">({item.roll} + {item.modifier})</span>
                </p>

                {/* BOTÃO DE DANO (Se houver fórmula e não for um log de dano já) */}
                {item.damageFormula && (
                  <button 
                    onClick={() => onRollDamage(item)}
                    className="w-full py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 rounded flex items-center justify-center gap-2 transition-colors font-bold text-xs"
                  >
                    <FireIcon className="h-4 w-4" />
                    Rolar Dano ({item.damageFormula})
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-center text-gray-400">Nenhuma rolagem realizada ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RollHistoryDrawer;