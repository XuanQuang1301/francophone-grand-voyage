import React, { useState, useEffect } from "react";
import { speakFrench, stopAllSpeech } from "../utils/speech";
import { PlayerCharacter } from "../types";
import { ArrowLeft, Trash2, CheckCircle2, RotateCcw, Volume2, Sparkles } from "lucide-react";

interface RiverNettoyageGameProps {
  character: PlayerCharacter;
  onBack: () => void;
  onSuccess: (score: number, bonus: boolean) => void;
}

interface TrashItem {
  id: number;
  type: "bottle" | "can" | "paper" | "bag";
  left: number; // percentage
  top: number;  // percentage
  rotation: number;
  scale: number;
  collected: boolean;
  className: string;
}

const TRASH_TYPES = [
  {
    // Plastic water bottle – translucent blue with label stripe
    type: "bottle" as const,
    svg: (
      <svg viewBox="0 0 32 56" className="w-7 h-12 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        {/* cap */}
        <rect x="11" y="0" width="10" height="7" rx="2" fill="#1565c0" />
        {/* neck */}
        <rect x="12" y="7" width="8" height="6" rx="1" fill="#90caf9" />
        {/* body */}
        <rect x="6" y="13" width="20" height="36" rx="5" fill="#bbdefb" stroke="#64b5f6" strokeWidth="1.5" />
        {/* label */}
        <rect x="6" y="21" width="20" height="11" rx="1" fill="#1976d2" opacity="0.7" />
        <text x="16" y="29" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold" fontFamily="sans-serif">EAU</text>
        {/* water inside */}
        <rect x="7" y="32" width="18" height="16" rx="3" fill="#4fc3f7" opacity="0.45" />
        {/* highlight */}
        <rect x="9" y="15" width="3" height="30" rx="2" fill="white" opacity="0.35" />
      </svg>
    ),
    scoreValue: 10,
  },
  {
    // Aluminium soda can – red with tab on top
    type: "can" as const,
    svg: (
      <svg viewBox="0 0 28 44" className="w-6 h-10 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        {/* top ellipse */}
        <ellipse cx="14" cy="6" rx="10" ry="4" fill="#b0bec5" />
        {/* pull tab */}
        <rect x="12" y="3" width="4" height="6" rx="1" fill="#78909c" />
        {/* body */}
        <rect x="4" y="6" width="20" height="32" rx="2" fill="#e53935" />
        {/* label stripe */}
        <rect x="4" y="13" width="20" height="14" fill="#c62828" />
        <text x="14" y="22" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold" fontFamily="sans-serif">COLA</text>
        {/* highlight */}
        <rect x="6" y="8" width="3" height="28" rx="1.5" fill="white" opacity="0.25" />
        {/* bottom ellipse */}
        <ellipse cx="14" cy="38" rx="10" ry="4" fill="#9e9e9e" />
      </svg>
    ),
    scoreValue: 10,
  },
  {
    // Crumpled newspaper / paper wad
    type: "paper" as const,
    svg: (
      <svg viewBox="0 0 40 38" className="w-9 h-8 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        {/* crumpled wad shape */}
        <path d="M6 18 Q2 8 10 4 Q18 0 26 5 Q36 2 38 12 Q42 22 34 30 Q26 38 16 34 Q4 32 6 18Z"
          fill="#eceff1" stroke="#b0bec5" strokeWidth="1.2" />
        {/* crumple lines */}
        <path d="M10 10 Q16 14 14 22" stroke="#90a4ae" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M20 6 Q24 13 20 20" stroke="#90a4ae" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M28 10 Q26 18 30 24" stroke="#90a4ae" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M8 24 Q16 26 24 30" stroke="#90a4ae" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* faint text lines */}
        <line x1="13" y1="16" x2="26" y2="15" stroke="#cfd8dc" strokeWidth="1" />
        <line x1="12" y1="20" x2="25" y2="19" stroke="#cfd8dc" strokeWidth="1" />
      </svg>
    ),
    scoreValue: 10,
  },
  {
    // Plastic bag floating – translucent with knot
    type: "bag" as const,
    svg: (
      <svg viewBox="0 0 36 44" className="w-8 h-10 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        {/* handles */}
        <path d="M12 12 Q10 4 14 2 Q18 0 22 2 Q26 4 24 12" fill="none" stroke="#ef9a9a" strokeWidth="2.5" strokeLinecap="round" />
        {/* knot dot */}
        <circle cx="18" cy="13" r="2.5" fill="#e57373" />
        {/* bag body – puffy balloon shape */}
        <path d="M6 16 Q2 24 4 34 Q8 44 18 43 Q28 44 32 34 Q34 24 30 16 Q24 12 18 13 Q12 12 6 16Z"
          fill="#ffcdd2" stroke="#ef9a9a" strokeWidth="1.2" opacity="0.88" />
        {/* sheen */}
        <path d="M10 20 Q9 30 11 36" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        {/* air pocket bubbles */}
        <ellipse cx="22" cy="26" rx="5" ry="3" fill="white" opacity="0.2" />
      </svg>
    )
  },
];

