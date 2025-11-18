// ARQUIVO: src/components/gm/GmImageUploadModal.jsx (VERSÃO CORRIGIDA)

import React, { useState, useRef } from 'react'; // 1. Importar useRef
import Modal from '../ui/Modal';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

function GmImageUploadModal({ isOpen, onClose, onUpload, existingCategories }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null); // 2. Criar uma referência para o input

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file && category) {
      onUpload(file, category.toLowerCase().trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setCategory('');
    setPreview(null);
    onClose();
  };
  
  // 3. Função para acionar o clique no input escondido
  const handleUploadAreaClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-bold text-brand-text text-center">Nova Imagem para a Galeria</h3>
        
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Arquivo de Imagem</label>
          {/* 4. Transformar a área de upload em um botão clicável */}
          <button
            type="button"
            onClick={handleUploadAreaClick}
            className="w-full mt-2 flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md hover:border-purple-400 transition-colors"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-40 rounded-md" />
            ) : (
              <div className="text-center text-gray-500">
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm">Clique para selecionar uma imagem</p>
              </div>
            )}
          </button>
          {/* 5. Conectar a referência ao input de arquivo */}
          <input 
            ref={fileInputRef} 
            id="image-upload" 
            name="image-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange} 
            accept="image/*" 
            required 
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-600 mb-1">Categoria</label>
          <input
            id="category"
            name="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Ex: inimigos, seitas, masculinos..."
            list="category-suggestions"
            required
          />
          <datalist id="category-suggestions">
            {existingCategories.map(cat => <option key={cat} value={cat} />)}
          </datalist>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-semibold">Cancelar</button>
          <button type="submit" className="px-6 py-2 bg-brand-primary text-brand-text font-bold rounded-md hover:brightness-105 shadow-sm disabled:opacity-50" disabled={!file || !category}>
            Enviar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default GmImageUploadModal;