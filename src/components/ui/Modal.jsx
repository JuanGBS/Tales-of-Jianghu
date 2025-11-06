import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
          <XMarkIcon className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;