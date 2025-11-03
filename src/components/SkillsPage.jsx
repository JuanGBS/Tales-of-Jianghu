import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import SkillCard from './SkillCard';

function SkillsPage({ skills, onUpdateSkills, openCreateModal, openEditModal }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [skillToDelete, setSkillToDelete] = useState(null);

  const handleDeleteSkill = () => {
    if (skillToDelete === null) return;
    const updatedSkills = skills.filter((_, index) => index !== skillToDelete);
    onUpdateSkills(updatedSkills, true);
    setSkillToDelete(null);
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh]">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-xl font-semibold text-brand-text">Técnicas</h3>
        <button onClick={openCreateModal} className="px-4 py-2 bg-brand-primary text-brand-text font-semibold rounded-md text-sm hover:brightness-105">
          Adicionar Técnica
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto flex-grow pr-4 min-h-0 pb-4">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <SkillCard 
              key={index} 
              skill={skill} 
              onDelete={() => setSkillToDelete(index)}
              onEdit={() => openEditModal(skill, index)}
              isExpanded={expandedIndex === index}
              onToggle={() => handleToggleExpand(index)}
            />
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-center text-gray-400">Nenhuma Técnica adicionada.</p>
          </div>
        )}
      </div>
      
      <ConfirmationModal 
        isOpen={skillToDelete !== null}
        onClose={() => setSkillToDelete(null)}
        onConfirm={handleDeleteSkill}
        title="Apagar Técnica?"
        // Mensagem dinâmica para ser mais específico
        message={`Você tem certeza que deseja apagar a Técnica "${skills[skillToDelete]?.name}"?`}
      />
    </div>
  );
}

export default SkillsPage;