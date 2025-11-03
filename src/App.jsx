import React, { useState, useEffect } from 'react';
import SheetManager from './components/SheetManager';
import CharacterSheet from './components/CharacterSheet';
import NotificationToast from './components/NotificationToast';

const STORAGE_KEY = 'tales-of-jianghu-character';

function App() {
  const [character, setCharacter] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const savedCharacter = localStorage.getItem(STORAGE_KEY);
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter));
    }
  }, []);

  const handleSaveCharacter = (characterData) => {
    const characterWithTechniques = { ...characterData, techniques: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characterWithTechniques));
    setCharacter(characterWithTechniques);
  };

  const handleDeleteCharacter = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCharacter(null);
  };

  const handleUpdateCharacter = (updatedCharacter) => {
    setCharacter(updatedCharacter);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCharacter));
  };
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  return (
    <main>
      {character ? (
        <CharacterSheet 
          character={character} 
          onDelete={handleDeleteCharacter} 
          onUpdateCharacter={handleUpdateCharacter}
          showNotification={showNotification}
        />
      ) : (
        <SheetManager onSave={handleSaveCharacter} />
      )}

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </main>
  );
}

export default App;