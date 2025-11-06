import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { supabase } from './services/supabaseClient';
import SheetManager from './pages/SheetManager.jsx';
import CharacterSheet from './pages/CharacterSheet.jsx';
import NotificationToast from './components/ui/NotificationToast.jsx';
import AuthPage from './pages/AuthPage.jsx';
import RollHistoryDrawer from './components/ui/RollHistoryDrawer.jsx';

const mapToCamelCase = (data) => {
  if (!data) return null;
  return {
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
  const { user, isLoading, signOut } = useAuth();
  const [character, setCharacter] = useState(null);
  const [characterLoading, setCharacterLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [rollHistory, setRollHistory] = useState(() => {
    const saved = localStorage.getItem('rollHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('rollHistory', JSON.stringify(rollHistory));
  }, [rollHistory]);

  const addRollToHistory = (rollData) => {
    const newHistory = [rollData, ...rollHistory].slice(0, 15);
    setRollHistory(newHistory);
    setIsHistoryOpen(true);
  };

  // --- INÍCIO DA ALTERAÇÃO ---
  // 1. Criamos a função para limpar o estado
  const handleClearHistory = () => {
    setRollHistory([]);
    // Opcional: mostrar uma notificação de sucesso
    showNotification("Histórico de rolagens limpo!", "success");
  };
  // --- FIM DA ALTERAÇÃO ---

  useEffect(() => {
    if (user) {
      const fetchCharacter = async () => {
        setCharacterLoading(true);
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id)
          .single();

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
          bodyRefinementLevel: characterData.bodyRefinementLevel,
          cultivationStage: characterData.cultivationStage,
          masteryLevel: characterData.masteryLevel,
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
    const { error } = await supabase.from('characters').delete().eq('user_id', user.id);
    if (error) {
      console.error("Erro ao apagar personagem:", error);
      showNotification("Falha ao apagar personagem.", "error");
    } else {
      setCharacter(null);
      setRollHistory([]);
    }
  };

  const handleUpdateCharacter = async (updatedCharacter) => {
    const dataToUpdate = {
      id: updatedCharacter.id,
      user_id: updatedCharacter.userId,
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

    const { data, error } = await supabase
      .from('characters')
      .update(dataToUpdate)
      .eq('id', updatedCharacter.id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar personagem:", error);
      showNotification("Falha ao salvar alterações.", "error");
    } else {
      setCharacter(mapToCamelCase(data));
    }
  };
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  if (isLoading || characterLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }
  
  return (
    <div className="relative min-h-screen">
      <main>
        {character ? (
          <CharacterSheet 
            character={character} 
            onDelete={handleDeleteCharacter} 
            onUpdateCharacter={handleUpdateCharacter}
            showNotification={showNotification}
            signOut={signOut}
            addRollToHistory={addRollToHistory}
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
          // --- INÍCIO DA ALTERAÇÃO ---
          // 2. Passamos a função para o componente filho
          onClearHistory={handleClearHistory}
          // --- FIM DA ALTERAÇÃO ---
        />
      )}

      {notification && (
        <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;