const INTRO_DIALOGUES = [
  { speaker: "Capitaine Lumière", fr: "Bienvenue en France, Ambassadeur.\nAujourd'hui, une histoire t'attend.", vi: "Chào mừng Đại sứ đến với nước Pháp.\nHôm nay, một câu chuyện đang chờ bạn khám phá.", avatar: "/AI.png" },
  { speaker: "Madame Sophie", fr: "Il y a très longtemps, cette rivière était le trésor de notre village.\nSon eau était claire et les poissons étaient nombreux.", vi: "Từ rất lâu trước đây, dòng sông này là báu vật của ngôi làng.\nNước trong vắt và cá xuất hiện khắp nơi.", avatar: "/Madame_Sophie-removebg-preview.png" },
  { speaker: "Madame Sophie", fr: "Chaque matin, les enfants venaient jouer au bord de l'eau.\nLes oiseaux chantaient dans les arbres.", vi: "Mỗi buổi sáng, trẻ em đều ra bờ sông vui chơi.\nChim chóc hót vang trên những tán cây.", avatar: "/Madame_Sophie-removebg-preview.png" },
  { speaker: "Madame Sophie", fr: "Mais avec le temps, certaines personnes ont oublié de respecter la nature.", vi: "Nhưng theo thời gian, một số người đã quên mất cách tôn trọng thiên nhiên.", avatar: "/Madame_Sophie-removebg-preview.png" },
  { speaker: "Madame Sophie", fr: "Ils ont laissé des bouteilles, des sacs plastiques et des déchets près de la rivière.", vi: "Họ để lại chai nhựa, túi nylon và nhiều loại rác bên bờ sông.", avatar: "/Madame_Sophie-removebg-preview.png" },
  { speaker: "Madame Sophie", fr: "Peu à peu, l'eau est devenue plus sale.\nLes poissons ont disparu.\nLes oiseaux sont partis ailleurs.", vi: "Dần dần, nước trở nên ô nhiễm hơn.\nCá biến mất.\nChim cũng bay đi nơi khác.", avatar: "/Madame_Sophie-removebg-preview.png" },
  { speaker: "Madame Sophie", fr: "Aujourd'hui, nous avons besoin d'aide.\nNous voulons rendre à cette rivière sa beauté d'autrefois.", vi: "Hôm nay, chúng tôi cần được giúp đỡ.\nChúng tôi muốn trả lại vẻ đẹp vốn có cho dòng sông này.", avatar: "/Madame_Sophie-removebg-preview.png" },
  { speaker: "Madame Sophie", fr: "Un ambassadeur protège non seulement les habitants,\nmais aussi les animaux, les arbres et la nature.", vi: "Một Đại sứ không chỉ bảo vệ con người,\nmà còn bảo vệ động vật, cây cối và thiên nhiên.", avatar: "/Madame_Sophie-removebg-preview.png" },
];

