import React, { useState } from 'react';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
// --- 1. IMPORTAR OS NOVOS DADOS DE ARMADURA ---
import { ARMOR_TYPES } from '../data/armorTypes';
import InventoryItemCard from '../components/character-sheet/InventoryItemCard';
import InventoryItemForm from '../components/character-sheet/InventoryItemForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Modal from '../components/ui/Modal';

const defaultInventory = {
  weapon: { name: '', damage: '', attribute: '', properties: '' },
  armor: { type: 'none', properties: '' },
  general: [],
};

function InventoryPage({ character, onUpdateCharacter }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const inventory = character.inventory || defaultInventory;

  const handleSaveItem = (itemData) => {
    const newInventory = JSON.parse(JSON.stringify(inventory));
    
    if (editingItem) {
      newInventory.general = newInventory.general.map(item => 
        item.id === editingItem.id ? { ...item, ...itemData } : item
      );
    } else {
      newInventory.general.push({ ...itemData, id: Date.now() });
    }

    onUpdateCharacter({ ...character, inventory: newInventory });
    setIsFormOpen(false);
    setEditingItem(null);
  };
  
  const handleDeleteItem = () => {
    if (itemToDelete === null) return;
    const newInventory = { ...inventory };
    newInventory.general = newInventory.general.filter((_, index) => index !== itemToDelete);
    onUpdateCharacter({ ...character, inventory: newInventory });
    setItemToDelete(null);
  };
  
  const handleEquippedChange = (e, section) => {
    const { name, value } = e.target;
    const newInventory = { 
      ...inventory, 
      [section]: { ...inventory[section], [name]: value }
    };
    onUpdateCharacter({ ...character, inventory: newInventory });
  };
  
  const inputStyle = "w-full p-2 border bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400";
  const selectStyle = "w-full p-2 border bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none";
  const labelStyle = "font-bold text-gray-700 block text-sm mb-1";
  
  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh]">
        <div className="space-y-6 overflow-y-auto pr-2">
          <div>
            <h3 className="text-xl font-semibold text-brand-text border-b pb-2 mb-4">Equipamentos</h3>
            <div className="space-y-4">
              {/* Arma Principal (sem alterações) */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <label className={labelStyle}>Arma Principal</label>
                <input name="name" value={inventory.weapon.name} onChange={(e) => handleEquippedChange(e, 'weapon')} className={inputStyle} placeholder="Nome da Arma" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input name="damage" value={inventory.weapon.damage} onChange={(e) => handleEquippedChange(e, 'weapon')} className={inputStyle} placeholder="Dano (ex: 1d8)" />
                  <select name="attribute" value={inventory.weapon.attribute} onChange={(e) => handleEquippedChange(e, 'weapon')} className={`${selectStyle} bg-gray-50`}>
                    <option value="">Atributo...</option>
                    {Object.values(ATTRIBUTE_TRANSLATIONS).map(attr => <option key={attr} value={attr}>{attr}</option>)}
                  </select>
                </div>
                <textarea name="properties" value={inventory.weapon.properties} onChange={(e) => handleEquippedChange(e, 'weapon')} className={`${inputStyle} mt-2 min-h-[40px]`} placeholder="Propriedades..."></textarea>
              </div>
              
              {/* --- 2. SEÇÃO DE ARMADURA MODIFICADA --- */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <label className={labelStyle}>Armadura</label>
                {/* Substitui o input por um select */}
                <select name="type" value={inventory.armor.type} onChange={(e) => handleEquippedChange(e, 'armor')} className={`${selectStyle} bg-gray-50`}>
                  {ARMOR_TYPES.map(armor => (
                    <option key={armor.id} value={armor.id}>{armor.name}</option>
                  ))}
                </select>
                <textarea name="properties" value={inventory.armor.properties} onChange={(e) => handleEquippedChange(e, 'armor')} className={`${inputStyle} mt-2 min-h-[40px]`} placeholder="Propriedades e Notas..."></textarea>
              </div>
            </div>
          </div>
          
          {/* Seção de Inventário Geral (sem alterações) */}
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-semibold text-brand-text">Inventário Geral</h3>
              <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="px-4 py-2 bg-brand-primary text-brand-text font-semibold rounded-md text-sm hover:brightness-105">
                Adicionar Item
              </button>
            </div>
            <div className="space-y-3">
              {inventory.general.length > 0 ? (
                inventory.general.map((item, index) => (
                  <InventoryItemCard 
                    key={item.id || index} 
                    item={item}
                    onEdit={() => { setEditingItem(item); setIsFormOpen(true); }}
                    onDelete={() => setItemToDelete(index)}
                  />
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">Nenhum item no inventário.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modais (sem alterações) */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <InventoryItemForm 
          onSave={handleSaveItem} 
          onCancel={() => setIsFormOpen(false)}
          initialData={editingItem}
        />
      </Modal>
      <ConfirmationModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        title="Apagar Item?"
        message={`Você tem certeza que deseja apagar o item "${inventory.general[itemToDelete]?.name}"?`}
      />
    </>
  );
}

export default InventoryPage;