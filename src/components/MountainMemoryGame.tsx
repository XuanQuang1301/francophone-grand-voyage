import React, { useState, useEffect } from "react";
import { speakFrench, stopAllSpeech } from "../utils/speech";
import { ArrowLeft, CheckCircle2, RotateCcw, Volume2, Sparkles, BookOpen, Clock, Fingerprint } from "lucide-react";

interface MountainMemoryGameProps {
  onBack: () => void;
  onSuccess: (score: number, bonus: boolean) => void;
}

interface CardType {
  id: number;
  labelFr: string;
  labelVi: string;
  symbol: string;
  image: string;
  matched: boolean;
  uniqueId: string;
}

const MEMORY_PAIRS = [
  {
    symbol: "📚",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=250&auto=format&fit=crop&q=80",
    labelFr: "Livre scolaire",
    labelVi: "Sách giáo khoa"
  },
  {
    symbol: "✏️",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=250&auto=format&fit=crop&q=80",
    labelFr: "Crayon",
    labelVi: "Bút chì"
  },
  {
    symbol: "🎒",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=250&auto=format&fit=crop&q=80",
    labelFr: "Sac à dos",
    labelVi: "Cặp sách học đường"
  },
  {
    symbol: "🌍",
    image: "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=250&auto=format&fit=crop&q=80",
    labelFr: "Globe terrestre",
    labelVi: "Quả địa cầu"
  },
  {
    symbol: "🥐",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=250&auto=format&fit=crop&q=80",
    labelFr: "Croissant",
    labelVi: "Bánh sừng bò"
  },
  {
    symbol: "🌸",
    image: "https://khoinguonsangtao.vn/wp-content/uploads/2022/09/hinh-nen-hoa-sen.jpg",
    labelFr: "Fleur de lotus",
    labelVi: "Đóa hoa sen"
  },
  {
    symbol: "👒",
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=250&auto=format&fit=crop&q=80",
    labelFr: "Chapeau conique",
    labelVi: "Nón lá Việt Nam"
  },
  {
    symbol: "🗼",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=250&auto=format&fit=crop&q=80",
    labelFr: "La Tour Eiffel",
    labelVi: "Tháp Eiffel"
  },
];

