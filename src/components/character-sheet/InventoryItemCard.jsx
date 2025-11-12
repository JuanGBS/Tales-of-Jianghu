import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/solid';

function InventoryItemCard({ item, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-brand-text">{item.name}</h4>
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
        <p className="text-sm text-gray-600 mt-2 pt-2 border-t break-words">
          {item.description}
        </p>
      )}
    </div>
  );
}

export default InventoryItemCard;