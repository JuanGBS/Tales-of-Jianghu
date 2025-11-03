import React, { useState, useEffect } from 'react';
import { SKILL_TYPES, ACTION_TYPES } from '../data/gameData';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';

const initialSkillState = { name: '', type: '', cost: '', action: '', attribute: '', requirements: '', effect: '' };

function SkillCreatorForm({ onSave, onCancel, initialData }) {
  const [skill, setSkill] = useState(initialSkillState);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setSkill(initialData);
    } else {
      setSkill(initialSkillState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSkill(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (typeId) => {
    setSkill(prev => ({ ...prev, type: prev.type === typeId ? '' : typeId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(skill);
  };

  const inputStyle = "w-full p-2 border bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-xl font-bold text-brand-text text-center">
        {isEditing ? 'Editar Tecnica' : 'Nova Tecnica'}
      </h4>
      
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-gray-600 mb-1 block">Nome da Tecnica</label>
        <input id="name" name="name" value={skill.name} onChange={handleChange} className={inputStyle} required />
      </div>
      
      <div>
        <label className="text-sm font-semibold text-gray-600 mb-2 block">Tipo</label>
        <div className="flex space-x-2">
          {SKILL_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = skill.type === type.id;
            return (
              <button 
                type="button" 
                key={type.id} 
                onClick={() => handleTypeSelect(type.id)}
                className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded-md border transition-colors ${
                  isSelected ? 'bg-brand-accent text-white border-purple-400 shadow-inner' : 'bg-white hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                <span className="text-sm font-semibold">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cost" className="text-sm font-semibold text-gray-600 mb-1 block">Custo (Ex: 2 PC)</label>
          <input id="cost" name="cost" value={skill.cost} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label htmlFor="action" className="text-sm font-semibold text-gray-600 mb-1 block">Ação</label>
          <select id="action" name="action" value={skill.action} onChange={handleChange} className={inputStyle}>
            <option value="" disabled>Selecione...</option>
            {ACTION_TYPES.map(action => <option key={action} value={action}>{action}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="attribute" className="text-sm font-semibold text-gray-600 mb-1 block">Atributo Chave</label>
          <select id="attribute" name="attribute" value={skill.attribute} onChange={handleChange} className={inputStyle}>
            <option value="" disabled>Selecione...</option>
            {Object.values(ATTRIBUTE_TRANSLATIONS).map(attr => <option key={attr} value={attr}>{attr}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="requirements" className="text-sm font-semibold text-gray-600 mb-1 block">Requisitos (Ex: Compreensão Rasa)</label>
        <input id="requirements" name="requirements" value={skill.requirements} onChange={handleChange} className={inputStyle} />
      </div>

      <div>
        <label htmlFor="effect" className="text-sm font-semibold text-gray-600 mb-1 block">Descrição do Efeito</label>
        <textarea id="effect" name="effect" value={skill.effect} onChange={handleChange} className={`${inputStyle} min-h-[80px]`} required></textarea>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-semibold">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-brand-primary text-brand-text font-bold rounded-md hover:brightness-105 shadow-sm">
          {isEditing ? 'Salvar Alterações' : 'Salvar Tecnica'}
        </button>
      </div>
    </form>
  );
}

export default SkillCreatorForm;