import React, { useState } from 'react';
import { CLANS_DATA } from '../data/clans';
import ClanSelector from './ClanSelector';
import AttributeDistributor from './AttributeDistributor';
import CalculatedStats from './CalculatedStats';
import FightingStyleSelector from './FightingStyleSelector';
import StyleInfoModal from './StyleInfoModal';
import characterArt from '../assets/character-art.png';

const initialCharacter = {
  name: 'Herói Sem Nome',
  clan: null,
  fightingStyle: '',
  bodyRefinementLevel: 0,
  cultivationStage: 0,
  masteryLevel: 0,
  distributedPoints: { vigor: 0, agility: 0, discipline: 0, comprehension: 0, presence: 0 },
  clanBonus: { vigor: 0, agility: 0, discipline: 0, comprehension: 0, presence: 0 },
  baseHp: 0,
  proficientPericias: [],
};

function SheetManager({ onSave }) {
  const [character, setCharacter] = useState(initialCharacter);
  const [isStyleInfoModalOpen, setIsStyleInfoModalOpen] = useState(false);

  const handleClanSelect = (clanId) => {
    const clanData = CLANS_DATA[clanId];
    setCharacter({
      ...initialCharacter,
      name: character.name,
      clan: clanId,
      distributedPoints: { vigor: 0, agility: 0, discipline: 0, comprehension: 0, presence: 0 },
      clanBonus: {
        vigor: clanData.attributeBonus.vigor || 0,
        agility: clanData.attributeBonus.agility || 0,
        discipline: clanData.attributeBonus.discipline || 0,
        comprehension: clanData.attributeBonus.comprehension || 0,
        presence: clanData.attributeBonus.presence || 0,
      },
      baseHp: clanData.baseHp,
      proficientPericias: clanData.proficientPericias,
    });
  };

  const handlePointsChange = (newPoints) => {
    setCharacter(prev => ({ ...prev, distributedPoints: newPoints }));
  };

  const handleStyleChange = (e) => {
    setCharacter(prev => ({ ...prev, fightingStyle: e.target.value }));
  };

  const finalAttributes = Object.keys(character.distributedPoints).reduce((acc, attr) => {
    acc[attr] = (character.clanBonus[attr] || 0) + (character.distributedPoints[attr] || 0);
    return acc;
  }, {});

  const calculatedStats = {
    maxHp: character.baseHp + finalAttributes.vigor,
    maxChi: 5 + finalAttributes.discipline,
    armorClass: 10 + finalAttributes.agility,
  };

  const handleFinishCreation = () => {
    const finalCharacterData = {
      name: character.name,
      clanId: character.clan,
      fightingStyle: character.fightingStyle,
      attributes: finalAttributes,
      stats: {
        ...calculatedStats,
        currentHp: calculatedStats.maxHp,
        currentChi: calculatedStats.maxChi,
      },
      proficientPericias: character.proficientPericias,
    };
    onSave(finalCharacterData);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-6xl font-bold text-center text-brand-primary mb-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
        Tales of Jianghu
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <label htmlFor="charName" className="text-xl font-semibold text-brand-text mb-2 block">Nome do Personagem</label>
            <input 
              type="text" 
              id="charName" 
              className="w-full bg-white border-2 border-gray-300 rounded-lg py-3 px-4 text-lg focus:outline-none focus:border-purple-400 shadow-md"
              value={character.name}
              onChange={(e) => setCharacter({ ...character, name: e.target.value })}
            />
          </div>
          {character.clan ? (
            <>
              <CalculatedStats stats={calculatedStats} />
              <AttributeDistributor points={character.distributedPoints} clanBonus={character.clanBonus} onPointsChange={handlePointsChange} />
            </>
          ) : (
            <div className="text-center text-gray-400 pt-16">
              <p>Selecione um clã para continuar a criação.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex justify-center -mx-8 hidden lg:flex self-end">
          <img 
            src={characterArt} 
            alt="Arte do Personagem" 
            className="max-h-[75vh] object-contain [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]" 
          />
        </div>

        <div className="lg:col-span-1 space-y-6 flex flex-col justify-between min-h-[500px]">
          <ClanSelector clans={CLANS_DATA} onClanSelect={handleClanSelect} selectedClan={character.clan} />
          
          {character.clan && (
            <div className="mt-auto">
              <FightingStyleSelector 
                selectedStyle={character.fightingStyle} 
                onStyleChange={handleStyleChange}
                onInfoClick={() => setIsStyleInfoModalOpen(true)}
              />
            </div>
          )}

          {character.clan && (
             <button
              onClick={handleFinishCreation}
              disabled={!character.fightingStyle}
              className="w-full bg-brand-primary hover:brightness-105 text-brand-text font-bold py-4 px-6 rounded-lg text-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finalizar Criação
            </button>
          )}
        </div>
      </div>
      
      <StyleInfoModal 
        isOpen={isStyleInfoModalOpen}
        onClose={() => setIsStyleInfoModalOpen(false)}
      />
    </div>
  );
}

export default SheetManager;