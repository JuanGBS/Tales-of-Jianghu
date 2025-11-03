import React, { useState } from 'react';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from '../data/gameData';
import TrainingOptionsModal from './TrainingOptionsModal';

function ProgressionPage({ character, onTrain, showNotification }) {
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  
  const displayStyle = "w-full p-3 border bg-gray-100 rounded-md shadow-inner text-gray-800";

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh] h-full">
        <h3 className="text-xl font-semibold text-brand-text border-b pb-2 mb-4 flex-shrink-0">
          Progressão do Cultivador
        </h3>
        <div className="space-y-4 overflow-y-auto pr-2">
          <div>
            <label className="font-bold text-gray-700 block text-sm mb-1">Refino Corporal</label>
            <div className={displayStyle}>
              {BODY_REFINEMENT_LEVELS.find(l => l.id === (character.bodyRefinementLevel || 0))?.name}
            </div>
          </div>
          <div>
            <label className="font-bold text-gray-700 block text-sm mb-1">Estágio de Cultivo</label>
            <div className={displayStyle}>
              {CULTIVATION_STAGES.find(s => s.id === (character.cultivationStage || 0))?.name}
            </div>
          </div>
          <div>
            <label className="font-bold text-gray-700 block text-sm mb-1">Nível de Maestria</label>
            <div className={displayStyle}>
              {MASTERY_LEVELS.find(l => l.id === (character.masteryLevel || 0))?.name}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {MASTERY_LEVELS.find(l => l.id === (character.masteryLevel || 0))?.description}
            </p>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <button onClick={() => setIsTrainingModalOpen(true)} className="w-full bg-brand-primary hover:brightness-105 text-brand-text font-bold py-3 px-6 rounded-lg text-lg transition-all shadow-md">
            Iniciar Treinamento
          </button>
        </div>
      </div>
      <TrainingOptionsModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        characterAttributes={character.attributes}
        onTrain={onTrain}
        character={character}
        showNotification={showNotification}
      />
    </>
  );
}

export default ProgressionPage;