const HELP_DIALOGUES = [
  { speaker: "Madame Sophie", fr: "Voilà… la rivière est dans cet état.\nNous n’arrivons plus à la nettoyer seuls.", vi: "Đây rồi… dòng sông đang trong tình trạng này.\nChúng tôi không thể tự dọn sạch nữa.", avatar: "/Madame_Sophie-removebg-preview.png" },
  { speaker: "Madame Sophie", fr: "Ambassadeur… nous comptons sur toi.\nAide-nous à nettoyer la rivière.", vi: "Đại sứ… chúng tôi trông cậy vào bạn.\nHãy giúp chúng tôi làm sạch dòng sông.", avatar: "/Madame_Sophie-removebg-preview.png" }
];

const LEAVE_DIALOGUES = [
  { speaker: "Madame Sophie", fr: "Je comprends…\nUn ambassadeur doit connaître le monde avant d’agir.", vi: "Ta hiểu…\nMột Đại sứ cần hiểu thế giới trước khi hành động.", avatar: "/Madame_Sophie-removebg-preview.png" },
  { speaker: "Capitaine Lumière", fr: "Même si tu pars maintenant…\nLa mission restera disponible plus tard.", vi: "Dù bạn rời đi bây giờ…\nnhiệm vụ này vẫn sẽ chờ bạn quay lại.", avatar: "/AI.png" }
];

type GamePhase = "intro" | "help_dialogue" | "leave_dialogue" | "playing" | "completed";

