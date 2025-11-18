import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import GmCharacterCard from "../components/gm/GmCharacterCard";
import CharacterSheet from "./CharacterSheet";
import NotificationToast from "../components/ui/NotificationToast";
import GmImageUploadModal from "../components/gm/GmImageUploadModal";
import ImageViewerModal from "../components/gm/ImageViewerModal";
import StartCombatModal from "../components/gm/StartCombatModal";
import { TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

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
    inventory: data.inventory || {},
    createdAt: data.created_at,
  };
};

function GameMasterPanel({ combatData, onNextTurn, onEndCombat }) {
  const { user, signOut } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [gmImages, setGmImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingCharacter, setViewingCharacter] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [viewingImage, setViewingImage] = useState(null);
  const [isStartCombatModalOpen, setIsStartCombatModalOpen] = useState(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    const { data: chars, error: charsError } = await supabase
      .from("characters")
      .select("*")
      .order("name", { ascending: true });
    const { data: imgs, error: imgsError } = await supabase
      .from("gm_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (charsError) {
      console.error("Erro ao buscar personagens:", charsError);
    } else {
      setCharacters(chars);
    }

    if (imgsError) {
      console.error("Erro ao buscar imagens:", imgsError);
    } else {
      setGmImages(imgs);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleStartCombat = async (participants) => {
    showNotification("Rolando iniciativas e iniciando combate...", "success");

    const turnOrder = participants.map((char) => {
      const agility = char.attributes?.agility || 0;
      const initiativeRoll = Math.floor(Math.random() * 20) + 1 + agility;
      return {
        character_id: char.id,
        name: char.name,
        initiative: initiativeRoll,
        image_url: char.image_url,
      };
    });

    turnOrder.sort((a, b) => b.initiative - a.initiative);

    await supabase
      .from("combat")
      .update({ is_active: false })
      .eq("is_active", true);

    const { error } = await supabase.from("combat").insert({
      gm_id: user.id,
      is_active: true,
      turn_order: turnOrder,
      current_turn_index: 0,
    });

    if (error) {
      showNotification("Erro ao iniciar combate.", "error");
      console.error(error);
    } else {
      showNotification("Combate iniciado!", "success");
    }
  };

  const handleImageUpload = async (file, category) => {
    if (!file || !category || !user) return;
    showNotification("Enviando imagem...", "success");
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/gm-gallery/${category}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("character-images")
      .upload(filePath, file);
    if (uploadError) {
      showNotification("Falha no upload.", "error");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("character-images").getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("gm_images").insert({
      uploader_id: user.id,
      category,
      file_path: filePath,
      image_url: publicUrl,
    });

    if (dbError) {
      showNotification("Falha ao salvar no banco de dados.", "error");
    } else {
      showNotification("Imagem adicionada!", "success");
      fetchAllData();
    }
  };

  const handleDeleteImage = async (image) => {
    if (!window.confirm("Tem certeza que deseja apagar esta imagem?")) return;

    const { error: storageError } = await supabase.storage
      .from("character-images")
      .remove([image.file_path]);
    if (storageError) {
      showNotification("Erro ao apagar arquivo.", "error");
      return;
    }

    const { error: dbError } = await supabase
      .from("gm_images")
      .delete()
      .eq("id", image.id);
    if (dbError) {
      showNotification("Erro ao apagar do banco de dados.", "error");
    } else {
      showNotification("Imagem apagada com sucesso.", "success");
      fetchAllData();
    }
  };

  const handleViewCharacter = (characterData) =>
    setViewingCharacter(mapToCamelCase(characterData));
  const handleBackToList = () => {
    setViewingCharacter(null);
    fetchAllData();
  };
  const showNotification = (message, type = "success") =>
    setNotification({ message, type });

  if (viewingCharacter) {
    return (
      <>
        <CharacterSheet
          character={viewingCharacter}
          onBack={handleBackToList}
          showNotification={showNotification}
          onUpdateCharacter={() =>
            showNotification("Edição desabilitada no modo Mestre.")
          }
          onDelete={() =>
            showNotification("Exclusão desabilitada no modo Mestre.")
          }
          addRollToHistory={() => {}}
          onOpenImageTray={() => {}}
          onTrain={() => {}}
        />
        {notification && (
          <NotificationToast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </>
    );
  }

  const categories = ["todos", ...new Set(gmImages.map((img) => img.category))];
  const filteredImages =
    activeCategory === "todos"
      ? gmImages
      : gmImages.filter((img) => img.category === activeCategory);

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-5xl font-bold text-brand-primary">
            Painel do Mestre
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie todos os aspectos do seu jogo.
          </p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0"
        >
          Logout
        </button>
      </div>

      <div className="space-y-8">
        {combatData && combatData.is_active && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-500">
            <h2 className="text-3xl font-bold text-brand-text mb-4">
              Combate Ativo
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={onNextTurn}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Próximo Turno
              </button>
              <button
                onClick={onEndCombat}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Encerrar Combate
              </button>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-3xl font-bold text-brand-text">
              Fichas de Personagem ({characters.length})
            </h2>
            <button
              onClick={() => setIsStartCombatModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Iniciar Combate
            </button>
          </div>
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando fichas...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((char) => (
                <GmCharacterCard
                  key={char.id}
                  character={char}
                  onViewCharacter={handleViewCharacter}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <h2 className="text-3xl font-bold text-brand-text">
              Galeria de Imagens
            </h2>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Adicionar Imagem
            </button>
          </div>
          <div className="flex space-x-2 border-b mb-4 pb-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-t-lg capitalize ${
                  activeCategory === cat
                    ? "bg-purple-500 text-white"
                    : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando imagens...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={img.image_url}
                    alt={img.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setViewingImage(img.image_url)}
                      className="p-2 bg-gray-200/80 rounded-full text-black hover:bg-white"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(img)}
                      className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StartCombatModal
        isOpen={isStartCombatModalOpen}
        onClose={() => setIsStartCombatModalOpen(false)}
        characters={characters}
        onStartCombat={handleStartCombat}
      />
      <GmImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleImageUpload}
        existingCategories={[...new Set(gmImages.map((img) => img.category))]}
      />
      <ImageViewerModal
        isOpen={viewingImage !== null}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage}
      />
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default GameMasterPanel;
