import React, { useState } from 'react';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from '../data/gameData';
import TrainingOptionsModal from './TrainingOptionsModal';

function ProgressionPage({ character, onProgressionChange }) {
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  
  const inputStyle = "w-full p-2 border bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm text-gray-700";

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh] h-full">
        <h3 className="text-xl font-semibold text-brand-text border-b pb-2 mb-4 flex-shrink-0">
          Progressão do Cultivador
        </h3>
        
        <div className="space-y-4 overflow-y-auto pr-2">
          <div>
            <label htmlFor="bodyRefinement" className="font-bold text-gray-700 block text-sm mb-1">Refino Corporal</label>
            <select 
              id="bodyRefinement" 
              value={character.bodyRefinementLevel || 0}
              onChange={(e) => onProgressionChange('bodyRefinementLevel', parseInt(e.target.value, 10))}
              className={inputStyle}
            >
              {BODY_REFINEMENT_LEVELS.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cultivationStage" className="font-bold text-gray-700 block text-sm mb-1">Estágio de Cultivo</label>
            <select 
              id="cultivationStage" 
              value={character.cultivationStage || 0}
              onChange={(e) => onProgressionChange('cultivationStage', parseInt(e.target.value, 10))}
              className={inputStyle}
            >
              {CULTIVATION_STAGES.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="masteryLevel" className="font-bold text-gray-700 block text-sm mb-1">Nível de Maestria</label>
            <select 
              id="masteryLevel" 
              value={character.masteryLevel || 0}
              onChange={(e) => onProgressionChange('masteryLevel', parseInt(e.target.value, 10))}
              className={inputStyle}
            >
              {MASTERY_LEVELS.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {MASTERY_LEVELS.find(l => l.id === (character.masteryLevel || 0))?.description}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button 
            onClick={() => setIsTrainingModalOpen(true)}
            className="w-full bg-brand-primary hover:brightness-105 text-brand-text font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-md"
          >
            Iniciar Treinamento
          </button>
        </div>
      </div>

      <TrainingOptionsModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        characterAttributes={character.attributes}
      />
    </>
  );
}

export default ProgressionPage;