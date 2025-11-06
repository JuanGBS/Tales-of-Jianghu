import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/solid';

function TechniqueCard({ technique, onDelete, onEdit, isExpanded, onToggle }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <button 
        onClick={onToggle} 
        className="w-full text-left p-4 space-y-2 focus:outline-none"
      >
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-lg text-brand-text">{technique.name}</h4>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-gray-400 hover:text-purple-600"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }} 
              className="text-lg text-red-400 hover:text-red-600 leading-none"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
          <span><strong>Tipo:</strong> {technique.type || '-'}</span>
          <span><strong>Custo:</strong> {technique.cost || '-'}</span>
          <span><strong>Ação:</strong> {technique.action || '-'}</span>
          <span><strong>Atributo:</strong> {technique.attribute || '-'}</span>
        </div>
      </button>

      <div 
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-800 pt-2 border-t break-words">
            {technique.effect}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TechniqueCard;