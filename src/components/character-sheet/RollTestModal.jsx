import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { CubeIcon } from '@heroicons/react/24/solid';

const getRandomRoll = () => Math.floor(Math.random() * 20) + 1;

function RollTestModal({ isOpen, onClose, title, modifier, modifierLabel, onRollComplete }) {
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
      total: finalRoll + modifier,
      modifier: modifier,
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
      <div className="text-center p-4">
        {rollResult ? (
          <div>
            <div className="flex flex-col items-center justify-center mb-4">
              <CubeIcon className="h-10 w-10 text-purple-600 mb-2" />
              <h3 className="text-2xl font-bold text-brand-text">{title}</h3>
            </div>
            <div className="my-6 flex justify-center items-baseline space-x-4 text-gray-700 text-lg">
              <div className="flex flex-col items-center">
                <strong className="text-purple-700 text-5xl w-20">
                  {isRolling ? displayNumber : rollResult.roll}
                </strong>
                <span className="text-xs text-gray-500">
                  {rollResult.mode !== 'normal' && !isRolling ? `(${rollResult.rolls.join(', ')})` : 'Dado'}
                </span>
              </div>
              <span className="text-3xl font-light text-gray-400">+</span>
              <div className="flex flex-col items-center">
                <strong className="text-purple-700 text-5xl">{rollResult.modifier}</strong>
                <span className="text-xs text-gray-500">{modifierLabel}</span>
              </div>
              <span className="text-3xl font-light text-gray-400">=</span>
              <div className="flex flex-col items-center">
                <strong className="text-5xl w-20 text-brand-text">
                  {isRolling ? '...' : rollResult.total}
                </strong>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
            <button
              onClick={() => { setRollResult(null); setDisplayNumber(null); }}
              disabled={isRolling}
              className="mt-6 px-8 py-2 bg-gray-200 text-brand-text font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Rolar Novamente
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center justify-center mb-6">
              <CubeIcon className="h-12 w-12 text-purple-600 mb-2" />
              <h3 className="text-2xl font-bold text-brand-text">{title}</h3>
              <p className="text-gray-500 mt-1">Role um dado e some seu bônus de +{modifier}.</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleRoll('normal')}
                className="w-full px-8 py-4 bg-brand-primary text-brand-text font-bold text-xl rounded-xl hover:brightness-105 shadow-lg transition-all transform hover:scale-105"
              >
                Rolar D20
              </button>
              <div className="flex items-center text-gray-400 pt-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold">OU ROLAR COM</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleRoll('disadvantage')} 
                  className="w-full px-6 py-3 bg-red-100 text-red-800 font-bold rounded-xl hover:bg-red-200 hover:shadow-md transition-all"
                >
                  Desvantagem
                </button>
                <button 
                  onClick={() => handleRoll('advantage')} 
                  className="w-full px-6 py-3 bg-green-100 text-green-800 font-bold rounded-xl hover:bg-green-200 hover:shadow-md transition-all"
                >
                  Vantagem
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default RollTestModal;