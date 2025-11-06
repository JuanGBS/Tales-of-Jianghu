import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { ATTRIBUTE_TRANSLATIONS } from '../../data/translations';
import { SparklesIcon, FireIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

const trainingOptions = [
  { id: 'technique', label: 'Treinar Técnica', icon: SparklesIcon, attribute: 'comprehension' },
  { id: 'body_refinement', label: 'Refino Corporal', icon: FireIcon, attribute: 'vigor' },
  { id: 'cultivation', label: 'Cultivo Espiritual', icon: ArrowTrendingUpIcon, attribute: 'discipline' },
];

function TrainingOptionsModal({ isOpen, onClose, characterAttributes, onTrain, character, showNotification }) {
  const [step, setStep] = useState('options');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [cdValue, setCdValue] = useState(10);

  const handleSelectTraining = (trainingType) => {
    const training = trainingOptions.find(opt => opt.id === trainingType);
    setSelectedTraining(training);
    setStep('cd_input');
  };

  const handleRoll = () => {
    const attributeValue = characterAttributes[selectedTraining.attribute];
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + attributeValue;
    const isSuccess = total >= cdValue;

    if (isSuccess) {
      showNotification('Treinamento bem-sucedido!', 'success');
      if (selectedTraining.id === 'body_refinement') {
        const currentLevel = character.bodyRefinementLevel || 0;
        onTrain({ bodyRefinementLevel: currentLevel + 1 });
      } else if (selectedTraining.id === 'cultivation') {
        const currentMastery = character.masteryLevel || 0;
        const currentStage = character.cultivationStage || 0;
        if (currentMastery < 3) {
          onTrain({ masteryLevel: currentMastery + 1 });
        } else {
          onTrain({ cultivationStage: currentStage + 1, masteryLevel: 1 });
        }
      }
    } else {
      showNotification('Falha no treinamento.', 'error');
    }
    
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('options');
    setSelectedTraining(null);
    setCdValue(10);
    onClose();
  };
  
  const renderContent = () => {
    if (step === 'cd_input') {
      return (
        <div className="text-center">
          <h3 className="text-xl font-bold text-brand-text mb-4">Treino de {selectedTraining.label}</h3>
          <label htmlFor="cd" className="block text-sm font-semibold text-gray-600 mb-2">
            Defina a Dificuldade do Teste (CD)
          </label>
          <input
            id="cd"
            type="number"
            value={cdValue}
            onChange={(e) => setCdValue(parseInt(e.target.value, 10) || 0)}
            className="w-32 p-2 text-center text-lg border rounded-md"
          />
          <div className="flex justify-center space-x-4 mt-6">
            <button onClick={() => setStep('options')} className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold">Voltar</button>
            <button onClick={handleRoll} className="px-6 py-2 bg-brand-primary text-brand-text font-bold rounded-md hover:brightness-105">Rolar Dado</button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-brand-text mb-6">Escolha seu Treinamento</h3>
        <div className="space-y-3">
          {trainingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button key={option.id} onClick={() => handleSelectTraining(option.id)} className="w-full flex items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors">
                <Icon className="h-6 w-6 text-purple-600 mr-4" />
                <span className="font-semibold text-brand-text">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      {renderContent()}
    </Modal>
  );
}

export default TrainingOptionsModal;