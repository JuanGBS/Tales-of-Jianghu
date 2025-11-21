import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import { CubeIcon, FireIcon } from '@heroicons/react/24/solid';
import { parseDiceString, rollDice } from '../../utils/dice';

function RollTestModal({ isOpen, onClose, title, modifier, modifierLabel, diceFormula, onRollComplete }) {
  const [displayNumber, setDisplayNumber] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reseta estados ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setFinalResult(null);
      setDisplayNumber(null);
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleRoll = (mode = 'normal') => {
    if (isAnimating || finalResult) return; // Bloqueia múltiplos cliques

    setIsAnimating(true);
    let result = {};

    // 1. Calcula o resultado IMEDIATAMENTE (Lógica Matemática)
    if (diceFormula) {
        const diceConfig = parseDiceString(diceFormula);
        const { total: diceTotal, rolls } = rollDice(diceConfig.count, diceConfig.faces);
        const totalMod = diceConfig.modifier + (modifier || 0);
        
        result = {
            roll: diceTotal,
            rolls: rolls,
            total: diceTotal + totalMod,
            modifier: totalMod,
            mode: 'damage',
            formula: diceFormula,
            name: title // Passa o nome para o log
        };
    } else {
        const roll1 = Math.floor(Math.random() * 20) + 1;
        const roll2 = Math.floor(Math.random() * 20) + 1;
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

        result = {
            roll: finalRoll,
            rolls: rolls,
            total: finalRoll + modifier,
            modifier: modifier,
            mode: mode,
            name: title // Passa o nome para o log
        };
    }

    // 2. Inicia a Animação Visual
    const maxVal = diceFormula ? 20 : 20; // Valor arbitrário para animação visual
    const timeouts = [];
    
    for (let i = 0; i < 10; i++) {
      timeouts.push(setTimeout(() => {
        setDisplayNumber(Math.floor(Math.random() * maxVal) + 1);
      }, i * 80));
    }

    // 3. Finaliza e entrega o resultado
    timeouts.push(setTimeout(() => {
      setDisplayNumber(null);
      setIsAnimating(false);
      setFinalResult(result);
      
      // Chama o callback do pai com o resultado calculado
      if (onRollComplete) {
        onRollComplete(result);
      }
    }, 900));
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="text-center p-4">
        {finalResult ? (
          <div>
            <div className="flex flex-col items-center justify-center mb-4">
              {diceFormula ? <FireIcon className="h-10 w-10 text-red-600 mb-2" /> : <CubeIcon className="h-10 w-10 text-purple-600 mb-2" />}
              <h3 className="text-2xl font-bold text-brand-text">{title}</h3>
            </div>
            <div className="my-6 flex justify-center items-baseline space-x-4 text-gray-700 text-lg">
              {/* Resultado dos Dados */}
              <div className="flex flex-col items-center">
                <strong className={`text-5xl w-24 ${diceFormula ? 'text-red-600' : 'text-purple-700'}`}>
                  {finalResult.roll}
                </strong>
                <span className="text-xs text-gray-500">
                  {diceFormula ? `(${finalResult.rolls.join(' + ')})` : 'Dado'}
                </span>
              </div>

              <span className="text-3xl font-light text-gray-400">+</span>

              {/* Modificador */}
              <div className="flex flex-col items-center">
                <strong className="text-purple-700 text-5xl">{finalResult.modifier}</strong>
                <span className="text-xs text-gray-500">{modifierLabel || 'Bônus'}</span>
              </div>

              <span className="text-3xl font-light text-gray-400">=</span>

              {/* Total Final */}
              <div className="flex flex-col items-center">
                <strong className="text-6xl w-24 text-brand-text">
                  {finalResult.total}
                </strong>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
            <button
              onClick={handleClose} // Botão agora apenas fecha, já que onRollComplete foi chamado
              className="mt-6 px-8 py-2 bg-gray-200 text-brand-text font-semibold rounded-lg hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center justify-center mb-6">
              {diceFormula ? <FireIcon className="h-12 w-12 text-red-600 mb-2" /> : <CubeIcon className="h-12 w-12 text-purple-600 mb-2" />}
              <h3 className="text-2xl font-bold text-brand-text">{title}</h3>
              <p className="text-gray-500 mt-1">
                {isAnimating ? 'Rolando...' : (diceFormula 
                  ? `Dano: ${diceFormula} + ${modifier}` 
                  : `1d20 + ${modifier} (${modifierLabel})`
                )}
              </p>
            </div>
            
            {/* Botões desabilitados durante animação */}
            {diceFormula ? (
                <button
                    onClick={() => handleRoll('normal')}
                    disabled={isAnimating}
                    className="w-full px-8 py-4 bg-red-600 text-white font-bold text-xl rounded-xl hover:bg-red-700 shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                    {isAnimating ? displayNumber : <><FireIcon className="h-6 w-6" /> Rolar Dano</>}
                </button>
            ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => handleRoll('normal')}
                    disabled={isAnimating}
                    className="w-full px-8 py-4 bg-brand-primary text-brand-text font-bold text-xl rounded-xl hover:brightness-105 shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {isAnimating ? displayNumber : 'Rolar D20'}
                  </button>
                  {!isAnimating && (
                    <>
                        <div className="flex items-center text-gray-400 pt-2">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-xs font-semibold">OU ROLAR COM</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleRoll('disadvantage')} className="w-full px-6 py-3 bg-red-100 text-red-800 font-bold rounded-xl hover:bg-red-200">Desvantagem</button>
                            <button onClick={() => handleRoll('advantage')} className="w-full px-6 py-3 bg-green-100 text-green-800 font-bold rounded-xl hover:bg-green-200">Vantagem</button>
                        </div>
                    </>
                  )}
                </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default RollTestModal;