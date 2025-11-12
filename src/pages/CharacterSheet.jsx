import React, { useState, useRef } from 'react';
import { CLANS_DATA } from '../data/clans';
import { FIGHTING_STYLES, BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from '../data/gameData';
import { INNATE_BODIES } from '../data/innateBodies';
import characterArt from '../assets/character-art.png';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
import { ATTRIBUTE_PERICIAS } from '../data/gameData';
import TechniquesPage from '../components/character-sheet/TechniquesPage';
import ProgressionPage from '../components/character-sheet/ProgressionPage';
import InventoryPage from './InventoryPage'; // Importa a nova página
import SheetNavigation from '../components/character-sheet/SheetNavigation';
import EditableStat from '../components/ui/EditableStat';
import Modal from '../components/ui/Modal';
import TechniqueCreatorForm from '../components/character-sheet/TechniqueCreatorForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import RollTestModal from '../components/character-sheet/RollTestModal';
import { PhotoIcon, StarIcon } from '@heroicons/react/24/solid';

function CharacterSheet({ character, onDelete, onUpdateCharacter, showNotification, addRollToHistory, onOpenImageTray, onTrain }) {
  const clan = CLANS_DATA[character.clanId];
  const innateBodyData = INNATE_BODIES.find(body => body.id === character.innateBodyId) || { effects: {} };

  const [activeTab, setActiveTab] = useState('sheet');
  const [editingTechnique, setEditingTechnique] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rollModalData, setRollModalData] = useState(null);
  const [hoveredAttribute, setHoveredAttribute] = useState(null);
  const hoverTimeoutRef = useRef(null);
  
  const isFormModalOpen = isCreating || editingTechnique !== null;
  const anyModalIsOpen = isFormModalOpen || isDeleteModalOpen || rollModalData !== null;

  // Cálculos de Status
  const initialClanHp = CLANS_DATA[character.clanId]?.baseHp || 0;
  const innateHpBonus = innateBodyData.effects?.stat_bonus?.baseHp || 0;
  const effectiveBaseHp = initialClanHp + innateHpBonus;
  const refinementLevel = BODY_REFINEMENT_LEVELS.find(l => l.id === (character.bodyRefinementLevel || 0));
  const refinementMultiplierBonus = innateBodyData.effects?.body_refinement_multiplier_bonus || 0;
  const finalRefinementMultiplier = (refinementLevel?.multiplier || 1) + (refinementLevel && refinementLevel.id > 0 ? refinementMultiplierBonus : 0);
  const displayMaxHp = Math.floor(effectiveBaseHp * finalRefinementMultiplier) + character.attributes.vigor;
  const baseChi = 5 + character.attributes.discipline;
  const cultivationMultiplier = CULTIVATION_STAGES.find(s => s.id === (character.cultivationStage || 0))?.multiplier || 1;
  const masteryLevelValue = character.masteryLevel || 0;
  const masteryFlatBonus = MASTERY_LEVELS.find(l => l.id === masteryLevelValue)?.bonus || 0;
  const innateChiPerMastery = innateBodyData.effects?.max_chi_per_mastery || 0;
  const displayMaxChi = Math.floor(baseChi * cultivationMultiplier) + masteryFlatBonus + (masteryLevelValue * innateChiPerMastery);

  // Manipuladores de estado
  const handleStatChange = (statKey, newValue) => {
    const validatedValue = Math.max(0, newValue);
    const updatedCharacter = { ...character, stats: { ...character.stats, [statKey]: validatedValue } };
    onUpdateCharacter(updatedCharacter);
  };
  
  const handleTechniquesUpdate = (techniqueData) => {
    let updatedTechniques;
    if (editingTechnique) {
      updatedTechniques = (character.techniques || []).map((t, i) => i === editingTechnique.index ? techniqueData : t);
    } else {
      updatedTechniques = [...(character.techniques || []), techniqueData];
    }
    onUpdateCharacter({ ...character, techniques: updatedTechniques });
  };
  
  const handleTechniqueDelete = (indexToDelete) => {
    const updatedTechniques = (character.techniques || []).filter((_, index) => index !== indexToDelete);
    onUpdateCharacter({ ...character, techniques: updatedTechniques });
  };

  const openCreateModal = () => setIsCreating(true);
  const openEditModal = (technique, index) => setEditingTechnique({ technique, index });
  const closeFormModal = () => {
    setIsCreating(false);
    setEditingTechnique(null);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteModalOpen(false);
  };
  
  const openRollModal = (data) => {
    setRollModalData(data);
  };
  
  const closeRollModal = () => setRollModalData(null);

  const handleMouseEnter = (attributeKey) => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredAttribute(attributeKey);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredAttribute(null);
    }, 200);
  };

  const RightColumnContent = () => {
    if (activeTab === 'techniques') {
      return (<TechniquesPage character={character} onDeleteTechnique={handleTechniqueDelete} openCreateModal={openCreateModal} openEditModal={openEditModal} />);
    }
    // Adiciona a condição para renderizar a página de inventário
    if (activeTab === 'inventory') {
      return <InventoryPage character={character} onUpdateCharacter={onUpdateCharacter} />;
    }
    if (activeTab === 'progression') {
      return <ProgressionPage character={character} onTrain={onTrain} showNotification={showNotification} />;
    }
    return (
      <div className="w-full self-start flex flex-col space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full">
            <h3 className="text-xl font-semibold text-brand-text">Habilidade Passiva</h3>
            <div className="bg-gray-100 p-3 rounded-lg mt-2">
              <h4 className="font-bold text-purple-700">{clan.passiveAbility.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{clan.passiveAbility.description}</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg w-full flex flex-col">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-brand-text">Status de Combate</h3>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg flex justify-around text-center">
              <EditableStat label="PV" currentValue={character.stats.currentHp} maxValue={displayMaxHp} onSave={(newValue) => handleStatChange('currentHp', newValue)} colorClass="text-green-600" />
              <EditableStat label="Chi" currentValue={character.stats.currentChi} maxValue={displayMaxChi} onSave={(newValue) => handleStatChange('currentChi', newValue)} colorClass="text-blue-500" />
              <EditableStat label="CA" currentValue={character.stats.armorClass} onSave={(newValue) => handleStatChange('armorClass', newValue)} colorClass="text-red-600" />
            </div>
          </div>
          <button onClick={() => setIsDeleteModalOpen(true)} className="w-full text-center text-gray-500 hover:text-red-600 font-semibold pt-4 mt-auto">
            Apagar Personagem
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <h1 className="text-6xl font-bold text-center text-brand-primary mb-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
        Tales of Jianghu
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        <div className="lg-col-span-1 bg-white p-8 rounded-2xl shadow-lg space-y-4 w-full self-start">
          <div><h2 className="text-4xl font-bold text-brand-text">{character.name}</h2><p className="text-lg text-gray-500">{clan.name}</p></div>
          <hr />
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Atributos Finais</h3>
            <div className="space-y-2 mt-3">
              {Object.entries(character.attributes).map(([key, value]) => {
                const isProficient = character.proficientAttribute === key;
                const attributeBonus = isProficient ? value * 2 : value;
                return (
                  <div 
                    key={key} 
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(key)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => openRollModal({
                        title: `Teste de ${ATTRIBUTE_TRANSLATIONS[key]}`,
                        modifier: attributeBonus,
                        modifierLabel: ATTRIBUTE_TRANSLATIONS[key]
                      })}
                      className={`w-full flex justify-between items-center p-3 rounded-lg transition-colors ${
                        isProficient ? 'bg-purple-100 hover:bg-purple-200' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {isProficient && <StarIcon className="h-5 w-5 text-yellow-500" />}
                        <span className="font-bold text-gray-700">{ATTRIBUTE_TRANSLATIONS[key]}</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-700">{value}</span>
                    </button>
                    <div 
                      className={`absolute left-full top-0 ml-4 w-64 bg-white p-4 rounded-lg shadow-xl border z-[60] transition-all duration-200 ${
                        hoveredAttribute === key 
                          ? 'opacity-100 scale-100 pointer-events-auto' 
                          : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                    >
                      <h5 className="font-bold text-brand-text border-b pb-2 mb-2">Perícias de {ATTRIBUTE_TRANSLATIONS[key]}</h5>
                      <div className="space-y-1 text-sm">
                        {(ATTRIBUTE_PERICIAS[key] || []).map(periciaName => {
                          const skillBonusFromInnate = innateBodyData.effects?.skill_bonus?.[periciaName] || 0;
                          const totalBonus = attributeBonus + skillBonusFromInnate;
                          return (
                            <button 
                              key={periciaName} 
                              onClick={() => openRollModal({
                                title: `Teste de ${periciaName}`,
                                modifier: totalBonus,
                                modifierLabel: 'Bônus Total'
                              })}
                              className="flex justify-between w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                            >
                              <span className="text-gray-600">{periciaName}</span>
                              <span className="font-bold text-purple-700">
                                {totalBonus >= 0 ? '+' : ''}{totalBonus}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 flex items-center justify-center self-start">
          <div className="relative group w-full max-w-sm mx-auto aspect-[3/4] bg-gray-100 rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <img 
              src={character.imageUrl || characterArt} 
              alt={`Arte de ${character.name}`} 
              className="w-full h-full object-cover object-center"
            />
            <button
              onClick={onOpenImageTray}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            >
              <PhotoIcon className="h-12 w-12 mb-2" />
              <span className="font-semibold">Abrir Galeria</span>
            </button>
          </div>
        </div>
        <div className="lg:col-span-1 w-full self-start">
          <RightColumnContent />
        </div>
      </div>
      
      {!anyModalIsOpen && <SheetNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal}><TechniqueCreatorForm onSave={(data) => { handleTechniquesUpdate(data); closeFormModal(); }} onCancel={closeFormModal} initialData={editingTechnique?.technique} /></Modal>
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Apagar Personagem?" message="Esta ação é permanente. Deseja apagar esta ficha?" />
      
      <RollTestModal 
        isOpen={rollModalData !== null} 
        onClose={closeRollModal} 
        title={rollModalData?.title || ''}
        modifier={rollModalData?.modifier || 0}
        modifierLabel={rollModalData?.modifierLabel || ''}
        onRollComplete={(result) => {
          addRollToHistory({
            name: rollModalData.title, 
            roll: result.roll, 
            modifier: result.modifier, 
            total: result.total
          });
        }}
      />
    </div>
  );
}

export default CharacterSheet;