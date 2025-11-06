import React, { useState } from 'react';
import ConfirmationModal from '../ui/ConfirmationModal';
import TechniqueCard from './TechniqueCard';
import { FIGHTING_STYLES } from '../../data/gameData';

// Recebe 'character' em vez de 'techniques'
function TechniquesPage({ character, onDeleteTechnique, openCreateModal, openEditModal }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [techniqueToDelete, setTechniqueToDelete] = useState(null);

  const techniques = character.techniques || [];
  const fightingStyleName = FIGHTING_STYLES.find(style => style.id === character.fightingStyle)?.name || 'Não definido';

  const handleConfirmDelete = () => {
    if (techniqueToDelete === null) return;
    onDeleteTechnique(techniqueToDelete);
    setTechniqueToDelete(null);
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh]">
      
      {/* SEÇÃO DO ESTILO DE LUTA */}
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-xl font-semibold text-brand-text">Estilo de Luta</h3>
        <div className="bg-gray-100 p-3 rounded-lg mt-2">
          <span className="text-gray-900 text-lg">{fightingStyleName}</span>
        </div>
      </div>

      <hr className="mb-4"/>

      {/* SEÇÃO DAS TÉCNICAS */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-xl font-semibold text-brand-text">Técnicas</h3>
        <button onClick={openCreateModal} className="px-4 py-2 bg-brand-primary text-brand-text font-semibold rounded-md text-sm hover:brightness-105">
          Adicionar Técnica
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto flex-grow pr-4 min-h-0 pb-4">
        {techniques.length > 0 ? (
          techniques.map((technique, index) => (
            <TechniqueCard 
              key={index} 
              technique={technique} 
              onDelete={() => setTechniqueToDelete(index)}
              onEdit={() => openEditModal(technique, index)}
              isExpanded={expandedIndex === index}
              onToggle={() => handleToggleExpand(index)}
            />
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-center text-gray-400">Nenhuma técnica adicionada.</p>
          </div>
        )}
      </div>
      
      <ConfirmationModal 
        isOpen={techniqueToDelete !== null}
        onClose={() => setTechniqueToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Apagar Técnica?"
        message={`Você tem certeza que deseja apagar a técnica "${techniques[techniqueToDelete]?.name}"?`}
      />
    </div>
  );
}

export default TechniquesPage;