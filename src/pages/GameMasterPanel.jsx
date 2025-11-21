import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { useCombatManager } from "../hooks/useCombatManager";

// Importações de Dados
import { CLANS_DATA } from '../data/clans';
import { ARMOR_TYPES } from '../data/armorTypes';
import { BODY_REFINEMENT_LEVELS, CULTIVATION_STAGES, MASTERY_LEVELS } from '../data/gameData';
import { INNATE_BODIES } from '../data/innateBodies';

// Componentes
import GmCharacterCard from "../components/gm/GmCharacterCard";
import CharacterSheet from "./CharacterSheet";
import NotificationToast from "../components/ui/NotificationToast";
import GmImageUploadModal from "../components/gm/GmImageUploadModal";
import ImageViewerModal from "../components/gm/ImageViewerModal";
import StartCombatModal from "../components/gm/StartCombatModal";
import RollTestModal from "../components/character-sheet/RollTestModal";
import QuickStatInput from "../components/ui/QuickStatInput";
import CombatTrackerCarousel from "../components/gm/CombatTrackerCarousel"; // <--- Componente do Carrossel
import { parseDiceString, rollDice } from "../utils/dice";

import {
  TrashIcon, MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, PlayIcon, StopIcon, ForwardIcon,
  UserPlusIcon, BoltIcon, HeartIcon, ShieldCheckIcon, CubeIcon, ArrowPathIcon, EyeIcon, EyeSlashIcon, PencilSquareIcon,
  SparklesIcon, FireIcon, UserIcon
} from "@heroicons/react/24/solid";

const mapToCamelCase = (data) => {
  if (!data) return null;
  return {
    proficientAttribute: data.proficient_attribute, 
    id: data.id, userId: data.user_id, name: data.name, clanId: data.clan_id, fightingStyle: data.fighting_style, 
    innateBodyId: data.innate_body_id, imageUrl: data.image_url, image_url: data.image_url, 
    bodyRefinementLevel: data.body_refinement_level, cultivationStage: data.cultivation_stage, masteryLevel: data.mastery_level, 
    attributes: data.attributes, stats: data.stats, techniques: data.techniques || [], proficientPericias: data.proficient_pericias || [], 
    inventory: data.inventory || {}, createdAt: data.created_at, activeCombatId: data.active_combat_id, isNpc: data.is_npc, isInScene: data.is_in_scene 
  };
};

