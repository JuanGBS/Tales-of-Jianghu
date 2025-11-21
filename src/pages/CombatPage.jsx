import React from 'react';
import { BoltIcon, ShieldCheckIcon, HandRaisedIcon, PlusCircleIcon, CheckCircleIcon, EyeIcon, ClockIcon, NoSymbolIcon, ArrowPathIcon, FireIcon } from '@heroicons/react/24/solid';
import { ATTRIBUTE_TRANSLATIONS } from '../data/translations'; // Import opcional para label, mas não estritamente necessário para a lógica

function CombatPage({ character, combatState, onNewTurn, openRollModal, onOpenAttackModal, onOpenMinorActionModal, onActionUsed, isMyTurn, onEndTurn, combatData, onRefresh }) {

  if (!combatData) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col h-full items-center justify-center text-center">
        <NoSymbolIcon className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-500">Nenhum Combate Ativo</h3>
        <p className="text-gray-400 text-sm mt-2">Aguarde o Mestre iniciar.</p>
        <button onClick={onRefresh} className="mt-4 text-purple-600 font-bold text-sm flex items-center"><ArrowPathIcon className="h-4 w-4 mr-1" /> Forçar Sincronização</button>
      </div>
    );
  }

  if (combatData.status === 'pending_initiative') {
    const myData = combatData.turn_order.find(p => p.character_id === character.id);
    const myInitiative = myData?.initiative;
    const hasRolled = myInitiative !== null && myInitiative !== undefined;

    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col h-full items-center justify-center text-center">
        <div className="animate-bounce bg-purple-100 p-6 rounded-full mb-6">
          <ClockIcon className="h-16 w-16 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-brand-text mb-2">Preparando Combate...</h2>
        
        <button 
            onClick={onRefresh}
            className="flex items-center gap-2 text-sm text-purple-600 font-semibold hover:bg-purple-50 px-3 py-1 rounded-lg mb-4 transition-colors"
        >
            <ArrowPathIcon className="h-4 w-4" /> Atualizar Status / Destravar
        </button>
        
        {!hasRolled ? (
          <div className="space-y-2">
             <p className="text-gray-600 text-lg font-bold animate-pulse">Role sua Iniciativa!</p>
             <p className="text-sm text-gray-500">(Janela aberta)</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-green-600 font-bold text-xl">Sua Iniciativa: {myInitiative}</p>
            <p className="text-gray-500">Aguardando o Mestre.</p>
          </div>
        )}

        <div className="mt-8 w-full max-w-md bg-gray-50 rounded-lg p-4 border text-left max-h-60 overflow-y-auto">
          <h4 className="font-bold text-gray-500 text-sm mb-2 sticky top-0 bg-gray-50 pb-1">Participantes:</h4>
          <ul className="space-y-2">
            {combatData.turn_order.map((p, idx) => (
              <li key={idx} className="flex justify-between items-center border-b pb-1 last:border-0">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                   {p.is_npc && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">NPC</span>}
                   {p.name}
                </span>
                {p.initiative !== null ? (
                  <span className="text-purple-600 font-bold">{p.initiative}</span>
                ) : (
                  <span className="text-gray-400 text-sm italic">...</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const currentTurnIndex = combatData.current_turn_index || 0;
  const turnOrder = combatData.turn_order || [];
  const activeParticipant = turnOrder[currentTurnIndex];
  const activeName = activeParticipant ? activeParticipant.name : '...';

  const handleDodge = () => openRollModal({ title: 'Teste de Esquiva', modifier: character.attributes.agility, modifierLabel: 'Agilidade' });
  const handleBlock = () => openRollModal({ title: 'Teste de Bloqueio', modifier: character.attributes.vigor, modifierLabel: 'Vigor' });
  const handleMovement = () => { if (!combatState.actionsUsed.movement) onActionUsed('movement'); }

  // --- ROLAGEM DE DANO DO JOGADOR (CORRIGIDO) ---
  const handleRollDamage = () => {
      const weapon = character.inventory?.weapon || { name: 'Desarmado', damage: '1d4', attribute: 'agility' };
      const diceFormula = weapon.damage || '1d4';
      
      // 1. Identifica qual atributo a arma usa (ex: 'agility', 'vigor')
      const attrKey = weapon.attribute?.toLowerCase() || 'agility';
      
      // 2. Busca o valor desse atributo na ficha do personagem
      // Se não achar, assume 0.
      const bonus = character.attributes?.[attrKey] || 0;
      
      // 3. Label para mostrar no modal (ex: "Agilidade")
      // const attrLabel = ATTRIBUTE_TRANSLATIONS[attrKey] || 'Bônus'; (Se tiver o import)
      const attrLabel = attrKey.charAt(0).toUpperCase() + attrKey.slice(1); // Fallback simples

      openRollModal({
          title: `Dano: ${weapon.name}`,
          diceFormula: diceFormula,
          modifier: bonus, // <--- AQUI ESTAVA O ERRO (era 0)
          modifierLabel: attrLabel,
          onRollConfirmed: () => {
              // Dano não gasta ação
          }
      });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col max-h-[70vh] h-full relative">
      <div className="flex justify-between items-center border-b pb-2 mb-4 flex-shrink-0">
        <h3 className="text-xl font-semibold text-brand-text">Painel de Combate</h3>
        {isMyTurn ? (
          <span className="text-sm font-bold text-green-600 animate-pulse bg-green-100 px-3 py-1 rounded-full shadow-sm">SEU TURNO</span>
        ) : (
          <span className="text-sm font-bold text-gray-500 flex items-center bg-gray-100 px-3 py-1 rounded-full"><ClockIcon className="h-4 w-4 mr-1" /> Vez de: {activeName}</span>
        )}
      </div>
      
      <div className="absolute top-0 right-0 mt-[-40px]">
         <button onClick={onRefresh} className="text-xs text-gray-400 hover:text-purple-600 flex items-center gap-1 p-4"><ArrowPathIcon className="h-4 w-4" /></button>
      </div>

      {!isMyTurn && <div className="absolute inset-0 top-16 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-b-2xl pointer-events-none"></div>}
      
      <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-700 text-sm">Ações no Turno</h4>
            {isMyTurn && (<button onClick={onNewTurn} className="text-xs font-semibold text-purple-600 hover:text-purple-800 underline">Resetar (Debug)</button>)}
          </div>
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-2 rounded-lg text-center font-semibold text-sm">
            <button onClick={handleMovement} disabled={!isMyTurn || combatState.actionsUsed.movement} className={`py-2 rounded-md transition-all ${combatState.actionsUsed.movement ? 'line-through text-gray-400 bg-gray-200' : 'text-gray-800 bg-white shadow-sm hover:bg-gray-50'}`}>Movimento</button>
            <span className={`py-2 rounded-md flex items-center justify-center ${combatState.actionsUsed.major ? 'line-through text-gray-400 bg-gray-200' : 'text-gray-800 bg-white shadow-sm'}`}>Ação Maior</span>
            <span className={`py-2 rounded-md flex items-center justify-center ${combatState.actionsUsed.minor ? 'line-through text-gray-400 bg-gray-200' : 'text-gray-800 bg-white shadow-sm'}`}>Ação Menor</span>
          </div>
          {combatState.isConcentrated && (<div className="mt-3 bg-blue-50 border border-blue-200 p-2 rounded-lg flex items-center justify-center text-blue-800 text-sm font-bold animate-pulse"><EyeIcon className="h-4 w-4 mr-2" /> Concentrado (Vantagem no Ataque)</div>)}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
              <h4 className="font-bold text-gray-700 block text-sm">Ação Maior</h4>
              <button onClick={onOpenAttackModal} disabled={!isMyTurn || combatState.actionsUsed.major} className="w-full flex flex-col items-center justify-center space-y-1 p-4 bg-red-50 text-red-700 font-bold rounded-xl border-2 border-red-100 hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
                  <BoltIcon className="h-8 w-8" /><span>Atacar / Técnica</span>
              </button>
              {/* Botão de Dano Separado */}
              <button onClick={handleRollDamage} disabled={!isMyTurn} className="w-full flex items-center justify-center gap-2 p-2 bg-orange-50 text-orange-700 font-bold rounded-lg border border-orange-200 hover:bg-orange-100 disabled:opacity-50 transition-all">
                  <FireIcon className="h-5 w-5" /> <span>Rolar Dano</span>
              </button>
          </div>
          
          <div>
              <h4 className="font-bold text-gray-700 block text-sm mb-2">Ação Menor</h4>
              <button onClick={onOpenMinorActionModal} disabled={!isMyTurn || combatState.actionsUsed.minor} className="w-full flex flex-col items-center justify-center space-y-1 p-4 bg-blue-50 text-blue-700 font-bold rounded-xl border-2 border-blue-100 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
                  <PlusCircleIcon className="h-8 w-8" /><span>Usar Ação Menor</span>
              </button>
          </div>
        </div>
        
        <div className="relative z-20 pt-4 border-t mt-2">
          <h4 className="font-bold text-gray-700 block text-sm mb-2">Defesa Ativa (Reação)</h4>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={handleDodge} className="flex items-center justify-center space-x-2 p-3 bg-white text-green-700 font-bold rounded-lg border-2 border-green-100 hover:bg-green-50 hover:border-green-300 transition-all shadow-sm"><HandRaisedIcon className="h-5 w-5" /><span>Esquivar</span></button>
             <button onClick={handleBlock} className="flex items-center justify-center space-x-2 p-3 bg-white text-yellow-700 font-bold rounded-lg border-2 border-yellow-100 hover:bg-yellow-50 hover:border-yellow-300 transition-all shadow-sm"><ShieldCheckIcon className="h-5 w-5" /><span>Bloquear</span></button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t relative z-20">
        <button onClick={onEndTurn} disabled={!isMyTurn} className={`w-full flex items-center justify-center space-x-2 p-4 rounded-xl font-bold text-lg shadow-lg transition-all ${isMyTurn ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] cursor-pointer' : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'}`}><CheckCircleIcon className="h-6 w-6" /><span>{isMyTurn ? 'Finalizar Turno' : `Aguardando ${activeName}...`}</span></button>
      </div>
    </div>
  );
}

export default CombatPage;