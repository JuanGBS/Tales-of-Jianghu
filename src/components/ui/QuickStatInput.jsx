import React, { useState, useEffect, useRef } from 'react';

function QuickStatInput({ value, maxValue, onSave, className, placeholder }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  // Sincroniza se o valor externo mudar (ex: regeneração automática)
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    processInput();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur(); // Dispara handleBlur
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(value); // Cancela
    }
  };

  const processInput = () => {
    const strValue = String(inputValue).trim();
    
    // Se estiver vazio, reseta
    if (strValue === '') {
      setInputValue(value);
      return;
    }

    let finalValue = parseInt(value, 10);
    
    // Verifica se é uma operação matemática (+ ou -)
    if (strValue.startsWith('+') || strValue.startsWith('-')) {
      const delta = parseInt(strValue, 10);
      if (!isNaN(delta)) {
        finalValue += delta;
      }
    } else {
      // É um valor absoluto
      const abs = parseInt(strValue, 10);
      if (!isNaN(abs)) {
        finalValue = abs;
      }
    }

    // Limites (Clamp)
    if (finalValue < 0) finalValue = 0;
    if (maxValue !== undefined && finalValue > maxValue) finalValue = maxValue;

    // Só salva se mudou
    if (finalValue !== value) {
      onSave(finalValue);
    } else {
      setInputValue(value); // Restaura visualmente se não mudou efetivamente
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text" // Mudamos para text para aceitar "+" e "-"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`appearance-none m-0 p-0 bg-white/80 focus:bg-white outline-none focus:ring-2 focus:ring-purple-400 rounded px-1 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-200/50 rounded px-1 transition-colors border-b border-transparent hover:border-gray-400 ${className}`}
      title="Clique para editar (use + ou - para somar/subtrair)"
    >
      {value}
    </span>
  );
}

export default QuickStatInput;