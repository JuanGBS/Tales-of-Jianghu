import React, { useState, useEffect } from 'react';

const initialState = { name: '', quantity: 1, description: '' };

function InventoryItemForm({ onSave, onCancel, initialData }) {
  const [item, setItem] = useState(initialState);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setItem(initialData);
    } else {
      setItem(initialState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 1 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
  };

  const inputStyle = "w-full p-2 border bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-xl font-bold text-brand-text text-center">
        {isEditing ? 'Editar Item' : 'Novo Item'}
      </h4>
      
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-gray-600 mb-1 block">Nome do Item</label>
        <input id="name" name="name" value={item.name} onChange={handleChange} className={inputStyle} required />
      </div>
      
      <div>
        <label htmlFor="quantity" className="text-sm font-semibold text-gray-600 mb-1 block">Quantidade</label>
        <input id="quantity" name="quantity" type="number" min="1" value={item.quantity} onChange={handleChange} className={inputStyle} required />
      </div>
      
      <div>
        <label htmlFor="description" className="text-sm font-semibold text-gray-600 mb-1 block">Descrição</label>
        <textarea id="description" name="description" value={item.description} onChange={handleChange} className={`${inputStyle} min-h-[80px]`}></textarea>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-semibold">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-brand-primary text-brand-text font-bold rounded-md hover:brightness-105 shadow-sm">
          Salvar
        </button>
      </div>
    </form>
  );
}

export default InventoryItemForm;