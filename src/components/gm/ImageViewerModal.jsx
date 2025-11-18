// ARQUIVO: src/components/gm/ImageViewerModal.jsx (NOVO ARQUIVO)

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

function ImageViewerModal({ isOpen, onClose, imageUrl }) {
  if (!isOpen) return null;

  return (
    // Overlay principal que fecha ao ser clicado
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60]"
      onClick={onClose}
    >
      {/* Botão de fechar no canto */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
        <XMarkIcon className="h-8 w-8" />
      </button>

      {/* Container da imagem para evitar que o clique na imagem feche o modal */}
      <div 
        className="relative p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Visualização ampliada" 
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}

export default ImageViewerModal;