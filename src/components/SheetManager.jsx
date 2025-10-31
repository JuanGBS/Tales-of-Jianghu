import React, { useState } from 'react';
import { CLANS_DATA } from '../data/clans';
import ClanSelector from './ClanSelector';
import AttributeDistributor from './AttributeDistributor';
import CalculatedStats from './CalculatedStats'; // O import já estava aqui, o que é bom
import characterArt from '../assets/character-art.png';

const initialCharacter = {
  name: 'Herói Sem Nome', clan: null,
  distributedPoints: { vigor: 0, agility: 0, discipline: 0, comprehension: 0, presence: 0 },
  clanBonus: { vigor: 0, agility: 0, discipline: 0, comprehension: 0, presence: 0 },
  baseHp: 0, proficientSkills: [],
};

function SheetManager({ onSave }) {
  const [character, setCharacter] = useState(initialCharacter);

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
      proficientSkills: clanData.skills,
    });
  };

  const handlePointsChange = (newPoints) => {
    setCharacter(prev => ({ ...prev, distributedPoints: newPoints }));
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
      attributes: finalAttributes,
      stats: {
        ...calculatedStats,
        currentHp: calculatedStats.maxHp,
        currentChi: calculatedStats.maxChi,
      },
      proficientSkills: character.proficientSkills,
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
              {/* --- A LINHA ABAIXO FOI RESTAURADA --- */}
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
             <button
              onClick={handleFinishCreation}
              className="w-full bg-brand-primary hover:brightness-105 text-brand-text font-bold py-4 px-6 rounded-lg text-xl transition-all shadow-lg"
            >
              Finalizar Criação
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SheetManager;