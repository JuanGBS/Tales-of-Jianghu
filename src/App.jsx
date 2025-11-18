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
import GameMasterPanel from './pages/GameMasterPanel.jsx';
import InitiativeTracker from './components/combat/InitiativeTracker.jsx';

const defaultInventory = {
  weapon: { name: '', damage: '', attribute: '', properties: '' },
  armor: { type: 'none', properties: '' },
  general: [],
  money: 0
};

const mapToCamelCase = (data) => {
  if (!data) return null;
  return {
    proficientAttribute: data.proficient_attribute,
    id: data.id,
    userId: data.user_id,
    name: data.name,
    clanId: data.clan_id,
    fightingStyle: data.fighting_style,
    innateBodyId: data.innate_body_id,
    imageUrl: data.image_url,
    bodyRefinementLevel: data.body_refinement_level,
    cultivationStage: data.cultivation_stage,
    masteryLevel: data.mastery_level,
    attributes: data.attributes,
    stats: data.stats,
    techniques: data.techniques || [],
    proficientPericias: data.proficient_pericias || [],
    inventory: data.inventory || defaultInventory,
    createdAt: data.created_at,
  };
};

function AppContent() {
  const { user, profile, isLoading } = useAuth();
  const [character, setCharacter] = useState(null);
  const [characterLoading, setCharacterLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [rollHistory, setRollHistory] = useState(() => JSON.parse(localStorage.getItem('rollHistory') || '[]'));
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isImageTrayOpen, setIsImageTrayOpen] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [isProficiencyModalOpen, setIsProficiencyModalOpen] = useState(false);
  const [combatData, setCombatData] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleNextTurn = async () => {
    if (!combatData || profile?.role !== 'gm') return;
    const nextIndex = (combatData.current_turn_index + 1) % combatData.turn_order.length;
    const { error } = await supabase
      .from('combat')
      .update({ current_turn_index: nextIndex })
      .eq('id', combatData.id);
    if (error) {
      showNotification("Erro ao avançar o turno.", "error");
      console.error("Erro ao avançar o turno:", error);
    }
  };
  
  const handleEndPlayerTurn = async () => {
    if (!combatData || !character) return;
    const currentTurnCharacterId = combatData.turn_order[combatData.current_turn_index].character_id;
    if (character.id !== currentTurnCharacterId) {
      showNotification("Não é o seu turno para finalizar!", "error");
      return;
    }
    const nextIndex = (combatData.current_turn_index + 1) % combatData.turn_order.length;
    const { error } = await supabase
      .from('combat')
      .update({ current_turn_index: nextIndex })
      .eq('id', combatData.id);
    if (error) {
      showNotification("Erro ao finalizar o turno.", "error");
      console.error("Erro ao finalizar o turno:", error);
    }
  };

  const handleEndCombat = async () => {
    if (!combatData || profile?.role !== 'gm') return;
    const { error } = await supabase
      .from('combat')
      .update({ is_active: false })
      .eq('id', combatData.id);
    if (error) {
      showNotification("Erro ao encerrar combate.", "error");
      console.error("Erro ao encerrar combate:", error);
    } else {
      showNotification("Combate encerrado.", "success");
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchActiveCombat = async () => {
      const { data, error } = await supabase
        .from('combat')
        .select('*')
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') console.error("Erro ao buscar combate ativo:", error);
      setCombatData(data);
    };
    
    fetchActiveCombat();
    
    const channel = supabase
      .channel('public:combat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'combat' }, 
      (payload) => {
        console.log('Mudança no combate recebida!', payload);
        fetchActiveCombat();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user && profile && profile.role !== 'gm') {
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
  }, [user, profile]);

  const handleSaveCharacter = async (characterData) => {
    const { data, error } = await supabase
      .from('characters')
      .insert([
        { 
          user_id: user.id,
          name: characterData.name,
          clan_id: characterData.clanId,
          fighting_style: characterData.fightingStyle,
          innate_body_id: characterData.innateBodyId,
          attributes: characterData.attributes,
          stats: characterData.stats,
          proficient_pericias: characterData.proficientPericias,
          body_refinement_level: characterData.bodyRefinementLevel,
          cultivation_stage: characterData.cultivationStage,
          mastery_level: characterData.masteryLevel,
          techniques: characterData.techniques,
          inventory: defaultInventory,
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
      innate_body_id: updatedCharacter.innateBodyId,
      image_url: updatedCharacter.imageUrl,
      body_refinement_level: updatedCharacter.bodyRefinementLevel,
      cultivation_stage: updatedCharacter.cultivationStage,
      mastery_level: updatedCharacter.masteryLevel,
      attributes: updatedCharacter.attributes,
      stats: updatedCharacter.stats,
      techniques: updatedCharacter.techniques,
      proficient_pericias: updatedCharacter.proficientPericias,
      inventory: updatedCharacter.inventory,
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

  const addRollToHistory = (rollData) => {
    const newHistory = [rollData, ...rollHistory].slice(0, 15);
    setRollHistory(newHistory);
    setIsHistoryOpen(true);
  };

  const handleClearHistory = () => {
    setRollHistory([]);
    showNotification("Histórico de rolagens limpo!", "success");
  };

  const handleOpenImageTray = () => {
    fetchUserImages();
    setIsImageTrayOpen(true);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="relative min-h-screen">
      {combatData && combatData.is_active && (
        <InitiativeTracker turnOrder={combatData.turn_order} currentIndex={combatData.current_turn_index} />
      )}
      
      {profile?.role === 'gm' ? (
        <GameMasterPanel 
          combatData={combatData}
          onNextTurn={handleNextTurn}
          onEndCombat={handleEndCombat}
        />
      ) : (
        <main>
          {characterLoading ? (
            <div className="min-h-screen flex items-center justify-center">Carregando Ficha...</div>
          ) : (
            character ? (
              <CharacterSheet 
                character={character} 
                onDelete={handleDeleteCharacter} 
                onUpdateCharacter={handleUpdateCharacter}
                showNotification={showNotification}
                addRollToHistory={addRollToHistory}
                onOpenImageTray={handleOpenImageTray}
                onTrain={handleProgressionChange}
                combatData={combatData}
                onEndTurn={handleEndPlayerTurn}
              />
            ) : (
              <SheetManager onSave={handleSaveCharacter} />
            )
          )}
        </main>
      )}

      {(character || profile?.role === 'gm') && (
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