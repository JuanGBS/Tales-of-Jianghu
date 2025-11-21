import React, { useState, useEffect } from 'react';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations';
import { ARMOR_TYPES } from '../data/armorTypes';
import { WEAPONS_LIST, WEAPON_CATEGORIES } from '../data/weapons';
import InventoryItemCard from '../components/character-sheet/InventoryItemCard';
import InventoryItemForm from '../components/character-sheet/InventoryItemForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Modal from '../components/ui/Modal';

const defaultInventory = {
  weapon: { name: '', damage: '', attribute: '', properties: '', category: '' },
  armor: { type: 'none', properties: '' },
  general: [],
  wallet: { gold: 0, silver: 0, copper: 0 }
};

// --- COMPONENTE DE INPUT DE TEXTO "PREGUIÇOSO" (SALVA NO BLUR) ---
const LazyInput = ({ value, name, onSave, className, placeholder }) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Sincroniza se o valor mudar externamente (ex: selecionar arma da lista)
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      // Simula o evento que a função pai espera
      onSave({ target: { name, value: localValue } });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Força o blur para salvar
    }
  };

  return (
    <input
      name={name}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
    />
  );
};

// --- COMPONENTE DE TEXTAREA "PREGUIÇOSO" ---
const LazyTextArea = ({ value, name, onSave, className, placeholder }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onSave({ target: { name, value: localValue } });
    }
  };

  return (
    <textarea
      name={name}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  );
};

