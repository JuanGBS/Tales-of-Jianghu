import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { supabase } from './services/supabaseClient';
import SheetManager from './pages/SheetManager.jsx';
import CharacterSheet from './pages/CharacterSheet.jsx';
import NotificationToast from './components/ui/NotificationToast.jsx';
import AuthPage from './pages/AuthPage.jsx';
import RollHistoryDrawer from './components/ui/RollHistoryDrawer.jsx';
import ImageSelectionTray from './components/ui/ImageSelectionTray.jsx';
import ProficiencyChoiceModal from './components/character-sheet/ProficiencyChoiceModal.jsx';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from './data/gameData.js';


const mapToCamelCase = (data) => {
  if (!data) return null;
  return {
    proficientAttribute: data.proficient_attribute,
    id: data.id,
    userId: data.user_id,
    name: data.name,
    clanId: data.clan_id,
    fightingStyle: data.fighting_style,
    imageUrl: data.image_url,
    bodyRefinementLevel: data.body_refinement_level,
    cultivationStage: data.cultivation_stage,
    masteryLevel: data.mastery_level,
    attributes: data.attributes,
    stats: data.stats,
    techniques: data.techniques || [],
    proficientPericias: data.proficient_pericias || [],
    createdAt: data.created_at,
  };
};

function AppContent() {
  const { user, isLoading } = useAuth();
  const [character, setCharacter] = useState(null);
  const [characterLoading, setCharacterLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [rollHistory, setRollHistory] = useState(() => JSON.parse(localStorage.getItem('rollHistory') || '[]'));
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isImageTrayOpen, setIsImageTrayOpen] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [isProficiencyModalOpen, setIsProficiencyModalOpen] = useState(false);

  const fetchUserImages = async () => {
    if (!user) return;
    const { data, error } = await supabase.storage
      .from('character-images')
      .list(`public/${user.id}`, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });
    if (error) {
      console.error('Erro ao listar imagens:', error);
      return;
    }
    const imagesWithUrls = data.map(file => ({
      ...file,
      publicURL: supabase.storage.from('character-images').getPublicUrl(`public/${user.id}/${file.name}`).data.publicUrl,
    }));
    setUserImages(imagesWithUrls);
  };

  const handleOpenImageTray = () => {
    fetchUserImages();
    setIsImageTrayOpen(true);
  };

  useEffect(() => {
    localStorage.setItem('rollHistory', JSON.stringify(rollHistory));
  }, [rollHistory]);

  const addRollToHistory = (rollData) => {
    const newHistory = [rollData, ...rollHistory].slice(0, 15);
    setRollHistory(newHistory);
    setIsHistoryOpen(true);
  };

  const handleClearHistory = () => {
    setRollHistory([]);
    showNotification("Histórico de rolagens limpo!", "success");
  };

  useEffect(() => {
    if (user) {
      const fetchCharacter = async () => {
        setCharacterLoading(true);
        const { data, error } = await supabase.from('characters').select('*').eq('user_id', user.id).single();
        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar personagem:", error);
        } else {
          setCharacter(mapToCamelCase(data));
        }
        setCharacterLoading(false);
      };
      fetchCharacter();
    } else {
      setCharacterLoading(false);
      setCharacter(null);
    }
  }, [user]);

  const handleSaveCharacter = async (characterData) => {
    const { data, error } = await supabase
      .from('characters')
      .insert([
        { 
          user_id: user.id,
          name: characterData.name,
          clan_id: characterData.clanId,
          fighting_style: characterData.fightingStyle,
          attributes: characterData.attributes,
          stats: characterData.stats,
          proficient_pericias: characterData.proficientPericias,
          body_refinement_level: characterData.bodyRefinementLevel,
          cultivation_stage: characterData.cultivationStage,
          mastery_level: characterData.masteryLevel,
          techniques: characterData.techniques,
        }
      ])
      .select()
      .single();
    if (error) {
      console.error("Erro ao criar personagem:", error);
      showNotification("Falha ao criar personagem.", "error");
    } else {
      setCharacter(mapToCamelCase(data));
    }
  };

  const handleDeleteCharacter = async () => {
    if (!character) return;
    const { error } = await supabase.from('characters').delete().eq('id', character.id);
    if (error) {
      console.error("Erro ao apagar personagem:", error);
      showNotification("Falha ao apagar personagem.", "error");
    } else {
      setCharacter(null);
      setRollHistory([]);
      showNotification("Personagem apagado com sucesso.", "success");
    }
  };

  const handleUpdateCharacter = async (updatedCharacter) => {
    const dataToUpdate = {
      proficient_attribute: updatedCharacter.proficientAttribute,
      name: updatedCharacter.name,
      clan_id: updatedCharacter.clanId,
      fighting_style: updatedCharacter.fightingStyle,
      image_url: updatedCharacter.imageUrl,
      body_refinement_level: updatedCharacter.bodyRefinementLevel,
      cultivation_stage: updatedCharacter.cultivationStage,
      mastery_level: updatedCharacter.masteryLevel,
      attributes: updatedCharacter.attributes,
      stats: updatedCharacter.stats,
      techniques: updatedCharacter.techniques,
      proficient_pericias: updatedCharacter.proficientPericias,
    };
    const { data, error } = await supabase.from('characters').update(dataToUpdate).eq('id', updatedCharacter.id).select().single();
    if (error) {
      console.error("Erro ao atualizar personagem:", error);
      showNotification("Falha ao salvar alterações.", "error");
    } else {
      const updatedData = mapToCamelCase(data);
      setCharacter(updatedData);
      if (updatedData.cultivationStage === 1 && !updatedData.proficientAttribute) {
        setIsProficiencyModalOpen(true);
      }
    }
  };
  
  const handleProgressionChange = (updates) => {
    if (updates.type === 'attribute_increase' && updates.attribute) {
      const attrToUpdate = updates.attribute;
      const newAttributes = {
        ...character.attributes,
        [attrToUpdate]: character.attributes[attrToUpdate] + 1,
      };
      const newCharacterState = { ...character, attributes: newAttributes };
      handleUpdateCharacter(newCharacterState);
    } else {
      const newCharacterState = { ...character, ...updates };
      if (newCharacterState.bodyRefinementLevel >= BODY_REFINEMENT_LEVELS.length) return;
      if (newCharacterState.cultivationStage >= CULTIVATION_STAGES.length) return;
      if (newCharacterState.masteryLevel >= MASTERY_LEVELS.length) return;
      handleUpdateCharacter(newCharacterState);
    }
  };

  const handleImageUpload = async (file) => {
    if (!user) return;
    showNotification("Enviando imagem...", "success");
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `public/${user.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('character-images').upload(filePath, file);
    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      showNotification("Falha ao enviar imagem.", "error");
      return;
    }
    await fetchUserImages();
    showNotification("Imagem enviada!", "success");
  };

  const handleSelectImage = async (imageUrl) => {
    const updatedCharacter = { ...character, imageUrl };
    await handleUpdateCharacter(updatedCharacter);
    setIsImageTrayOpen(false);
  };

  const handleProficiencySelect = async (attribute) => {
    const updatedCharacter = { ...character, proficientAttribute: attribute };
    await handleUpdateCharacter(updatedCharacter);
    setIsProficiencyModalOpen(false);
    showNotification(`Proficiência em ${attribute.charAt(0).toUpperCase() + attribute.slice(1)} adquirida!`, "success");
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  if (isLoading || characterLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <AuthPage />;
  
  return (
    <div className="relative min-h-screen">
      <main>
        {character ? (
          <CharacterSheet 
            character={character} 
            onDelete={handleDeleteCharacter} 
            onUpdateCharacter={handleUpdateCharacter}
            showNotification={showNotification}
            addRollToHistory={addRollToHistory}
            onOpenImageTray={handleOpenImageTray}
            onTrain={handleProgressionChange}
          />
        ) : (
          <SheetManager onSave={handleSaveCharacter} />
        )}
      </main>

      {character && (
        <RollHistoryDrawer 
          history={rollHistory}
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
          onClearHistory={handleClearHistory}
        />
      )}

      <ImageSelectionTray
        isOpen={isImageTrayOpen}
        onClose={() => setIsImageTrayOpen(false)}
        images={userImages}
        onSelect={handleSelectImage}
        onUpload={handleImageUpload}
      />

      <ProficiencyChoiceModal
        isOpen={isProficiencyModalOpen}
        onSelect={handleProficiencySelect}
      />

      {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}

export default App;