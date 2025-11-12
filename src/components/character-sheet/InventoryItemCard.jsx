// ARQUIVO: src\components\character-sheet\InventoryItemCard.jsx

import React, { useState } from 'react'; // 1. Importar o useState
import { PencilSquareIcon } from '@heroicons/react/24/solid';

function InventoryItemCard({ item, onEdit, onDelete }) {
  // 2. Adicionar estado para controlar se o card está expandido
  const [isExpanded, setIsExpanded] = useState(false);

  // 3. Criar uma função para alternar o estado
  const handleToggleExpand = () => {
    // Só permite alternar se houver uma descrição
    if (item.description) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex justify-between items-start">
        <div>
          {/* 4. Transformar o título em um botão clicável */}
          <button
            onClick={handleToggleExpand}
            className="text-left focus:outline-none disabled:cursor-default"
            disabled={!item.description} // Desativa o clique se não houver descrição
          >
            <h4 className="font-bold text-lg text-brand-text">{item.name}</h4>
          </button>
          
          {item.quantity > 1 && (
            <span className="text-sm font-semibold text-purple-700">x{item.quantity}</span>
          )}
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button onClick={onEdit} className="text-gray-400 hover:text-purple-600">
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button onClick={onDelete} className="text-lg text-red-400 hover:text-red-600 leading-none">
            &times;
          </button>
        </div>
      </div>
      {item.description && (
        // 5. Aplicar a classe 'line-clamp-2' condicionalmente
        <p className={`text-sm text-gray-600 mt-2 pt-2 border-t break-words ${
            !isExpanded ? 'line-clamp-2' : ''
          }`}
        >
          {item.description}
        </p>
      )}
    </div>
  );
}

export default InventoryItemCard;