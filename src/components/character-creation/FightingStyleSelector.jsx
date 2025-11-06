import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { FIGHTING_STYLES } from "../../data/gameData"

function FightingStyleSelector({ selectedStyle, onStyleChange, onInfoClick }) {
  const inputStyle = "w-full p-3 border bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm text-gray-700 appearance-none";
  
  return (
    <div>
      <label htmlFor="fightingStyle" className="text-xl font-semibold text-brand-text mb-2 block">
        Escolha seu Estilo de Luta
      </label>
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <select 
            id="fightingStyle" 
            value={selectedStyle} 
            onChange={onStyleChange}
            className={inputStyle}
          >
            <option value="" disabled>Selecione um Estilo...</option>
            {FIGHTING_STYLES.map(style => (
              <option key={style.id} value={style.id}>{style.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        <button 
          type="button" 
          onClick={onInfoClick}
          className="p-3 bg-white rounded-md shadow-sm border text-gray-400 hover:text-purple-600 hover:border-purple-400 transition-colors"
        >
          <InformationCircleIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export default FightingStyleSelector;