function GameMasterPanel() {
  const { user, signOut } = useAuth();
  const [notification, setNotification] = useState(null);
  const showNotification = (msg, type = 'success') => setNotification({ message: msg, type });

  const { combatData, localLogs, createCombat, startRound, nextTurn, endCombat, gmRoll, updateStat, sendCombatLog, addCombatLog } = useCombatManager(user, showNotification);

  const [characters, setCharacters] = useState([]); 
  const [allNpcs, setAllNpcs] = useState([]); 
  const [gmImages, setGmImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewingCharacter, setViewingCharacter] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isStartCombatModalOpen, setIsStartCombatModalOpen] = useState(false);
  const [rollModalData, setRollModalData] = useState(null); 
  
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (localLogs && localLogs.length > 0) {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [localLogs]);

  const fetchAllData = async () => {
    setIsLoading(true);
    const { data: allChars } = await supabase.from("characters").select("*").order("name", { ascending: true });
    const { data: imgs } = await supabase.from("gm_images").select("*").order("created_at", { ascending: false });

    if (allChars) {
      setCharacters(allChars.filter(c => !c.is_npc).map(mapToCamelCase));
      setAllNpcs(allChars.filter(c => c.is_npc).map(mapToCamelCase));
    }
    if (imgs) setGmImages(imgs);
    setIsLoading(false);
  };

  useEffect(() => { if (user) fetchAllData(); }, [user]);

  const handleToggleScene = async (npc, putInScene) => {
      setAllNpcs(prev => prev.map(n => n.id === npc.id ? { ...n, isInScene: putInScene } : n));
      await supabase.from('characters').update({ is_in_scene: putInScene }).eq('id', npc.id);
  };

  const handleQuickStatChange = async (charId, statField, newValue) => {
     updateStat(charId, statField, newValue);
     const val = parseInt(newValue) || 0;
     const updateList = (list) => list.map(c => c.id === charId ? { ...c, stats: { ...c.stats, [statField]: val } } : c);
     setCharacters(prev => updateList(prev));
     setAllNpcs(prev => updateList(prev));
  };

  const handleRollDamageFromLog = (logEntry) => {
      if (!logEntry.damageFormula) return;
      
      const diceConfig = parseDiceString(logEntry.damageFormula);
      const count = logEntry.type === 'crit' ? diceConfig.count * 2 : diceConfig.count;
      
      const { total, rolls } = rollDice(count, diceConfig.faces);
      const finalTotal = total + diceConfig.modifier;

      const critText = logEntry.type === 'crit' ? ' (Crítico!)' : '';
      const msg = `Dano: **${finalTotal}** [${rolls.join('+')}${diceConfig.modifier ? `+${diceConfig.modifier}` : ''}]${critText}`;

      addCombatLog(msg, 'damage');
  };

  const handleGmActionRoll = (npc, actionName, bonus, label, damageFormula = null) => {
    setRollModalData({ 
        title: `${actionName}`, 
        modifier: bonus, 
        modifierLabel: label, 
        onRollConfirmed: (result) => {
            const total = result.total;
            const roll = result.roll;
            const isCrit = roll === 20;
            const isFail = roll === 1;
            
            let logMsg = `${npc.name} usou **${actionName}**: Rolou **${total}** (${roll}${bonus >= 0 ? '+' : ''}${bonus}).`;
            
            if (isCrit) logMsg += " **CRÍTICO!**";
            if (isFail) logMsg += " **FALHA CRÍTICA!**";

            sendCombatLog(logMsg, isCrit ? 'crit' : (isFail ? 'fail' : 'info'), damageFormula);
        } 
    });
  };

  const handleOpenNpcAttackMenu = (charId) => {
    const char = [...allNpcs, ...characters].find(c => c.id === charId);
    if (!char) return;
    const weapon = char.inventory?.weapon || { name: 'Desarmado', attribute: 'Agilidade', damage: '1d4' };
    const attrKey = weapon.attribute?.toLowerCase() || 'agility';
    const attrValue = char.attributes?.[attrKey] || 0;
    const bonus = attrValue * (char.proficientAttribute === attrKey ? 2 : 1);
    
    handleGmActionRoll(char, `Ataque: ${weapon.name}`, bonus, attrKey, weapon.damage || '1d4');
  };

  const handleOpenNpcDamageMenu = (charId) => {
    const char = [...allNpcs, ...characters].find(c => c.id === charId);
    if (!char) return;
    const weapon = char.inventory?.weapon || { name: 'Desarmado', damage: '1d4', attribute: 'Agilidade' };
    const damageFormula = weapon.damage || '1d4';
    
    const attrKey = weapon.attribute?.toLowerCase() || 'agility';
    const bonus = char.attributes?.[attrKey] || 0; 

    const label = attrKey.charAt(0).toUpperCase() + attrKey.slice(1);

    handleGmActionRoll(char, `Dano: ${weapon.name}`, bonus, label, damageFormula);
  };

  const handleCreateNpcFromImage = async (imageUrl) => {
    const npcName = prompt("Nome do NPC:");
    if (!npcName) return;
    const newNpc = { user_id: user.id, name: npcName, image_url: imageUrl, is_npc: true, is_in_scene: true, clan_id: 'wang', fighting_style: 'lâmina', innate_body_id: 'none', attributes: { vigor: 1, agility: 1, discipline: 1, comprehension: 1, presence: 1 }, stats: { currentHp: 10, currentChi: 10, maxHp: 10, maxChi: 10, armorClass: 10 }, inventory: { weapon: { name: 'Desarmado', attribute: 'Agilidade' }, armor: { type: 'none' }, general: [] }, techniques: [] };
    const { data } = await supabase.from('characters').insert(newNpc).select().single();
    if (data) { showNotification("NPC Criado!", "success"); setAllNpcs(prev => [...prev, mapToCamelCase(data)]); }
  };

  const handleImageUpload = async (file, category) => {
      if(!file) return; const ext=file.name.split('.').pop(); const path=`public/gm/${category}/${Date.now()}.${ext}`;
      await supabase.storage.from("character-images").upload(path, file);
      const {data} = supabase.storage.from("character-images").getPublicUrl(path);
      await supabase.from("gm_images").insert({uploader_id:user.id, category, file_path:path, image_url:data.publicUrl});
      showNotification("Imagem enviada!", "success"); fetchAllData();
  };
  
  const handleDeleteImage = async (img) => { 
      if(!confirm("Apagar?")) return; await supabase.storage.from("character-images").remove([img.file_path]); 
      await supabase.from("gm_images").delete().eq("id", img.id); fetchAllData();
  };

  const handleUpdateNpc = async (u) => {
      setAllNpcs(p => p.map(n => n.id === u.id ? u : n)); 
      setViewingCharacter(u);
      const d = {
          name: u.name, clan_id: u.clanId, fighting_style: u.fightingStyle, innate_body_id: u.innateBodyId, body_refinement_level: u.bodyRefinementLevel, cultivation_stage: u.cultivationStage, mastery_level: u.mastery_level, attributes: u.attributes, stats: u.stats, techniques: u.techniques, inventory: u.inventory, is_in_scene: u.isInScene
      };
      await supabase.from('characters').update(d).eq('id', u.id);
      showNotification("Salvo!", "success");
  };

  const handleViewCharacter = (c) => setViewingCharacter(c);
  const handleBackToList = () => { setViewingCharacter(null); fetchAllData(); };

  // --- RENDER COMBAT ---
  const renderCombatView = () => {
    const turnOrder = combatData.turn_order || [];
    const currentIdx = combatData.current_turn_index;
    const activeCombatant = turnOrder[currentIdx];
    const activeFullData = [...allNpcs, ...characters].find(c => c.id === activeCombatant?.character_id);
    const isActiveNpc = activeCombatant?.is_npc;
    const logs = localLogs || [];

    return (
        <div className="max-w-6xl mx-auto">
            {/* HEADER COMBATE */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                <div><h2 className="text-3xl font-bold text-brand-text">Mesa de Combate</h2><p className="text-gray-500 text-sm">{combatData.status === 'pending_initiative' ? 'Aguardando Iniciativas...' : 'Rodada Ativa.'}</p></div>
                <div className="flex gap-3">
                    {combatData.status === 'pending_initiative' ? (
                        <button onClick={startRound} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 animate-pulse"><PlayIcon className="h-6 w-6" /> Iniciar Rodada</button>
                    ) : (
                        <button onClick={nextTurn} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700"><ForwardIcon className="h-6 w-6" /> Próximo Turno</button>
                    )}
                    <button onClick={endCombat} className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold hover:bg-red-200 border border-red-200"><StopIcon className="h-6 w-6" /> Encerrar</button>
                </div>
            </div>

            {/* INICIATIVAS PENDENTES */}
            {combatData.status === 'pending_initiative' && (
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-yellow-200">
                    <h4 className="font-bold text-gray-600 mb-2">Aguardando:</h4>
                    <div className="flex flex-wrap gap-3">
                        {turnOrder.map((p, idx) => (
                            <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${p.initiative !== null ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                {p.initiative !== null ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <ClockIcon className="h-5 w-5 text-yellow-500" />}
                                <span className="font-semibold">{p.name}</span>
                                {p.initiative === null && <button onClick={() => gmRoll(idx)} className="ml-2 p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Rolar pelo jogador"><CubeIcon className="h-4 w-4" /></button>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CARROSSEL DE COMBATENTES (Substituindo o Grid antigo) */}
            <div className="mb-8">
                <CombatTrackerCarousel 
                    turnOrder={turnOrder}
                    currentIdx={currentIdx}
                    combatStatus={combatData.status}
                    allCharacters={[...characters, ...allNpcs]}
                    onStatChange={handleQuickStatChange}
                    onAttackClick={handleOpenNpcAttackMenu}
                />
            </div>

            {/* PAINEL INFERIOR (Integração Completa) */}
            {combatData.status === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
                    
                    {/* PAINEL DE AÇÕES DO NPC (Esquerda) */}
                    <div className="md:col-span-2 bg-white rounded-xl shadow-lg border-2 border-red-100 flex flex-col h-full overflow-hidden">
                        {/* Header Fixo */}
                        <div className="flex-none flex items-center justify-between p-6 pb-4 border-b border-red-50">
                            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2">
                                <BoltIcon className="h-6 w-6 text-red-500" />
                                Ações de {activeCombatant?.name}
                            </h3>
                            {isActiveNpc && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold border border-red-200">NPC ATIVO</span>}
                        </div>

                        {/* Conteúdo Rolável */}
                        <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar min-h-0">
                            {isActiveNpc && activeFullData ? (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-gray-500 text-sm mb-2 uppercase tracking-wide">Ataque & Dano</h4>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleOpenNpcAttackMenu(activeFullData.id)}
                                                className="flex-1 flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors group"
                                            >
                                                <div className="text-left">
                                                    <p className="font-bold text-red-900 text-lg">Ataque: {activeFullData.inventory?.weapon?.name || "Desarmado"}</p>
                                                </div>
                                                <span className="font-bold text-red-400 group-hover:text-red-600">Rolar ➔</span>
                                            </button>

                                            <button 
                                                onClick={() => handleOpenNpcDamageMenu(activeFullData.id)}
                                                className="flex-none flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors group w-32"
                                            >
                                                <FireIcon className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
                                                <span className="font-bold text-orange-700 text-sm">Dano</span>
                                                <span className="text-xs text-orange-500">{activeFullData.inventory?.weapon?.damage || '1d4'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-500 text-sm mb-2 uppercase tracking-wide">Técnicas de Combate</h4>
                                        {activeFullData.techniques && activeFullData.techniques.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {activeFullData.techniques.map((tech, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => {
                                                            const attr = tech.attribute?.toLowerCase() || 'agility';
                                                            const bonus = (activeFullData.attributes?.[attr] || 0) * (activeFullData.proficientAttribute === attr ? 2 : 1);
                                                            handleGmActionRoll(activeFullData, `Técnica: ${tech.name}`, bonus, attr);
                                                        }}
                                                        className="flex flex-col p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors"
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-purple-900">{tech.name}</span>
                                                            <span className="text-xs bg-white px-2 py-0.5 rounded text-purple-700 font-mono">{tech.cost || "0 PC"}</span>
                                                        </div>
                                                        <p className="text-xs text-purple-700 line-clamp-2">{tech.effect}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm italic bg-gray-50 p-3 rounded border">Nenhuma técnica registrada.</p>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-500 text-sm mb-2 uppercase tracking-wide">Testes de Atributo</h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {Object.keys(activeFullData.attributes || {}).map(attr => (
                                                <button 
                                                    key={attr}
                                                    onClick={() => {
                                                        const bonus = (activeFullData.attributes[attr]) * (activeFullData.proficientAttribute === attr ? 2 : 1);
                                                        handleGmActionRoll(activeFullData, `Teste de ${attr}`, bonus, attr);
                                                    }}
                                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-semibold text-gray-600 capitalize"
                                                >
                                                    {attr}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    {isActiveNpc ? (
                                        <p>Dados do NPC não encontrados.</p>
                                    ) : (
                                        <>
                                            <UserIcon className="h-12 w-12 mb-2 opacity-20" />
                                            <p className="font-bold text-lg">Turno do Jogador</p>
                                            <p className="text-sm">Aguarde o jogador realizar sua ação.</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LOG DE COMBATE (Direita) */}
                    <div className="md:col-span-1 bg-gray-900 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full overflow-hidden">
                        {/* Header Fixo */}
                        <div className="flex-none flex items-center gap-2 p-4 pb-2 border-b border-gray-700">
                            <SparklesIcon className="h-5 w-5 text-yellow-500" />
                            <h3 className="text-lg font-bold text-gray-100">Histórico</h3>
                        </div>
                        
                        {/* Conteúdo Rolável */}
                        <div className="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar min-h-0">
                            {logs.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">
                                    <p>O combate começou...</p>
                                </div>
                            ) : (
                                logs.map((log, idx) => (
                                    <div key={log.id || idx} className={`p-2 rounded text-sm border-l-4 mb-2 ${
                                        log.type === 'crit' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-100' :
                                        log.type === 'fail' ? 'bg-red-900/30 border-red-600 text-red-200' :
                                        log.type === 'damage' ? 'bg-orange-900/30 border-orange-500 text-orange-200' :
                                        'bg-gray-800 border-purple-500 text-gray-300'
                                    }`}>
                                        <p dangerouslySetInnerHTML={{ 
                                            __html: log.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                                        }} />
                                        
                                        {log.damageFormula && (
                                            <button 
                                                onClick={() => handleRollDamageFromLog(log)}
                                                className="mt-2 px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded flex items-center gap-1 transition-colors shadow-sm w-full justify-center"
                                            >
                                                <FireIcon className="h-3 w-3" /> Rolar Dano ({log.damageFormula})
                                            </button>
                                        )}

                                        <span className="text-[10px] text-gray-500 block mt-1 text-right">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            )}
            
            <RollTestModal 
                isOpen={rollModalData !== null} 
                onClose={() => setRollModalData(null)} 
                title={rollModalData?.title} 
                modifier={rollModalData?.modifier} 
                modifierLabel={rollModalData?.modifierLabel} 
                diceFormula={rollModalData?.diceFormula}
                onRollComplete={(result) => {
                    if (rollModalData?.onRollConfirmed) {
                        rollModalData.onRollConfirmed(result);
                    }
                }} 
            />
            {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
    );
  }; // FIM RENDER COMBAT

  // --- RENDER DASHBOARD VIEW ---
  const renderDashboardView = () => {
    const categories = ["todos", ...new Set(gmImages.map((img) => img.category))];
    const filteredImages = activeCategory === "todos" ? gmImages : gmImages.filter((img) => img.category === activeCategory);
    const npcsInScene = allNpcs.filter(n => n.isInScene);

    return (
        <>
            <div className="flex justify-between items-start mb-10">
                <div><h1 className="text-5xl font-bold text-brand-primary">Painel do Mestre</h1><p className="text-gray-500 mt-1">Gerencie jogadores e NPCs.</p></div>
                <div className="flex gap-4">
                    <button onClick={endCombat} className="text-red-500 text-sm font-bold hover:underline flex items-center" title="Resetar em caso de erro"><ArrowPathIcon className="h-4 w-4 mr-1" /> Reset</button>
                    <button onClick={() => setIsStartCombatModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2" disabled={!!combatData}><PlayIcon className="h-5 w-5" /> Novo Combate</button>
                    <button onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold text-brand-text mb-4 border-b pb-2">Jogadores</h2>
                        {isLoading ? <p>Carregando...</p> : (<div className="space-y-3">{characters.map((char) => <GmCharacterCard key={char.id} character={char} onViewCharacter={handleViewCharacter} />)}</div>)}
                    </div>
                    <div className="bg-purple-50 p-6 rounded-2xl shadow-lg border border-purple-100">
                        <div className="flex justify-between items-center mb-4 border-b pb-2 border-purple-200"><h2 className="text-2xl font-bold text-purple-900">Em Cena</h2></div>
                        {isLoading ? <p>Carregando...</p> : (<div className="space-y-3">{npcsInScene.map((char) => (<div key={char.id} className="relative group"><GmCharacterCard character={char} onViewCharacter={handleViewCharacter} /><button onClick={(e) => { e.stopPropagation(); handleToggleScene(char, false); }} className="absolute top-2 right-2 bg-red-100 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Remover de Cena"><EyeSlashIcon className="h-4 w-4" /></button></div>))}</div>)}
                    </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b pb-4"><h2 className="text-3xl font-bold text-brand-text">Personagens do Jianghu</h2><button onClick={() => setIsUploadModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Adicionar Imagem</button></div>
                <div className="flex space-x-2 border-b mb-4 pb-2 overflow-x-auto">{categories.map((cat) => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-t-lg capitalize ${activeCategory === cat ? "bg-purple-500 text-white" : "text-gray-500 hover:bg-gray-200"}`}>{cat}</button>))}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredImages.map((img) => {
                        const linkedNpc = allNpcs.find(n => n.imageUrl === img.image_url);
                        const isLinkedNpcInScene = linkedNpc?.isInScene;
                        return (
                            <div key={img.id} className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${linkedNpc ? 'border-purple-400' : 'border-transparent'}`}>
                                <img src={img.image_url} alt={img.category} className="w-full h-full object-cover" />
                                {linkedNpc && <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white ${isLinkedNpcInScene ? 'bg-green-500' : 'bg-purple-500'}`}>{linkedNpc.name}</div>}
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 px-2 text-center">
                                    {!linkedNpc ? (
                                        <button onClick={() => handleCreateNpcFromImage(img.image_url)} className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-500 flex items-center w-full justify-center"><UserPlusIcon className="h-4 w-4 mr-1" /> Criar NPC</button>
                                    ) : (
                                        <>
                                            <button onClick={() => handleToggleScene(linkedNpc, !isLinkedNpcInScene)} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-full justify-center ${isLinkedNpcInScene ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>{isLinkedNpcInScene ? <><EyeSlashIcon className="h-4 w-4 mr-1"/> Remover</> : <><EyeIcon className="h-4 w-4 mr-1"/> Por em Cena</>}</button>
                                            <button onClick={() => setViewingCharacter(linkedNpc)} className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold hover:bg-purple-500 flex items-center w-full justify-center"><PencilSquareIcon className="h-4 w-4 mr-1" /> Editar</button>
                                        </>
                                    )}
                                    <div className="flex space-x-2 mt-2">
                                        <button onClick={() => setViewingImage(img.image_url)} className="p-2 bg-gray-200/50 rounded-full text-white hover:bg-gray-600"><MagnifyingGlassIcon className="h-4 w-4" /></button>
                                        <button onClick={() => handleDeleteImage(img)} className="p-2 bg-red-500/50 rounded-full text-white hover:bg-red-600"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <StartCombatModal isOpen={isStartCombatModalOpen} onClose={() => setIsStartCombatModalOpen(false)} characters={[...characters, ...npcsInScene]} onStartCombat={createCombat} />
            <GmImageUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleImageUpload} existingCategories={[...new Set(gmImages.map((img) => img.category))]} />
            <ImageViewerModal isOpen={viewingImage !== null} onClose={() => setViewingImage(null)} imageUrl={viewingImage} />
        </>
    );
  }; // FIM RENDER DASHBOARD

  // --- MAIN RENDER ---
  if (viewingCharacter) {
    const isMyNpc = viewingCharacter.isNpc && viewingCharacter.userId === user.id;
    return (
        <> 
            <CharacterSheet character={viewingCharacter} onBack={handleBackToList} showNotification={showNotification} onUpdateCharacter={isMyNpc ? handleUpdateNpc : () => {}} isGmMode={isMyNpc} /> 
            {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />} 
        </>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      {combatData ? renderCombatView() : renderDashboardView()}
      {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}

export default GameMasterPanel;