// --- COMPONENTE DE INPUT DE DINHEIRO (JÁ EXISTENTE) ---
const MoneyInput = ({ value, onSave, label, colorClass, bgClass }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (parseInt(localValue) !== parseInt(value)) {
      onSave(parseInt(localValue) || 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className={`flex flex-1 items-center justify-between border rounded-md px-3 py-2 ${bgClass} ${colorClass}`}>
      <span className="font-bold text-sm uppercase">{label}</span>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-right font-mono font-bold text-lg focus:outline-none appearance-none m-0"
        placeholder="0"
      />
    </div>
  );
};

function InventoryPage({ character, onUpdateCharacter, isGmMode }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Merge seguro
  const inventory = {
    ...defaultInventory,
    ...character.inventory,
    weapon: { ...defaultInventory.weapon, ...(character.inventory?.weapon || {}) },
    armor: { ...defaultInventory.armor, ...(character.inventory?.armor || {}) },
    general: character.inventory?.general || [],
    wallet: character.inventory?.wallet || { 
        gold: 0, 
        silver: character.inventory?.money || 0, 
        copper: 0 
    }
  };

  // --- Lógica de Armas ---
  const handleWeaponSelect = (e) => {
    const weaponId = e.target.value;
    
    if (weaponId === 'custom') {
        const newInventory = { 
            ...inventory, 
            weapon: { ...inventory.weapon, name: '', damage: '', category: 'custom', properties: '' } 
        };
        onUpdateCharacter({ ...character, inventory: newInventory });
        return;
    }

    const selectedWeapon = WEAPONS_LIST.find(w => w.id === weaponId);
    if (selectedWeapon) {
        const catData = WEAPON_CATEGORIES[selectedWeapon.category];
        const defaultAttr = selectedWeapon.allowedAttributes[0]; 

        const newInventory = { 
            ...inventory, 
            weapon: { 
                ...inventory.weapon, 
                name: selectedWeapon.name, 
                damage: selectedWeapon.damage, 
                category: selectedWeapon.category,
                attribute: defaultAttr,
                properties: catData ? `${catData.name}: ${catData.description}` : ''
            } 
        };
        onUpdateCharacter({ ...character, inventory: newInventory });
    }
  };

  const getAvailableAttributes = () => {
      const currentWeapon = WEAPONS_LIST.find(w => w.name === inventory.weapon.name);
      if (currentWeapon && currentWeapon.allowedAttributes) {
          return currentWeapon.allowedAttributes;
      }
      return Object.keys(ATTRIBUTE_TRANSLATIONS);
  };

  const availableAttributes = getAvailableAttributes();

  // --- CRUD Itens ---
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
    const newInventory = JSON.parse(JSON.stringify(inventory));
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

  // --- Handler de Carteira ---
  const handleWalletChange = (currency, value) => {
      const newInventory = {
          ...inventory,
          wallet: {
              ...inventory.wallet,
              [currency]: value
          }
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
            <h3 className="text-xl font-semibold text-brand-text border-b pb-2 mb-4 flex justify-between items-center">
                Equipamentos
                {isGmMode && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">GM MODE</span>}
            </h3>
            <div className="space-y-4">
              
              {/* ARMA PRINCIPAL */}
              <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-purple-500">
                <label className={labelStyle}>Arma Principal</label>
                
                <select 
                    onChange={handleWeaponSelect} 
                    className={`${selectStyle} mb-2 font-semibold text-purple-900`}
                    value={WEAPONS_LIST.find(w => w.name === inventory.weapon.name)?.id || 'custom'}
                >
                    <option value="custom">-- Arma Personalizada / Outra --</option>
                    <optgroup label="Leves">
                        {WEAPONS_LIST.filter(w => w.category === 'leve').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </optgroup>
                    <optgroup label="Médias">
                        {WEAPONS_LIST.filter(w => w.category === 'media').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </optgroup>
                    <optgroup label="Pesadas">
                        {WEAPONS_LIST.filter(w => w.category === 'pesada').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </optgroup>
                    <optgroup label="Alcance">
                        {WEAPONS_LIST.filter(w => w.category === 'alcance').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </optgroup>
                    <optgroup label="Exóticas">
                        {WEAPONS_LIST.filter(w => w.category === 'exotica').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </optgroup>
                </select>

                {/* LazyInput para Nome */}
                <LazyInput 
                    name="name" 
                    value={inventory.weapon.name} 
                    onSave={(e) => handleEquippedChange(e, 'weapon')} 
                    className={inputStyle} 
                    placeholder="Nome da Arma" 
                />
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                      <label className="text-xs font-bold text-gray-500 ml-1">Dano</label>
                      {/* LazyInput para Dano */}
                      <LazyInput 
                        name="damage" 
                        value={inventory.weapon.damage} 
                        onSave={(e) => handleEquippedChange(e, 'weapon')} 
                        className={inputStyle} 
                        placeholder="Ex: 1d8" 
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-gray-500 ml-1">Atributo</label>
                      <select 
                        name="attribute" 
                        value={inventory.weapon.attribute} 
                        onChange={(e) => handleEquippedChange(e, 'weapon')} 
                        className={`${selectStyle} bg-white`}
                      >
                        {availableAttributes.map(attr => (
                            <option key={attr} value={attr}>{ATTRIBUTE_TRANSLATIONS[attr]}</option>
                        ))}
                      </select>
                  </div>
                </div>
                
                {/* LazyTextArea para Propriedades */}
                <LazyTextArea 
                    name="properties" 
                    value={inventory.weapon.properties} 
                    onSave={(e) => handleEquippedChange(e, 'weapon')} 
                    className={`${inputStyle} mt-2 min-h-[60px] text-sm`} 
                    placeholder="Propriedades especiais..."
                />
              </div>
              
              {/* Armadura */}
              <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-400">
                <label className={labelStyle}>Armadura</label>
                <select name="type" value={inventory.armor.type} onChange={(e) => handleEquippedChange(e, 'armor')} className={`${selectStyle} bg-white`}>
                  {ARMOR_TYPES.map(armor => (
                    <option key={armor.id} value={armor.id}>{armor.name}</option>
                  ))}
                </select>
                
                {/* LazyTextArea para Propriedades da Armadura */}
                <LazyTextArea 
                    name="properties" 
                    value={inventory.armor.properties} 
                    onSave={(e) => handleEquippedChange(e, 'armor')} 
                    className={`${inputStyle} mt-2 min-h-[40px] text-sm`} 
                    placeholder="Propriedades e Notas..."
                />
              </div>
            </div>
          </div>
          
          {/* Inventário Geral */}
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-semibold text-brand-text">Inventário Geral</h3>
              <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="px-4 py-2 bg-brand-primary text-brand-text font-semibold rounded-md text-sm hover:brightness-105">
                Adicionar Item
              </button>
            </div>
            
            {/* NOVA CARTEIRA DE DINHEIRO (LADO A LADO) */}
            <div className="flex w-full gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-x-auto">
                <MoneyInput 
                    label="TO" 
                    value={inventory.wallet.gold} 
                    onSave={(val) => handleWalletChange('gold', val)}
                    colorClass="text-yellow-700 border-yellow-300"
                    bgClass="bg-yellow-50"
                />
                <MoneyInput 
                    label="TP" 
                    value={inventory.wallet.silver} 
                    onSave={(val) => handleWalletChange('silver', val)}
                    colorClass="text-slate-600 border-slate-300"
                    bgClass="bg-slate-100"
                />
                <MoneyInput 
                    label="TC" 
                    value={inventory.wallet.copper} 
                    onSave={(val) => handleWalletChange('copper', val)}
                    colorClass="text-orange-800 border-orange-300"
                    bgClass="bg-orange-50"
                />
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