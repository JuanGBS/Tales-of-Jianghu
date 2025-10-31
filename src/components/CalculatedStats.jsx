import React, { useState, useEffect, useRef } from 'react';

function EditableStat({ label, currentValue, maxValue, onSave, colorClass }) {
  // A CORREÇÃO ESTÁ AQUI: A palavra "anidar" foi removida.
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      setValue(currentValue);
      inputRef.current?.focus();
    }
  }, [isEditing, currentValue]);

  const handleSave = () => {
    let finalValue = currentValue;
    const inputValue = String(value);

    if (inputValue.startsWith('+') || inputValue.startsWith('-')) {
      const amount = parseInt(inputValue.substring(1), 10);
      if (!isNaN(amount)) {
        finalValue = inputValue.startsWith('+') ? currentValue + amount : currentValue - amount;
      }
    } else {
      const absoluteValue = parseInt(inputValue, 10);
      if (!isNaN(absoluteValue)) {
        finalValue = absoluteValue;
      }
    }

    const validatedValue = Math.max(0, finalValue);
    onSave(validatedValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(currentValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full text-3xl font-bold text-center bg-transparent focus:outline-none ${colorClass}`}
      />
    );
  }

  return (
    <button onClick={() => setIsEditing(true)} className="w-full text-center focus:outline-none">
      <span className="block text-sm text-gray-500">{label}</span>
      <span className={`block text-3xl font-bold ${colorClass}`}>
        {currentValue}{maxValue ? `/${maxValue}` : ''}
      </span>
    </button>
  );
}

export default EditableStat;