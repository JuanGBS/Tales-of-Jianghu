import React from 'react';
import Modal from '../ui/Modal';

function StyleInfoModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 text-center">
        <h3 className="text-xl font-bold text-brand-text">Benefício da Proficiência em Estilo</h3>
        <p className="text-gray-600">
          Ao escolher um Estilo de Luta, você adquire proficiência imediata. Isso significa que você está apto a usar todas as armas associadas ao estilo e utilizará o Atributo Chave correspondente para suas rolagens de ataque e dano, além de poder aprender técnicas associadas ao estilo.
        </p>
        <div className="pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-brand-text font-semibold rounded-md hover:brightness-105"
          >
            Entendi
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default StyleInfoModal;