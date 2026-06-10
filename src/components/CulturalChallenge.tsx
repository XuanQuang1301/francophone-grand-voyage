import React, { useState } from "react";
import { OifCountryId, CountryMetadata, PlayerCharacter, ChatMessage } from "../types";
import { speakFrench, stopAllSpeech } from "../utils/speech";
import { ArrowLeft, BookOpen, Volume2, Globe, MessageSquare, Send, Sparkles, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface CulturalChallengeProps {
  country: CountryMetadata;
  character: PlayerCharacter;
  onBack: () => void;
  onSuccess: (score: number, bonus: boolean) => void;
}

// Handcrafted quiz presets for countries other than France & Vietnam
const QUIZ_PRESETS: Record<string, {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}> = {
  roumanie: {
    question: "Quelle phrase reconstructrice ouvre le coffre de Bran en français grammatical correct ?",
    options: [
      "Le voyage de l'ambassadeur apporte l'harmonie et la paix.",
      "Le voyage de l'ambassadeur apportent l'harmonie et le paix.",
      "L'ambassadeur de le voyage apporte les harmonie et la paix.",
      "Le voyage d'ambassadeur apporter la harmonie et paix.",
    ],
    correctIndex: 0,
    explanation: "Chính xác! 'Le voyage de l'ambassadeur apporte l'harmonie et la paix' hợp ngữ pháp hoàn toàn (voyage số ít đi với động từ apporte, harmonie đi với mạo từ l' tinh tế). Bạn đã giải cứu thành công hòm sách Pháp ngữ cổ!",
  },
  canada: {
    question: "Pour sauver les érables du gel précoce, quel mot désigne l'équilibre écologique forestier ?",
    options: [
      "La biodiversité (Đa dạng sinh học)",
      "La déforestation (Phá rừng)",
      "La pollution (Ô nhiễm)",
      "Le gaspillage (Sự lãng phí)",
    ],
    correctIndex: 0,
    explanation: "Bonne réponse ! 'La biodiversité' (Sự đa dạng sinh học) chính là chìa khóa duy trì sức sống dẻo dai của khu rừng phong sương muối. Ánh mặt trời đã hâm nóng chồi non!",
  },
  senegal: {
    question: "Quel adjectif s'accorde correctement pour qualifier le 'Chant de la poésie' de Senghor ?",
    options: [
      "Le chant de la poésie inspirant (Bài ca truyền cảm hứng)",
      "Le chant de la poésie inspirante",
      "Le chant de la poésie inspirantes",
      "Le chant de la poésie inspirants",
    ],
    correctIndex: 1,
    explanation: "Formidable ! 'Inspirante' bổ nghĩa tương thích giống cái số ít cho danh từ 'La poésie' (Nền thơ ca truyền cảm hứng sâu sắc). Lớp cát Sahara đã được gạt sạch!",
  },
  belgique: {
    question: "À Bruxelles, comment dit-on 'coopérer ensemble pour un monde meilleur' en français correct ?",
    options: [
      "Coopérer ensemble pour construire un avenir meilleur.",
      "Cooperer ensemble pour construire un avenir meilleure.",
      "Coopérons ensemble pour construire un avenir meilleur.",
      "Coopérant ensemble pour construit un avenir meilleur.",
    ],
    correctIndex: 2,
    explanation: "Bravo ! 'Coopérons ensemble' est la forme impérative correcte de 'coopérer' à la 1ère personne du pluriel — parfaite pour un appel à l'action diplomatique européen ! Bức tranh khảm Grand-Place đã hoàn nguyên!",
  },
  suisse: {
    question: "À Genève, quel terme diplomatique français signifie 'accord entre nations' ?",
    options: [
      "Un traité (Hiệp ước)",
      "Un conflit (Xung đột)",
      "Une rupture (Sự đổ vỡ)",
      "Un ultimatum (Tối hậu thư)",
    ],
    correctIndex: 0,
    explanation: "Excellent ! 'Un traité' (Hiệp ước) est le terme diplomatique exact pour désigner un accord formel entre nations. Le Palais de la Paix de Genève a résonné d'applaudissements ! Hiệp ước hòa bình đã được ký kết!",
  },
  maroc: {
    question: "Pour préserver l'eau précieuse au Maroc, quelle phrase décrit le mieux l'action à entreprendre ?",
    options: [
      "Il faut économiser l'eau et protéger les sources. (Phải tiết kiệm nước và bảo vệ nguồn nước)",
      "Il faut gaspiller l'eau dans le désert.",
      "Il faut polluer les rivières marocaines.",
      "L'eau est sans importance au Sahara.",
    ],
    correctIndex: 0,
    explanation: "Parfait ! 'Il faut économiser l'eau et protéger les sources' — verbe 'falloir' + infinitif pour exprimer la nécessité. Bình nước cổ truyền Maroc đã được mở ra, tiết lộ bí quyết bảo tồn nguồn nước quý giá!",
  },
  madagascar: {
    question: "Quel verbe complète l'ordre écologique: 'Nous devons ___ la forêt de Baobab' ?",
    options: [
      "Protéger (Bảo vệ)",
      "Détruire (Phá hủy)",
      "Négliger (Bỏ mặc)",
      "Brûler (Đốt cháy)",
    ],
    correctIndex: 0,
    explanation: "Bravo ! 'Protéger la forêt' (Bảo vệ rừng baobab quý hiếm) là động từ hành động đúng đắn cứu khu rừng khỏi ngọn lửa. Khỉ Lemur reo hò cảm tạ!",
  },
  tunisie: {
    question: "À Carthage, quel concept français représente le mieux 'justice équitable pour tous' ?",
    options: [
      "L'égalité devant la loi (Bình đẳng trước pháp luật)",
      "La discrimination (Sự phân biệt đối xử)",
      "L'impunité (Sự miễn trừ trách nhiệm)",
      "L'arbitraire (Sự tùy tiện)",
    ],
    correctIndex: 0,
    explanation: "Remarquable ! 'L'égalité devant la loi' est le pilier fondamental de la démocratie et de la justice universelle. Les colonnes de Carthage s'illuminent ! Kho lưu trữ lịch sử Carthage đã mở ra rạng rỡ!",
  },
};

export default function CulturalChallenge({ country, character, onBack, onSuccess }: CulturalChallengeProps) {
  // Local states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [activeTab, setActiveTab] = useState<"scenario" | "aiOracle">("scenario");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Chat/Oracle state for Birdy AI
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: `Bonjour ${character.name} ! Je suis l'AI. Hỏi tôi bất kỳ điều gì bằng tiếng Pháp về văn hóa, từ vựng hay funfact của đất nước ${country.nameVi} này nhe!`,
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // AI-generated Dynamic QCM state
  const [aiQcmLoading, setAiQcmLoading] = useState(false);
  const [aiQcm, setAiQcm] = useState<{
    context: string;
    situation: string;
    narratorIntro: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  } | null>(null);

  const activeQuiz = aiQcm || QUIZ_PRESETS[country.id] || {
    question: "Drapeau de la francophonie OIF comporte combien de couleurs ?",
    options: ["5 couleurs (5 châu lục)", "2 couleurs", "3 couleurs", "7 couleurs"],
    correctIndex: 0,
    explanation: "Dấu ấn 5 dải màu rực rỡ lồng vào nhau biểu thị cho sự hòa thanh 5 đại lục Pháp ngữ đoàn kết."
  };

  const speakScenario = () => {
    setIsSpeaking(true);
    const textToSpeak = aiQcm
      ? aiQcm.narratorIntro
      : country.challengeScenarioFr + " " + (QUIZ_PRESETS[country.id]?.question || "");

    speakFrench(textToSpeak, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleAnswerSubmit = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === activeQuiz.correctIndex) {
      speakFrench("Fantastique ! C'est la bonne réponse !");
    } else {
      speakFrench("Oh ! Essayez encore !");
    }
  };

  // Chat query to server side Gemini proxy
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryName: country.nameFr,
          userMessage: userMsg,
          history: chatMessages.map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Gemini server error");
      }

      const data = await response.json();
      if (data.text) {
        setChatMessages((prev) => [...prev, { role: "model", text: data.text }]);
        // Automatically read out-loud French replies from Birdy
        speakFrench(data.text);
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Désolé ! Bộ thu phát sóng ngoại giao OIF bị gián đoạn truyền tải. Bạn kiểm tra lại GEMINI_API_KEY ở Secrets nhe! (Je t'aime!)",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Generate dynamic scenario from Gemini server API
  const generateAICultureQuiz = async () => {
    if (aiQcmLoading) return;
    setAiQcmLoading(true);
    stopAllSpeech();

    try {
      const response = await fetch("/api/gemini/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName: country.nameFr }),
      });

      if (!response.ok) {
        throw new Error("Server refused dynamic template");
      }

      const data = await response.json();
      if (data && data.question) {
        setAiQcm(data);
        setIsAnswered(false);
        setSelectedOption(null);
        // Automatically speak the new dynamic story introduction in French
        setIsSpeaking(true);
        speakFrench(data.narratorIntro + " " + data.question, {
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    } catch (err) {
      console.error(err);
      alert("Không thể khởi tạo Thử Thách AI. Hệ thống chuyển đổi về câu hỏi truyền thống. Hãy xác thực thiết lập Secrets!");
    } finally {
      setAiQcmLoading(false);
    }
  };

  const handleCollectStamp = () => {
    // 100 points. Perfect score if answered correctly on the first attempt
    const wasCorrectOnFirstGo = selectedOption === activeQuiz.correctIndex;
    onSuccess(100, wasCorrectOnFirstGo);
  };

  return (
    <div className="relative flex-1 w-full h-screen bg-[#F4F1E8] overflow-hidden font-body-md flex flex-col">
      {/* Background with desaturation blur overlay */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          alt={country.nameFr}
          src={country.imageBackground}
          className="w-full h-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm pointer-events-none"></div>
      </div>

      {/* Main Grid Card Container */}
      <div className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-14 flex flex-col justify-between overflow-hidden">
        {/* Top Header: Back Button & Title */}
        <div className="flex justify-between items-center shrink-0 mb-4 text-white">
          <button
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <h1 className="font-headline-lg text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                Chặng {country.nameVi} ({country.nameFr})
              </h1>
              <p className="text-[10px] text-amber-300 font-bold tracking-widest uppercase mt-1">
                Lãnh thổ liên kết OIF
              </p>
            </div>
          </div>
          <div className="w-10"></div> {/* Spacing spacer */}
        </div>

        {/* Content Box with Tab switching */}
        <div className="flex-1 bg-white/95 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden max-h-[72vh]">
          {/* Custom Tabs */}
          <div className="flex border-b border-gray-100 bg-[#f1eee5] shrink-0 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab("scenario")}
              className={`flex-1 py-3 text-center border-b-3 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "scenario"
                  ? "border-[#b7102a] text-[#b7102a]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Globe className="w-4 h-4" /> Bối Cảnh & Thử Thách
            </button>
            <button
              onClick={() => setActiveTab("aiOracle")}
              className={`flex-1 py-3 text-center border-b-3 transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "aiOracle"
                  ? "border-[#b7102a] text-[#b7102a]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Đàm Thoại Với AI
            </button>
          </div>

          {/* TAB CONTENT: Bối Cảnh & Trắc Nghiệm */}
          {activeTab === "scenario" && (
            <div className="flex-1 p-6 overflow-y-auto flex flex-col md:flex-row gap-6">
              {/* Left pane: Mascot Narrative story */}
              <div className="md:w-1/2 flex flex-col justify-between space-y-4">
                <div className="bg-[#fcf9f0] border border-amber-950/20 p-4 rounded-xl flex gap-3 relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-slate-50 relative border">
                    <img
                      src="/daisu_dulich.png"
                      alt="Guide AI"
                      className="w-full h-full object-cover"
                    />
                    {isSpeaking && (
                      <span className="absolute bottom-0 right-0 bg-secondary text-white p-0.5 rounded-full">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-primary font-headline-md tracking-tight">Trợ lý AI:</strong>
                      <button
                        onClick={speakScenario}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                        title="Nghe giọng đọc tiếng Pháp"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "text-secondary" : "text-gray-400"}`} />
                      </button>
                    </div>
                    <p className="text-gray-700 italic leading-relaxed">
                      {aiQcm ? aiQcm.narratorIntro : country.challengeScenarioFr}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-primary flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Bối cảnh xã hội & sinh thái vùng:
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed bg-[#f6f3ea] p-3 rounded-lg border border-gray-100 italic">
                    {aiQcm ? aiQcm.situation : country.descriptionVi}
                  </p>
                </div>

                {/* AI challenge generator triggers */}
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={generateAICultureQuiz}
                    disabled={aiQcmLoading}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold text-xs disabled:opacity-50 hover:from-amber-600 hover:to-amber-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiQcmLoading ? "animate-spin" : ""}`} />
                    {aiQcmLoading ? "AI Đang Soạn Câu Đố..." : "Lấy Thử Thách AI Tháp Tùng"}
                  </button>
                  {aiQcm && (
                    <button
                      onClick={() => {
                        setAiQcm(null);
                        setIsAnswered(false);
                        setSelectedOption(null);
                      }}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-gray-600 rounded-lg font-bold text-xs transition-colors"
                      title="Quay lại câu hỏi mặc định"
                    >
                      Mặc định
                    </button>
                  )}
                </div>
              </div>

              {/* Right pane: Interactive QCM questionnaire option list */}
              <div className="md:w-1/2 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <div>
                  <div className="flex items-center gap-1 mb-3 text-secondary text-xs font-black uppercase tracking-widest">
                    <HelpCircle className="w-4 h-4" /> Énigme de l'Ambassadeur
                  </div>
                  <h4 className="font-headline-md text-sm sm:text-base text-gray-900 font-bold leading-snug mb-4">
                    {activeQuiz.question}
                  </h4>

                  <div className="space-y-2.5">
                    {activeQuiz.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrectAnswer = idx === activeQuiz.correctIndex;

                      let btnStyle = "border-gray-200 hover:bg-gray-50 text-gray-700";
                      if (isAnswered) {
                        if (isCorrectAnswer) {
                          btnStyle = "border-green-500 bg-green-50 text-green-800 font-bold";
                        } else if (isSelected) {
                          btnStyle = "border-rose-400 bg-rose-50 text-rose-700";
                        } else {
                          btnStyle = "border-gray-100 opacity-60 text-gray-400";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSubmit(idx)}
                          disabled={isAnswered}
                          className={`w-full text-left p-3 rounded-xl border-2 text-xs sm:text-sm transition-all focus:outline-none flex items-center gap-2 cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-100 shrink-0 font-bold text-xs flex items-center justify-center text-slate-500">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Post Answer Feedback & Stamps unlocking */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {isAnswered ? (
                    <div className="space-y-3">
                      <div
                        className={`p-3 rounded-lg flex gap-2 items-start text-xs ${
                          selectedOption === activeQuiz.correctIndex
                            ? "bg-green-50 border border-green-200 text-green-900"
                            : "bg-rose-50 border border-rose-200 text-rose-900"
                        }`}
                      >
                        {selectedOption === activeQuiz.correctIndex ? (
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold mb-1">
                            {selectedOption === activeQuiz.correctIndex
                              ? "Félicitations (Tuyệt vời) !"
                              : "Oups (Chưa chính xác nhe)!"}
                          </p>
                          <p className="leading-relaxed font-semibold">{activeQuiz.explanation}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleCollectStamp}
                        className="w-full py-3 bg-secondary hover:bg-secondary-container text-white text-xs font-bold rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer flex items-center justify-center gap-1"
                      >
                        Đóng Mộc Đỏ Lên Passport và Tiếp Tục Vượt Hải Trình
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-center text-gray-400 italic">
                      Hãy chọn đáp án bạn tin là đúng nhất để khơi thông chướng ngại vật ngoại giao nhe!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Chatbot / AI Oracle */}
          {activeTab === "aiOracle" && (
            <div className="flex-1 p-4 bg-[#fcf9f0] flex flex-col justify-between overflow-hidden">
              {/* Explanations instructions */}
              <div className="shrink-0 p-2.5 bg-sky-50 border border-sky-100 text-sky-900 text-xs rounded-lg flex items-start gap-1.5 mb-3 leading-normal">
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Bộ Đàm Văn Hóa Đa Phương:</strong> Trò chuyện với AI về đất nước này bằng tiếng Pháp hoặc hỏi mọi thắc mắc của bạn về ngữ pháp tiếng Pháp. AI sẽ phản hồi và phát âm giọng đọc tiếng Pháp trực tiếp!
                </span>
              </div>

              {/* Message scroll log container */}
              <div className="flex-1 overflow-y-auto pr-1 bg-white rounded-xl border border-gray-200 p-3 space-y-3 mb-3 shadow-inner">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar icons */}
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border shadow-sm">
                      <img
                        src={
                          msg.role === "user"
                            ? character.avatarUrl
                            : "/daisu_dulich.png"
                        }
                        alt="sender"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div
                      className={`text-xs md:text-sm p-3 rounded-2xl max-w-[75%] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-none"
                          : "bg-stone-100 text-stone-800 rounded-tl-none border"
                      }`}
                    >
                      <p className="font-medium whitespace-pre-line">{msg.text}</p>
                      {msg.role === "model" && (
                        <div className="flex justify-end mt-1.5 border-t border-stone-200 pt-1">
                          <button
                            onClick={() => speakFrench(msg.text)}
                            className="text-[10px] text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer"
                            title="Nghe giọng đọc"
                          >
                            <Volume2 className="w-3 h-3 text-primary" /> Nghe phát âm
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                    <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                    <span>AI đang gõ câu trả lời bằng tiếng Pháp...</span>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="shrink-0 flex gap-2">
                <input
                  type="text"
                  maxLength={100}
                  placeholder={`Hỏi AI về nước ${country.nameVi} (Ví dụ: "Parle-moi de ce pays en français nhe!" )`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="bg-primary hover:bg-primary-container text-white p-3 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
