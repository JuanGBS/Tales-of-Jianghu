import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { supabase } from './services/supabaseClient';

// Hooks
import { usePlayerCombat } from './hooks/usePlayerCombat';

// Componentes
import SheetManager from './pages/SheetManager.jsx';
import CharacterSheet from './pages/CharacterSheet.jsx';
import NotificationToast from './components/ui/NotificationToast.jsx';
import AuthPage from './pages/AuthPage.jsx';
import RollHistoryDrawer from './components/ui/RollHistoryDrawer.jsx';
import ImageSelectionTray from './components/ui/ImageSelectionTray.jsx';
import ProficiencyChoiceModal from './components/character-sheet/ProficiencyChoiceModal.jsx';
import GameMasterPanel from './pages/GameMasterPanel.jsx';
import InitiativeTracker from './components/combat/InitiativeTracker.jsx';
import InitiativeRollModal from './components/combat/InitiativeRollModal.jsx';
import RollTestModal from './components/character-sheet/RollTestModal.jsx';

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
    activeCombatId: data.active_combat_id
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

  // Estado para rolagem de dano do histórico
  const [damageModalData, setDamageModalData] = useState(null);

  const showNotification = (message, type = 'success') => setNotification({ message, type });

  // HOOK DE COMBATE DO JOGADOR
  const { 
    combatData, 
    showInitiativeRoll, 
    setShowInitiativeRoll,
    sendInitiative, 
    endTurn, 
    forceRefresh,
    sendPlayerLog
  } = usePlayerCombat(character, showNotification);

  useEffect(() => {
    if (!character?.id) return;
    const charChannel = supabase
      .channel(`app-char-sync-${character.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'characters', filter: `id=eq.${character.id}` }, (payload) => {
          const newChar = mapToCamelCase(payload.new);
          setCharacter(newChar);
      })
      .subscribe();
    return () => { supabase.removeChannel(charChannel); };
  }, [character?.id]);

  useEffect(() => {
    if (user && profile && profile.role !== 'gm') {
      const fetchCharacter = async () => {
        setCharacterLoading(true);
        const { data } = await supabase.from('characters').select('*').eq('user_id', user.id).single();
        if (data) setCharacter(mapToCamelCase(data));
        setCharacterLoading(false);
      };
      fetchCharacter();
    } else {
      setCharacterLoading(false);
      setCharacter(null);
    }
  }, [user, profile]);

  const handlePlayerInitiativeRoll = (val) => {
      sendInitiative(val);
      setShowInitiativeRoll(false);
  };

  const handleEndPlayerTurn = () => {
    if (!combatData) return;
    const currentId = combatData.turn_order[combatData.current_turn_index]?.character_id;
    if (character.id !== currentId) {
      showNotification("Não é o seu turno!", "error");
      return;
    }
    endTurn();
  };

  // Conecta o log com o hook, passando todos os dados necessários
  const handleSendLog = (actionName, result, damageFormula, weaponCategory, damageBonus) => {
      if (combatData && combatData.status === 'active') {
          sendPlayerLog(actionName, result, damageFormula, weaponCategory, damageBonus);
      }
  };

  const fetchUserImages = async () => { 
    if (!user) return; 
    const { data } = await supabase.storage.from('character-images').list(`public/${user.id}`, { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' }});
    if (data) { const urls = data.map(f => ({ id: f.id, name: f.name, publicURL: supabase.storage.from('character-images').getPublicUrl(`public/${user.id}/${f.name}`).data.publicUrl })); setUserImages(urls); }
  };
  
  const handleSaveCharacter = async (data) => { const { data: r } = await supabase.from('characters').insert([{ user_id: user.id, ...data, inventory: defaultInventory }]).select().single(); setCharacter(mapToCamelCase(r)); };
  const handleDeleteCharacter = async () => { await supabase.from('characters').delete().eq('id', character.id); setCharacter(null); };
  const handleUpdateCharacter = async (u) => { const d = { proficient_attribute: u.proficientAttribute, name: u.name, clan_id: u.clanId, fighting_style: u.fightingStyle, innate_body_id: u.innateBodyId, image_url: u.imageUrl, body_refinement_level: u.bodyRefinementLevel, cultivation_stage: u.cultivationStage, mastery_level: u.mastery_level, attributes: u.attributes, stats: u.stats, techniques: u.techniques, proficient_pericias: u.proficientPericias, inventory: u.inventory }; const { data } = await supabase.from('characters').update(d).eq('id', u.id).select().single(); if(data) setCharacter(mapToCamelCase(data)); };
  
  const handleProgressionChange = (updates) => { 
      if (updates.type === 'attribute_increase') { 
          handleUpdateCharacter({ ...character, attributes: { ...character.attributes, [updates.attribute]: character.attributes[updates.attribute] + 1 } }); 
      } else { 
          handleUpdateCharacter({ ...character, ...updates }); 
      } 
  };
  
  const handleImageUpload = async (f) => { const path = `public/${user.id}/${user.id}-${Date.now()}.${f.name.split('.').pop()}`; await supabase.storage.from('character-images').upload(path, f); await fetchUserImages(); };
  const handleSelectImage = async (url) => { handleUpdateCharacter({ ...character, imageUrl: url }); setIsImageTrayOpen(false); };
  const handleProficiencySelect = async (attr) => { handleUpdateCharacter({ ...character, proficientAttribute: attr }); setIsProficiencyModalOpen(false); };
  
  const addRollToHistory = (r) => { 
      setRollHistory(prev => [r, ...prev].slice(0, 15)); 
      setIsHistoryOpen(true); 
      // Passa o damageBonus (r.damageBonus)
      handleSendLog(r.name, { total: r.total, roll: r.roll, modifier: r.modifier }, r.damageFormula || null, r.weaponCategory || null, r.damageBonus || 0);
  };
  
  const handleClearHistory = () => { setRollHistory([]); };
  const handleOpenImageTray = () => { fetchUserImages(); setIsImageTrayOpen(true); };

  const handleHistoryDamageRoll = (historyItem) => {
    setDamageModalData({
        title: `Dano: ${historyItem.name}`,
        diceFormula: historyItem.damageFormula,
        modifier: 0, 
        modifierLabel: 'Bônus'
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <AuthPage />;

  return (
    <div className="relative min-h-screen">
      {combatData?.status === 'active' && (
        <InitiativeTracker turnOrder={combatData.turn_order} currentIndex={combatData.current_turn_index} />
      )}
      
      {profile?.role === 'gm' ? (
        <GameMasterPanel />
      ) : (
        <main>
          {character && (
            <InitiativeRollModal
              isOpen={showInitiativeRoll}
              onRollInitiative={handlePlayerInitiativeRoll}
              agilityBonus={character.attributes.agility}
            />
          )}
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
                onForceRefresh={forceRefresh}
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
            onRollDamage={handleHistoryDamageRoll}
        />
      )}

      <ImageSelectionTray isOpen={isImageTrayOpen} onClose={() => setIsImageTrayOpen(false)} images={userImages} onSelect={handleSelectImage} onUpload={handleImageUpload} />
      <ProficiencyChoiceModal isOpen={isProficiencyModalOpen} onSelect={handleProficiencySelect} />
      
      <RollTestModal 
        isOpen={!!damageModalData} 
        onClose={() => setDamageModalData(null)}
        title={damageModalData?.title}
        modifier={damageModalData?.modifier}
        modifierLabel={damageModalData?.modifierLabel}
        diceFormula={damageModalData?.diceFormula}
        onRollComplete={(result) => {
             addRollToHistory({ 
                 name: damageModalData.title, 
                 roll: result.roll, 
                 modifier: result.modifier, 
                 total: result.total,
                 damageFormula: null 
             });
        }}
      />

      {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

function App() { return <AuthProvider><AppContent /></AuthProvider>; }
export default App;