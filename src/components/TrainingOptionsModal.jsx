import React, { useState } from 'react';
import Modal from './Modal';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
import { SparklesIcon, FireIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

const trainingOptions = [
  { id: 'technique', label: 'Treinar Técnica', icon: SparklesIcon, attribute: 'comprehension' },
  { id: 'body_refinement', label: 'Refino Corporal', icon: FireIcon, attribute: 'vigor' },
  { id: 'cultivation', label: 'Cultivo Espiritual', icon: ArrowTrendingUpIcon, attribute: 'discipline' },
];

function TrainingOptionsModal({ isOpen, onClose, characterAttributes, onTrain, character }) {
  const [step, setStep] = useState('options');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [cdValue, setCdValue] = useState(10);
  const [rollResult, setRollResult] = useState(null);

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

    setRollResult({ roll, attributeValue, total, cd: cdValue, success: isSuccess });
    setStep('result');

    if (isSuccess) {
      if (selectedTraining.id === 'body_refinement') {
        const currentLevel = character.bodyRefinementLevel || 0;
        onTrain('bodyRefinementLevel', currentLevel + 1); 
      }
      if (selectedTraining.id === 'cultivation') {
        const currentMastery = character.masteryLevel || 0;
        const currentStage = character.cultivationStage || 0;
        
        if (currentMastery < 3) {
          onTrain('masteryLevel', currentMastery + 1);
        } else {
          onTrain('cultivationStage', currentStage + 1);
          onTrain('masteryLevel', 1);
        }
      }
      // A lógica para 'treinar técnica' será adicionada no futuro
    }
  };

  const resetAndClose = () => {
    setStep('options');
    setSelectedTraining(null);
    setCdValue(10);
    setRollResult(null);
    onClose();
  };
  
  const renderContent = () => {
    switch (step) {
      case 'cd_input':
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
      case 'result':
        return (
          <div className="text-center">
            <h3 className={`text-2xl font-bold ${rollResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {rollResult.success ? 'Sucesso!' : 'Falha!'}
            </h3>
            
            <div className="my-4 flex justify-center items-baseline space-x-4 text-gray-700 text-lg">
              <div className="flex flex-col items-center">
                <strong className="text-purple-700 text-3xl">{rollResult.roll}</strong>
                <span className="text-xs text-gray-500">Dado</span>
              </div>
              
              <span>+</span>

              <div className="flex flex-col items-center">
                <strong className="text-purple-700 text-3xl">{rollResult.attributeValue}</strong>
                <span className="text-xs text-gray-500">{ATTRIBUTE_TRANSLATIONS[selectedTraining.attribute]}</span>
              </div>

              <span>=</span>

              <div className="flex flex-col items-center">
                <strong className="text-3xl">{rollResult.total}</strong>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>

            <p className="text-sm text-gray-500">A dificuldade era {rollResult.cd}</p>
            <button onClick={resetAndClose} className="mt-6 px-6 py-2 bg-gray-700 text-white font-semibold rounded-md">Fechar</button>
          </div>
        );
      default: // 'options'
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
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      {renderContent()}
    </Modal>
  );
}

export default TrainingOptionsModal;