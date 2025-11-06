import React, { useState } from 'react';
import { CLANS_DATA } from '../data/clans';
import { FIGHTING_STYLES, BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from '../data/gameData';
import characterArt from '../assets/character-art.png';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
import { ATTRIBUTE_PERICIAS } from '../data/gameData';
import TechniquesPage from '../components/character-sheet/TechniquesPage';
import ProgressionPage from '../components/character-sheet/ProgressionPage';
import SheetNavigation from '../components/character-sheet/SheetNavigation';
import EditableStat from '../components/ui/EditableStat';
import Modal from '../components/ui/Modal';
import TechniqueCreatorForm from '../components/character-sheet/TechniqueCreatorForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import AttributeRollModal from '../components/character-sheet/AttributeRollModal';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

function CharacterSheet({ character, onDelete, onUpdateCharacter, showNotification, signOut, addRollToHistory }) {
  const clan = CLANS_DATA[character.clanId];
  const [activeTab, setActiveTab] = useState('sheet');
  const [editingTechnique, setEditingTechnique] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rollModalData, setRollModalData] = useState(null);
  
  const isFormModalOpen = isCreating || editingTechnique !== null;
  const anyModalIsOpen = isFormModalOpen || isDeleteModalOpen || rollModalData !== null;

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
    const updatedCharacter = { ...character, techniques: updatedTechniques };
    onUpdateCharacter(updatedCharacter);
  };
  
  const handleTechniqueDelete = (indexToDelete) => {
    const updatedTechniques = (character.techniques || []).filter((_, index) => index !== indexToDelete);
    const updatedCharacter = { ...character, techniques: updatedTechniques };
    onUpdateCharacter(updatedCharacter);
  };

  const handleProgressionChange = (updates) => {
    const newCharacterState = { ...character, ...updates };
    if (newCharacterState.bodyRefinementLevel >= BODY_REFINEMENT_LEVELS.length) return;
    if (newCharacterState.cultivationStage >= CULTIVATION_STAGES.length) return;
    if (newCharacterState.masteryLevel >= MASTERY_LEVELS.length) return;
    onUpdateCharacter(newCharacterState);
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
  
  const openRollModal = (attributeKey, attributeValue) => {
    setRollModalData({ key: attributeKey, value: attributeValue });
  };
  const closeRollModal = () => setRollModalData(null);

  const baseMaxHp = character.stats.maxHp;
  const refinementMultiplier = BODY_REFINEMENT_LEVELS.find(l => l.id === (character.bodyRefinementLevel || 0))?.multiplier || 1;
  const displayMaxHp = Math.floor(baseMaxHp * refinementMultiplier);

  const baseMaxChi = character.stats.maxChi;
  const cultivationMultiplier = CULTIVATION_STAGES.find(s => s.id === (character.cultivationStage || 0))?.multiplier || 1;
  const masteryBonus = MASTERY_LEVELS.find(l => l.id === (character.masteryLevel || 0))?.bonus || 0;
  const displayMaxChi = Math.floor(baseMaxChi * cultivationMultiplier) + masteryBonus;

  const RightColumnContent = () => {
    if (activeTab === 'techniques') {
      return (<TechniquesPage character={character} onDeleteTechnique={handleTechniqueDelete} openCreateModal={openCreateModal} openEditModal={openEditModal} />);
    }
    if (activeTab === 'progression') {
      return <ProgressionPage character={character} onTrain={handleProgressionChange} showNotification={showNotification} />;
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
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg space-y-4 w-full self-start">
          <div><h2 className="text-4xl font-bold text-brand-text">{character.name}</h2><p className="text-lg text-gray-500">{clan.name}</p></div>
          <hr />
          <div>
            <h3 className="text-xl font-semibold text-brand-text">Atributos Finais</h3>
            <div className="space-y-2 mt-3">
              {Object.entries(character.attributes).map(([key, value]) => (
                <div key={key} className="relative group">
                  <button 
                    onClick={() => openRollModal(key, value)}
                    className="w-full flex justify-between items-center bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <span className="font-bold text-gray-700">{ATTRIBUTE_TRANSLATIONS[key]}</span>
                    <span className="text-2xl font-bold text-purple-700">{value}</span>
                  </button>
                  <div className="absolute left-full top-0 ml-4 w-64 bg-white p-4 rounded-lg shadow-xl border z-10 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <h5 className="font-bold text-brand-text border-b pb-2 mb-2">Perícias de {ATTRIBUTE_TRANSLATIONS[key]}</h5>
                    <div className="space-y-1 text-sm">
                      {(ATTRIBUTE_PERICIAS[key] || []).map(periciaName => (<div key={periciaName} className="flex justify-between"><span className="text-gray-600">{periciaName}</span><span className="font-bold text-purple-700">+{value}</span></div>))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 flex justify-center -mx-8 hidden lg:flex self-end">
          <img 
            src={characterArt} 
            alt="Arte do Personagem" 
            className="max-h-[75vh] object-contain [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]" 
          />
        </div>
        <div className="lg:col-span-1 w-full self-start">
          <RightColumnContent />
        </div>
      </div>
      
      {!anyModalIsOpen && <SheetNavigation activeTab={activeTab} setActiveTab={setActiveTab} />}

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal}>
        <TechniqueCreatorForm onSave={(techniqueData) => { handleTechniquesUpdate(techniqueData); closeFormModal(); }} onCancel={closeFormModal} initialData={editingTechnique?.technique} />
      </Modal>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Apagar Personagem?" message="Esta ação é permanente e não pode ser desfeita. Você tem certeza que deseja apagar esta ficha?" />
    
      <AttributeRollModal 
        isOpen={rollModalData !== null}
        onClose={closeRollModal}
        attributeName={rollModalData ? ATTRIBUTE_TRANSLATIONS[rollModalData.key] : ''}
        attributeValue={rollModalData ? rollModalData.value : 0}
        onRollComplete={(result) => addRollToHistory({
          name: `Teste de ${ATTRIBUTE_TRANSLATIONS[rollModalData.key]}`,
          roll: result.roll,
          modifier: rollModalData.value,
          total: result.total
        })}
      />
    </div>
  );
}

export default CharacterSheet;