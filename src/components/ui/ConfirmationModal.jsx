import React from 'react';
import Modal from './Modal'; 

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-brand-text">{title}</h3>
        <p className="text-gray-600 my-4">{message}</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md font-bold"
          >
            Sim, Apagar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;