export default function RiverNettoyageGame({ character, onBack, onSuccess }: RiverNettoyageGameProps) {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [dialogueStep, setDialogueStep] = useState(0);

  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [moves, setMoves] = useState(0);

  // Generate 10 trash items on the lower river flowing region
  const initGame = () => {
    stopAllSpeech();
    setMoves(0);

    const riverCoordinates = [
      { left: 16, top: 57 },
      { left: 27, top: 65 },
      { left: 34, top: 59 },
      { left: 44, top: 67 },
      { left: 52, top: 61 },
      { left: 63, top: 66 },
      { left: 71, top: 58 },
      { left: 82, top: 64 },
      { left: 40, top: 72 },
      { left: 58, top: 71 },
    ];

    const items: TrashItem[] = riverCoordinates.map((coord, i) => {
      const randomType = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
      return {
        id: i,
        type: randomType.type,
        left: coord.left,
        top: coord.top,
        rotation: Math.floor(Math.random() * 360),
        scale: 0.9 + Math.random() * 0.3,
        collected: false,
        className: `trash-item float-item-${i % 3}`,
      };
    });

    setTrashItems(items);
    triggerVoiceExplanations();
  };

  const triggerVoiceExplanations = () => {
    setIsSpeaking(true);
    speakFrench(
      "S'il te plaît, Ambassadeur ! Clique sur les déchets pour les ramasser.",
      {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
  };

  // Auto-play dialogue voices
  useEffect(() => {
    let list: any[] = [];
    if (phase === "intro") list = INTRO_DIALOGUES;
    if (phase === "help_dialogue") list = HELP_DIALOGUES;
    if (phase === "leave_dialogue") list = LEAVE_DIALOGUES;

    if (list.length > 0 && dialogueStep < list.length) {
      const item = list[dialogueStep];
      stopAllSpeech();
      setIsSpeaking(true);
      speakFrench(item.fr, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [phase, dialogueStep]);

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  const collectTrash = (id: number) => {
    if (phase !== "playing") return;
    setMoves((m) => m + 1);

    setTrashItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, collected: true } : item))
    );

    // Check if everything is collected
    setTrashItems((current) => {
      const remaining = current.filter((item) => !item.collected && item.id !== id);
      if (remaining.length === 0) {
        setPhase("completed");
        triggerVictoryGreeting();
      }
      return current;
    });
  };

  const triggerVictoryGreeting = () => {
    setIsSpeaking(true);
    speakFrench("Merveilleux ! Vous avez sauvé le ruisseau et purifié l'eau. Merci, Ambassadeur !", {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const collectedCount = trashItems.filter((item) => item.collected).length;
  const progressPercent = (collectedCount / trashItems.length) * 100;

  const handleFinish = () => {
    // 100 max score. Perfect score if solved with minimal unnecessary clicks.
    const isPerfect = moves <= 12; // 10 items, allowing 2 miss-clicks
    onSuccess(100, isPerfect);
  };

  const renderDialogueOverlay = () => {
    let list: any[] = [];
    if (phase === "intro") list = INTRO_DIALOGUES;
    if (phase === "help_dialogue") list = HELP_DIALOGUES;
    if (phase === "leave_dialogue") list = LEAVE_DIALOGUES;

    if (list.length === 0) return null;

    if (dialogueStep >= list.length) {
      if (phase === "intro") {
        return (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-lg w-full text-center">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-4 border-slate-100 shadow-md">
                <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover object-top" />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-6">{character.name}</h3>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setPhase("help_dialogue"); setDialogueStep(0); }}
                  className="w-full py-4 px-4 bg-[#0a418e] hover:bg-blue-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                >
                  Tôi đồng ý giúp đỡ, tôi có thể làm thế nào?
                </button>
                <button 
                  onClick={() => { setPhase("leave_dialogue"); setDialogueStep(0); }}
                  className="w-full py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Tôi muốn tìm hiểu thông tin ở chặng khác
                </button>
              </div>
            </div>
          </div>
        );
      } else if (phase === "help_dialogue") {
        return (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center border-4 border-emerald-500">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-emerald-700 mb-2">MINI GAME START</h2>
              <p className="text-sm font-bold text-gray-600 mb-6 uppercase tracking-widest">Clean The River</p>
              <button 
                onClick={() => { setPhase("playing"); initGame(); triggerVoiceExplanations(); }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <span className="text-lg">▶</span> Commencer la mission
                <span className="absolute bottom-1 w-full text-[9px] text-emerald-100 uppercase tracking-widest font-black">Bắt đầu nhiệm vụ</span>
              </button>
            </div>
          </div>
        );
      }
      return null;
    }

    const item = list[dialogueStep];
    const isLocalSpeaking = item.speaker === "Madame Sophie";
    const isAISpeaking = item.speaker === "Capitaine Lumière";

    return (
      <div className="absolute inset-0 z-50 overflow-hidden animate-fade-in">
        {/* Dark overlay backdrop */}
        <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm pointer-events-none"></div>

        {/* Characters Layer */}
        <div className="absolute inset-0 flex justify-between items-end px-12 pb-[130px] pointer-events-none">
          {/* Player Left */}
          <div className="w-[350px] h-[500px] flex items-end justify-start drop-shadow-2xl">
            <img 
               src={character.avatarUrl} 
               alt={character.name} 
               className="max-w-full max-h-full object-contain brightness-75 transition-all duration-500" 
            />
          </div>

          {/* Local Right */}
          <div className="w-[350px] h-[550px] flex items-end justify-end drop-shadow-2xl relative">
            {/* AI companion floating next to local */}
            <img 
               src="/AI.png" 
               alt="Capitaine Lumière" 
               className={`absolute top-20 right-48 w-32 object-contain animate-float drop-shadow-xl ${isAISpeaking ? 'brightness-110 scale-110' : 'brightness-75 scale-100'} transition-all duration-500 z-10`} 
            />
            {/* Madame Sophie */}
            <img 
               src="/Madame_Sophie-removebg-preview.png" 
               alt="Madame Sophie" 
               className={`max-w-full max-h-full object-contain relative z-20 ${isLocalSpeaking ? 'brightness-110 scale-105' : 'brightness-75 scale-100'} transition-all duration-500`} 
            />
          </div>
        </div>

        {/* Dialogue Box */}
        <div className="absolute bottom-10 left-0 right-0 w-full max-w-4xl mx-auto px-4 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 pt-8 shadow-2xl border-4 border-[#0a418e]/30 relative">
            
            {/* Speaker Name Tag */}
            <div className={`absolute -top-5 ${isLocalSpeaking || isAISpeaking ? 'right-10 bg-amber-500 text-white' : 'left-10 bg-[#0a418e] text-white'} px-8 py-2 rounded-xl font-black text-lg shadow-lg border-2 border-white transition-all`}>
              {item.speaker}
            </div>

            {/* Play voice button */}
            <button onClick={() => speakFrench(item.fr)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-blue-50 text-blue-600 rounded-full transition-colors cursor-pointer shadow-sm">
              <Volume2 className="w-5 h-5" />
            </button>

            <div className="pr-16 pl-4">
              <p className="text-xl font-semibold text-gray-800 italic mb-4 whitespace-pre-line leading-relaxed">
                "{item.fr}"
              </p>
              <p className="text-[16px] text-gray-600 font-medium whitespace-pre-line leading-relaxed border-t border-gray-200 pt-3">
                {item.vi}
              </p>
            </div>

            <button 
               onClick={() => {
                  stopAllSpeech();
                  setIsSpeaking(false);
                  if (phase === "leave_dialogue" && dialogueStep === list.length - 1) {
                    onBack();
                  } else {
                    setDialogueStep(s => s + 1);
                  }
               }}
               className="absolute bottom-6 right-6 bg-[#0a418e] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
            >
              Tiếp tục <span className="text-xl leading-none">›</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex-1 w-full h-screen bg-[#e5e2da] overflow-hidden font-body-md select-none">
      {/* Background Stream Image from public assets schema */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          alt="Seine River Paris Illustration"
          src="/river-seine.jpg"
          className="w-full h-full object-cover object-center pointer-events-none"
        />
        {/* Cinematic gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none"></div>
      </div>

      {/* Styled Float keyframes injected inline */}
      <style>{`
        @keyframes float0 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-4deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(3deg); }
        }
        .float-item-0 { animation: float0 4s ease-in-out infinite; }
        .float-item-1 { animation: float1 3.5s ease-in-out infinite; }
        .float-item-2 { animation: float2 4.2s ease-in-out infinite; }
      `}</style>

      {/* Navigation Top HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20 pointer-events-none">
        {/* Back Button Escape Hatch */}
        <button
          onClick={onBack}
          className="pointer-events-auto bg-white/95 backdrop-blur-sm hover:bg-white text-[#1c1c17] p-3 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
          title="Trở về bản đồ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* River Progress Hud */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-md min-w-[280px] border border-[#c3c6d3]">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1">
              <Trash2 className="w-4 h-4 text-secondary" /> Rivière Propre (Pháp)
            </span>
            <span className="text-sm font-black text-secondary">
              {collectedCount} / {trashItems.length}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold mt-2">
            <span>Số lượt nhấp: {moves}</span>
            <span>Mục tiêu: Dọn sạch lòng suối</span>
          </div>
        </div>
      </div>

      {/* Left Bottom corner: Mascot Guide speech speaker */}
      {phase === "playing" && (
      <div className="absolute bottom-6 left-6 z-20 max-w-[340px] pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-l-4 border-primary border border-gray-200">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white bg-slate-50 shrink-0 shadow-sm relative">
              <img
                src="/Madame_Sophie-removebg-preview.png"
                alt="Madame Sophie"
                className="w-full h-full object-cover object-top"
              />
              {/* Speaker beacon icon if speaking */}
              {isSpeaking && (
                <span className="absolute bottom-0 right-0 bg-secondary text-white rounded-full p-0.5 animate-bounce">
                  <Volume2 className="w-3 h-3" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md text-xs font-black text-primary">Madame Sophie</span>
                <button
                  onClick={triggerVoiceExplanations}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Nghe phát âm tiếng Pháp"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "text-secondary animate-pulse" : "text-gray-400"}`} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Người dân bản địa</p>
            </div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-700 italic leading-relaxed">
            "S'il te plaît, Ambassadeur ! Clique sur les déchets pour les ramasser."
          </div>
          <div className="text-[10px] text-gray-400 font-semibold mt-1 px-1">
            * Nhấn biểu tượng loa để nghe bà lão phát âm tiếng Pháp.
          </div>
        </div>
      </div>
      )}

      {/* Floating Interactive Trash items layer */}
      {phase === "playing" && (
      <div className="absolute inset-0 z-10 pointer-events-none">
        {trashItems.map((item) => {
          const matchedType = TRASH_TYPES.find((t) => t.type === item.type);
          if (item.collected) return null;

          return (
            <button
              key={item.id}
              onClick={() => collectTrash(item.id)}
              className={`absolute pointer-events-auto transform transition-all duration-300 hover:scale-125 focus:outline-none cursor-pointer p-2 ${item.className}`}
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
              }}
              title="Click để nhặt mảnh rác này"
            >
              {matchedType?.svg}
            </button>
          );
        })}
      </div>
      )}

      {/* Floating Interactive Trash items layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {trashItems.map((item) => {
          const matchedType = TRASH_TYPES.find((t) => t.type === item.type);
          if (item.collected) return null;

          return (
            <button
              key={item.id}
              onClick={() => collectTrash(item.id)}
              className={`absolute pointer-events-auto transform transition-all duration-300 hover:scale-125 focus:outline-none cursor-pointer p-2 ${item.className}`}
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
              }}
              title="Click để nhặt mảnh rác này"
            >
              {matchedType?.svg}
            </button>
          );
        })}
      </div>

      {/* Victory Overlay Screen Card modal */}
      {phase === "completed" && (
        <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#b7102a] rounded-2xl p-6 max-w-lg w-full shadow-2xl text-center transform scale-95 animate-stamp">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-50 border-4 border-green-500 flex items-center justify-center text-green-500 mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="font-display-lg text-2xl font-bold text-primary mb-2">Sauvegarde Réussie !</h2>
            <p className="text-xs text-[#b7102a] uppercase tracking-widest font-extrabold mb-6">
              Làng Paris - OIF Pháp quốc
            </p>

            <div className="flex gap-4 mb-6">
               <div className="flex-1 bg-blue-50/50 p-3 pt-4 rounded-xl border border-blue-100 relative shadow-sm">
                  <img src="/Madame_Sophie-removebg-preview.png" className="w-12 h-12 object-cover object-top rounded-full border-2 border-blue-200 bg-white absolute -top-5 left-1/2 -translate-x-1/2 shadow-sm" />
                  <p className="text-[11px] font-semibold italic text-blue-900 mt-2 leading-tight">"Incroyable… La rivière respire à nouveau."</p>
                  <p className="text-[10px] text-blue-700/80 mt-1.5 font-medium leading-tight">Thật không thể tin được… Dòng sông đã có thể “thở” trở lại.</p>
               </div>
               <div className="flex-1 bg-amber-50/50 p-3 pt-4 rounded-xl border border-amber-100 relative shadow-sm">
                  <img src="/AI.png" className="w-12 h-12 object-cover object-top rounded-full border-2 border-amber-200 bg-white absolute -top-5 left-1/2 -translate-x-1/2 shadow-sm" />
                  <p className="text-[11px] font-semibold italic text-amber-900 mt-2 leading-tight">"Tu viens de protéger un écosystème entier."</p>
                  <p className="text-[10px] text-amber-700/80 mt-1.5 font-medium leading-tight">Bạn vừa bảo vệ một hệ sinh thái.</p>
               </div>
            </div>

            {/* Immersive passport stamping seals view */}
            <div className="mb-6 relative flex flex-col items-center justify-center p-3 border border-dashed border-gray-300 rounded-xl bg-slate-50 overflow-hidden">
              <div className="relative w-24 h-24 rounded-full border-4 border-secondary flex flex-col items-center justify-center bg-white shadow-inner animate-stamp">
                <span className="text-2xl">🇫🇷</span>
                <span className="font-display-lg text-[10px] font-black text-secondary uppercase tracking-widest mt-1">
                  FRANCE
                </span>
                <span className="text-[8px] text-[#0a418e] font-extrabold tracking-widest mt-0.5">VISA OK</span>
              </div>
              <span className="text-xs text-yellow-600 font-bold mt-3 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" /> +100 Điểm & Ghi nhận mộc đỏ!
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={initGame}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Chơi Lại
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-secondary hover:bg-[#db313f] text-white rounded-full font-bold text-xs transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              >
                Nhận Mộc & Đi Tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      {renderDialogueOverlay()}
    </div>
  );
}