export default function MountainMemoryGame({ onBack, onSuccess }: MountainMemoryGameProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showStampingModal, setShowStampingModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [time, setTime] = useState(0);

  // Set up timer
  useEffect(() => {
    if (completed) return;
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [completed]);

  const initGame = () => {
    stopAllSpeech();
    setTime(0);
    setMoves(0);
    setMatchedCount(0);
    setCompleted(false);
    setShowStampingModal(false);
    setSelectedCards([]);

    // Duplicate pairs
    const originalDeck = [...MEMORY_PAIRS, ...MEMORY_PAIRS];
    // Shuffle
    const shuffled = originalDeck
      .map((item, i) => ({
        id: i,
        ...item,
        matched: false,
        uniqueId: `${item.labelFr}-${i}`,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    triggerVoiceInstructions();
  };

  const triggerVoiceInstructions = () => {
    setIsSpeaking(true);
    speakFrench(
      "Associez les paires de cartes rattachées aux cultures francophones pour offrir des livres aux écoliers !",
      {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
  };

  useEffect(() => {
    initGame();
    return () => {
      stopAllSpeech();
    };
  }, []);

  const handleCardClick = (index: number) => {
    if (completed || selectedCards.length >= 2 || cards[index].matched || selectedCards.includes(index)) {
      return;
    }

    const newSelections = [...selectedCards, index];
    setSelectedCards(newSelections);

    if (newSelections.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newSelections;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      if (card1.labelFr === card2.labelFr) {
        // Matched!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, matched: true } : c))
          );
          setSelectedCards([]);
          setMatchedCount((c) => {
            const up = c + 1;
            // Speak the French vocabulary word for auditory learning reinforcement
            speakFrench(card1.labelFr);
            if (up === MEMORY_PAIRS.length) {
              setCompleted(true);
              triggerVictoryGreeting();
            }
            return up;
          });
        }, 500);
      } else {
        // Discrepancy, flip back down after short visual pause
        setTimeout(() => {
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  const triggerVictoryGreeting = () => {
    setIsSpeaking(true);
    speakFrench("Félicitations ! Vous avez collecté tous les livres. Quel esprit brillant, bon voyage !", {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, "0");
    const secs = (sec % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleFinish = () => {
    // 100 points, gold bonus star if completed in under 18 moves
    const bonusEarned = moves <= 18;
    onSuccess(100, bonusEarned);
  };

  return (
    <div className="relative flex-1 w-full h-screen overflow-hidden font-body-md select-none flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0a2342 0%, #1a4a7a 20%, #0d5c3a 40%, #1a7a4a 55%, #8b6914 70%, #c8a84b 82%, #e8d5a0 92%, #f4ead0 100%)"
      }}
    >
      {/* Vietnamese landscape atmosphere layers */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Deep sky gradient */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #0a1628 0%, #0d2b5c 18%, #1a4a8a 35%, #2a7a5a 52%, #3d8a40 65%, #c8a040 80%, #e8c870 90%, #f0dfa0 100%)"
        }} />
        {/* Rice field / emerald water shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%]" style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(30,120,80,0.5) 30%, rgba(20,90,60,0.7) 70%, rgba(10,60,40,0.85) 100%)"
        }} />
        {/* Golden sunset / lantern glow top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[50%]" style={{
          background: "radial-gradient(ellipse at center top, rgba(255,200,60,0.25) 0%, rgba(255,140,30,0.1) 40%, transparent 70%)"
        }} />
        {/* Floating lantern lights */}
        <div className="absolute top-[15%] left-[20%] w-3 h-3 rounded-full bg-amber-400/50 blur-sm animate-pulse" style={{animationDelay:"0s"}} />
        <div className="absolute top-[25%] left-[35%] w-2 h-2 rounded-full bg-orange-300/60 blur-sm animate-pulse" style={{animationDelay:"0.7s"}} />
        <div className="absolute top-[20%] right-[25%] w-3 h-3 rounded-full bg-yellow-300/50 blur-sm animate-pulse" style={{animationDelay:"1.4s"}} />
        <div className="absolute top-[30%] right-[40%] w-2 h-2 rounded-full bg-amber-300/40 blur-sm animate-pulse" style={{animationDelay:"2.1s"}} />
        <div className="absolute top-[12%] left-[55%] w-2 h-2 rounded-full bg-red-400/50 blur-sm animate-pulse" style={{animationDelay:"0.4s"}} />
        {/* Subtle lotus / water reflection shimmer at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-[30%]" style={{
          background: "linear-gradient(0deg, rgba(0,40,80,0.6) 0%, rgba(10,80,50,0.3) 60%, transparent 100%)"
        }} />
        {/* Dark vignette for depth & card readability */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      {/* Styled Card CSS flip physics */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* Navigation Top HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20 pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto bg-white/95 backdrop-blur-sm hover:bg-white text-[#1c1c17] p-3 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
          title="Trở về bản đồ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* HUD Game Stats */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-md min-w-[280px] border border-[#c3c6d3] flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Thời gian</span>
            <span className="text-sm font-black text-primary flex items-center gap-1">
              <Clock className="w-4 h-4" /> {formatTimer(time)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lượt lật</span>
            <span className="text-sm font-black text-secondary">{moves}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Thu gom quà</span>
            <span className="text-sm font-black text-green-700">
              {matchedCount} / {MEMORY_PAIRS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Card Grid Board */}
      <div className="relative z-10 w-full max-w-[840px] bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/60 p-6 flex flex-col mt-14 max-h-[85vh] overflow-y-auto">
        
        {completed && !showStampingModal && (
          <div className="w-full bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 border-2 border-amber-300 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce duration-1000 mb-5 shadow-sm shrink-0">
            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-950 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" /> HOÀN THÀNH XUẤT SẮC !
              </span>
              <p className="text-[11.5px] text-stone-700 font-bold leading-normal mt-1">
                Các cặp thẻ đã được lật mở thành công. Bạn có thể tự do nhấn từng hình ảnh để nghe lại phát âm rèn luyện tiếng Pháp. Khi đã sẵn sàng, hãy nhấn nút bên để nhận mộc thông hành!
              </p>
            </div>
            <button
              onClick={() => {
                stopAllSpeech();
                setShowStampingModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:scale-103 active:scale-97 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-amber-400 shrink-0 select-none animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4 text-white" /> Xác nhận nhận mộc 🇻🇳
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* Left Side: Mascot narrative details */}
          <div className="md:w-1/3 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-[#c3c6d3] pb-4 md:pb-0 md:pr-6 shrink-0">
          <div className="text-center w-full">
            <h1 className="font-headline-lg text-lg sm:text-xl font-bold text-primary mb-1">
              {MEMORY_PAIRS.length} Cặp Thẻ Di Sản
            </h1>
            <p className="text-xs text-gray-500 font-semibold italic mb-3">
              Khám phá tinh hoa văn hóa Chùa Một Cột cổ kính
            </p>
          </div>

          <div className="relative w-36 h-36 my-2 shrink-0">
            <img
              src="/daisu_dulich.png"
              alt="Mascot Guide Birdy"
              className="w-full h-full object-contain"
            />
            {isSpeaking && (
              <span className="absolute bottom-2 right-2 bg-[#b7102a] text-white rounded-full p-1 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="w-full mt-2">
            <div className="bg-[#fcf9f0] p-3 rounded-lg border border-[#c3c6d3] text-xs text-gray-600 italic leading-relaxed text-center">
              <div className="flex justify-center mb-1">
                <button
                  type="button"
                  onClick={triggerVoiceInstructions}
                  className="bg-white hover:bg-gray-100 p-1.5 rounded-full border shadow-sm transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-primary" />
                </button>
              </div>
              "Associez les paires de cartes rattachées aux cultures francophones để phục dựng báu vật Chùa Một Cột ngàn năm tuổi nhe!"
            </div>
            <p className="text-[10px] text-gray-400 italic text-center mt-1.5 leading-tight">
              * Ghép cặp đúng để nghe chú chim đọc to từ vựng tiếng Pháp học bồi dưỡng vốn từ !
            </p>
          </div>
        </div>

        {/* Right Side: Grid of 16 Cards */}
        <div className="md:w-2/3 flex items-center justify-center">
          <div className="grid grid-cols-4 gap-3 w-full aspect-square max-w-[420px]">
            {cards.map((card, index) => {
              const isSelected = selectedCards.includes(index);
              const isFlipped = card.matched || isSelected;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className={`perspective-1000 aspect-square w-full cursor-pointer touch-none card-container`}
                >
                  <div
                    className={`relative w-full h-full transform-style-3d transition-transform duration-500 rounded-xl shadow-md border border-[#c3c6d3] bg-white ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front view (Hidden state of cards) */}
                    <div className="backface-hidden absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-[#2e59a7] text-white flex flex-col items-center justify-center border-2 border-white hover:border-amber-300 transition-all">
                      <Fingerprint className="w-8 h-8 text-amber-200/60 animate-pulse" />
                    </div>

                    {/* Back view (Revealed state of card) */}
                    <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-xl bg-white text-gray-800 flex flex-col items-stretch overflow-hidden border-2 border-[#b7102a] shadow-md">
                      <div className="flex-1 min-h-0 w-full relative bg-gray-100">
                        <img
                          src={card.image}
                          alt={card.labelFr}
                          className="w-full h-full object-cover pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="bg-[#fcf9f0] py-1 px-1 flex flex-col items-center justify-center shrink-0 border-t border-gray-100">
                        <span className="text-[8px] sm:text-[9.5px] font-black text-gray-950 text-center truncate w-full leading-tight">
                          {card.labelFr}
                        </span>
                        <span className="text-[7px] sm:text-[8px] text-gray-500 font-bold text-center truncate w-full leading-none mt-0.5">
                          {card.labelVi}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>

      {/* Victory modal card panel popup */}
      {showStampingModal && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#b7102a] rounded-2xl p-8 max-w-md w-full shadow-2xl text-center transform scale-95 animate-stamp">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-50 border-4 border-green-500 flex items-center justify-center text-green-500 mb-4 animate-bounce">
              <BookOpen className="w-10 h-10" />
            </div>

            <h2 className="font-display-lg text-2xl font-bold text-primary mb-2">Thách Thức Hoàn Tất!</h2>
            <p className="text-xs text-[#b7102a] uppercase tracking-widest font-extrabold mb-4">
              Hà Nội - OIF Việt Nam thành viên
            </p>

            {/* Immersive Stamping Passport Visa */}
            <div className="my-6 relative flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-xl bg-slate-50 overflow-hidden">
              <div className="relative w-32 h-32 rounded-full border-4 border-secondary flex flex-col items-center justify-center bg-white shadow-inner animate-stamp">
                <span className="text-3xl">🇻🇳</span>
                <span className="font-display-lg text-xs font-black text-secondary uppercase tracking-widest mt-1">
                  VIETNAM
                </span>
                <span className="text-[9px] text-[#0a418e] font-extrabold tracking-widest mt-0.5">VISA OK</span>
                <span className="text-[7px] text-gray-400 mt-1">OIF Certifié</span>
              </div>
              <span className="text-xs text-yellow-600 font-bold mt-4 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" /> +100 Điểm & Nhận mộc Việt Nam đỏ rực!
              </span>
              {moves <= 18 && (
                <span className="text-[10px] text-green-600 font-black tracking-wide uppercase mt-1">
                  🌟 Thưởng thêm sao trí tuệ (Perfect Bonus)!
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 mb-6">
              Bạn lật mở siêu phàm chỉ trong <strong>{moves} lượt</strong>! Báu vật tranh sơn mài di sản phục dựng đã thắp sáng rực rỡ mái ngói cổ Chùa Một Cột nghìn năm tuổi.
            </p>

            <div className="flex gap-3">
              <button
                onClick={initGame}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Thách lại
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-secondary hover:bg-[#db313f] text-white rounded-full font-bold text-xs transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              >
                Ghi Mộc & Về Bản Đồ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
