import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { ATTRIBUTE_TRANSLATIONS } from '../../data/translations';
import { SparklesIcon, FireIcon, ArrowTrendingUpIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const trainingOptions = [
  { id: 'common_training', label: 'Treinamento Comum', icon: UserGroupIcon, description: 'Aumente um atributo através de um teste.' },
  { id: 'body_refinement', label: 'Refino Corporal', icon: FireIcon, attribute: 'vigor', description: 'Aumenta seu nível de Refino Corporal.' },
  { id: 'cultivation', label: 'Cultivo Espiritual', icon: ArrowTrendingUpIcon, attribute: 'discipline', description: 'Progride em seu Estágio de Cultivo.' },
];

const ATTRIBUTES_KEYS = Object.keys(ATTRIBUTE_TRANSLATIONS);

function TrainingOptionsModal({ isOpen, onClose, character, showNotification, onTrain }) {
  const [step, setStep] = useState('options');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [cdValue, setCdValue] = useState(10);

  const handleSelectTraining = (training) => {
    setSelectedTraining(training);
    if (training.id === 'common_training') {
      setStep('attribute_selection');
    } else {
      setSelectedAttribute(training.attribute);
      setStep('cd_input');
    }
  };

  const handleAttributeSelect = (attributeKey) => {
    setSelectedAttribute(attributeKey);
    setStep('cd_input');
  };

  const handleRoll = () => {
    const attributeValue = character.attributes[selectedAttribute];
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + attributeValue;
    const isSuccess = total >= cdValue;

    if (isSuccess) {
      showNotification('Treinamento bem-sucedido!', 'success');
      
      if (selectedTraining.id === 'common_training') {
        onTrain({ type: 'attribute_increase', attribute: selectedAttribute });
      } else if (selectedTraining.id === 'body_refinement') {
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
    setSelectedAttribute(null);
    setCdValue(10);
    onClose();
  };
  
  const renderContent = () => {
    if (step === 'attribute_selection') {
      return (
        <div className="text-center">
          <h3 className="text-xl font-bold text-brand-text mb-4">Treinamento Comum</h3>
          <p className="text-gray-600 mb-6">Escolha o atributo que deseja treinar.</p>
          <div className="space-y-3">
            {ATTRIBUTES_KEYS.map(attrKey => (
              <button key={attrKey} onClick={() => handleAttributeSelect(attrKey)} className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left font-semibold">
                {ATTRIBUTE_TRANSLATIONS[attrKey]}
              </button>
            ))}
          </div>
           <button onClick={() => setStep('options')} className="mt-6 px-6 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold">Voltar</button>
        </div>
      );
    }

    if (step === 'cd_input') {
      return (
        <div className="text-center">
          <h3 className="text-xl font-bold text-brand-text mb-2">Treino de {selectedTraining.label}</h3>
          <p className="text-gray-500 mb-4">Teste de <span className="font-bold">{ATTRIBUTE_TRANSLATIONS[selectedAttribute]}</span></p>
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
            <button onClick={() => setStep(selectedTraining.id === 'common_training' ? 'attribute_selection' : 'options')} className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold">Voltar</button>
            <button onClick={handleRoll} className="px-6 py-2 bg-brand-primary text-brand-text font-bold rounded-md hover:brightness-105">Rolar Dado</button>
          </div>
        </div>
      );
    }
    
    // Step: 'options'
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-brand-text mb-6">Escolha seu Treinamento</h3>
        <div className="space-y-3">
          {trainingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button key={option.id} onClick={() => handleSelectTraining(option)} className="w-full flex items-start p-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors">
                <Icon className="h-6 w-6 text-purple-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-brand-text">{option.label}</span>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
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