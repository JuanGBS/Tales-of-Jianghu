import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

const getRandomRoll = () => Math.floor(Math.random() * 20) + 1;

function AttributeRollModal({ isOpen, onClose, attributeName, attributeValue, onRollComplete }) {
  const [rollResult, setRollResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(null);

  useEffect(() => {
    if (!isRolling) return;

    const timeouts = [];
    const finalRoll = rollResult.roll;

    for (let i = 0; i < 8; i++) {
      timeouts.push(setTimeout(() => setDisplayNumber(getRandomRoll()), i * 50));
    }
    for (let i = 0; i < 5; i++) {
      timeouts.push(setTimeout(() => setDisplayNumber(getRandomRoll()), 400 + i * 120));
    }
    for (let i = 0; i < 3; i++) {
      timeouts.push(setTimeout(() => setDisplayNumber(getRandomRoll()), 1000 + i * 250));
    }
    timeouts.push(setTimeout(() => {
      setDisplayNumber(finalRoll);
      setIsRolling(false);
      onRollComplete(rollResult); 
    }, 1750));

    return () => timeouts.forEach(clearTimeout);

  }, [isRolling, rollResult, onRollComplete]);

  const handleRoll = (mode = 'normal') => {
    if (isRolling) return;

    const roll1 = getRandomRoll();
    const roll2 = getRandomRoll();
    
    let finalRoll;
    let rolls = [roll1];

    if (mode === 'advantage') {
      finalRoll = Math.max(roll1, roll2);
      rolls.push(roll2);
    } else if (mode === 'disadvantage') {
      finalRoll = Math.min(roll1, roll2);
      rolls.push(roll2);
    } else {
      finalRoll = roll1;
    }
    
    setRollResult({
      roll: finalRoll,
      rolls: rolls,
      total: finalRoll + attributeValue,
      mode: mode,
    });

    setIsRolling(true);
  };

  const handleClose = () => {
    setRollResult(null);
    setIsRolling(false);
    setDisplayNumber(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-brand-text mb-4">Teste de {attributeName}</h3>
        
        {rollResult ? (
          <div>
            <div className="my-4 flex justify-center items-baseline space-x-4 text-gray-700 text-lg">
              <div className="flex flex-col items-center">
                <strong className="text-purple-700 text-4xl w-16">
                  {isRolling ? displayNumber : rollResult.roll}
                </strong>
                <span className="text-xs text-gray-500">
                  {rollResult.mode !== 'normal' && !isRolling ? `(${rollResult.rolls.join(', ')})` : 'Dado'}
                </span>
              </div>
              <span>+</span>
              <div className="flex flex-col items-center">
                <strong className="text-purple-700 text-4xl">{attributeValue}</strong>
                <span className="text-xs text-gray-500">{attributeName}</span>
              </div>
              <span>=</span>
              <div className="flex flex-col items-center">
                <strong className="text-4xl w-16">
                  {isRolling ? '...' : rollResult.total}
                </strong>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
            <button
              onClick={() => { setRollResult(null); setDisplayNumber(null); }}
              disabled={isRolling}
              className="mt-6 px-6 py-2 bg-gray-200 text-brand-text font-semibold rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Voltar
            </button>
          </div>
        ) : (
          <div className="py-8 space-y-4">
            <button
              onClick={() => handleRoll('normal')}
              className="w-full px-8 py-3 bg-brand-primary text-brand-text font-bold text-lg rounded-md hover:brightness-105 shadow-lg"
            >
              Rolar d20
            </button>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleRoll('disadvantage')}
                className="px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-md hover:bg-red-200"
              >
                Desvantagem
              </button>
              <button
                onClick={() => handleRoll('advantage')}
                className="px-6 py-2 bg-green-100 text-green-700 font-semibold rounded-md hover:bg-green-200"
              >
                Vantagem
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AttributeRollModal;