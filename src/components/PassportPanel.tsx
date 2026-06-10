import React, { useState } from "react";
import { OifCountryId, PlayerCharacter, StampProgress } from "../types";
import { OIF_COUNTRIES } from "../data/countries";
import { Award, CheckCircle, Globe, BookOpen, AlertCircle, X, ShieldAlert } from "lucide-react";

interface PassportPanelProps {
  character: PlayerCharacter & { passportColor: string };
  stamps: StampProgress[];
  onSelectCountry?: (id: OifCountryId) => void;
}

const getFlagUrl = (id: string) => {
  const map: Record<string, string> = {
    france: "fr",
    canada: "ca",
    belgique: "be",
    roumanie: "ro",
    suisse: "ch",
    maroc: "ma",
    senegal: "sn",
    madagascar: "mg",
    tunisie: "tn",
    vietnam: "vn"
  };
  return `https://flagcdn.com/w80/${map[id] || "fr"}.png`;
};

export default function PassportPanel({ character, stamps, onSelectCountry }: PassportPanelProps) {
  const [showRapport, setShowRapport] = useState(false);

  const completedCount = stamps.filter((s) => s.unlocked).length;
  const scoreTotal = stamps.reduce((acc, current) => acc + (current.score || 0), 0);

  // Background map color according to selected theme
  const getCoverColor = () => {
    switch (character.passportColor) {
      case "red":
        return "bg-gradient-to-b from-red-900 to-red-950 text-amber-100 border-red-800";
      case "gold":
        return "bg-gradient-to-b from-amber-900 to-zinc-950 text-amber-200 border-amber-950";
      default:
        return "bg-gradient-to-b from-blue-900 to-blue-950 text-blue-100 border-blue-950";
    }
  };

  return (
    <aside className="w-full lg:w-[320px] bg-[#f1eee5] p-6 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-[#c3c6d3] shadow-md shrink-0 lg:h-screen lg:overflow-y-auto">
      {/* Passport Embossing Header */}
      <div className={`p-4 rounded-xl border ${getCoverColor()} shadow-md relative overflow-hidden`}>
        {/* Subtle background golden pattern overlay */}
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden border-2 border-amber-400 mb-2 shadow-md">
            <img alt={character.name} className="w-full h-full object-cover" src={character.avatarUrl} />
          </div>
          <h2 className="font-headline-md text-sm font-bold tracking-tight text-amber-200 mb-0.5">
            PASSEPORT DIPLOMATIQUE
          </h2>
          <p className="font-display-lg text-lg font-bold text-white truncate max-w-full italic px-1">
            {character.name}
          </p>
          <div className="mt-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20">
            <p className="text-[10px] tracking-wider uppercase text-amber-300 font-bold max-w-[240px] truncate">
              {character.title}
            </p>
          </div>
        </div>
      </div>

      {/* Persistence Stats HUD block */}
      <div className="bg-[#fcf9f0] p-4 rounded-xl border border-[#c3c6d3] shadow-inner">
        <div className="flex items-center justify-between mb-3 border-b border-[#e5e2da] pb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" /> Visas Collectés
          </span>
          <span className="text-sm font-black text-primary bg-primary-container/20 px-2.5 py-0.5 rounded-full">
            {completedCount} / 10
          </span>
        </div>
        <div className="space-y-1.5 text-xs text-gray-700 font-semibold">
          <div className="flex justify-between">
            <span>Điểm tích lũy (Score):</span>
            <span className="text-primary font-bold">{scoreTotal} pts</span>
          </div>
          <div className="flex justify-between">
            <span>Ngôi sao thưởng thêm (Bonus):</span>
            <span className="text-amber-600 font-bold">
              {stamps.filter((s) => s.bonusEarned).length} 🌟
            </span>
          </div>
        </div>
      </div>

      {/* Stamps Scroll area */}
      <div className="flex-1">
        <h3 className="text-xs font-bold text-[#434751] uppercase tracking-widest mb-3 flex items-center justify-between">
          <span>Dấu mộc thông hành (Visas)</span>
          <span className="text-[10px] text-gray-400 capitalize">Chạm nước để xem chi tiết</span>
        </h3>

        <div className="grid grid-cols-2 gap-4 px-2">
          {OIF_COUNTRIES.map((country) => {
            const progress = stamps.find((s) => s.countryId === country.id);
            const isUnlocked = progress?.unlocked || false;

            return (
              <div
                key={country.id}
                onClick={() => onSelectCountry && onSelectCountry(country.id)}
                title={`Mộc chặng ${country.nameFr} (${isUnlocked ? "Đã đóng dấu" : "Chưa hoàn thành"})`}
                className={`aspect-square rounded-full border-2 flex flex-col items-center justify-center p-2 transition-all cursor-pointer relative shadow-sm hover:scale-105 active:scale-95 group ${
                  isUnlocked
                    ? "border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/20"
                    : "border-[#c3c6d3] bg-[#fcf9f0] border-dashed hover:border-gray-400 hover:bg-white"
                }`}
              >
                {isUnlocked ? (
                  /* Vector Stamps customized styles per country */
                  <div className="relative w-full h-full flex flex-col items-center justify-center text-center animate-stamp text-emerald-700">
                    <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/40 animate-spin-slow pointer-events-none"></div>
                    <img src={getFlagUrl(country.id)} alt={country.nameFr} className="w-10 h-7 object-cover rounded-sm shadow-sm mb-1.5" />
                    <span className="text-[10px] font-black uppercase truncate w-full px-2 text-emerald-800">
                      {country.nameFr}
                    </span>
                    {/* Tiny star for bonus perfection */}
                    {progress?.bonusEarned && (
                      <span className="absolute top-0 right-0 text-lg animate-bounce drop-shadow-md" title="Bonus Star">
                        ⭐
                      </span>
                    )}
                  </div>
                ) : (
                  /* Grayed and empty stamps */
                  <div className="flex flex-col items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <img src={getFlagUrl(country.id)} alt={country.nameFr} className="w-10 h-7 object-cover rounded-sm shadow-sm mb-1.5" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase truncate w-full px-2 text-center">
                      {country.nameFr}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Button footer for Mission summary */}
      <button
        onClick={() => setShowRapport(true)}
        className="w-full py-3 bg-[#b7102a] text-white rounded-full font-bold text-xs hover:bg-[#db313f] hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      >
        <Award className="w-4 h-4" /> Xem Báo Cáo Sứ Mệnh
      </button>

      {/* Mission Report Alert Modal popup */}
      {showRapport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body-md animate-fade-in">
          <div className="bg-[#fcf9f0] border-2 border-amber-950 rounded-2xl p-6 shadow-2xl max-w-lg w-full relative overflow-hidden">
            {/* Stamp print on background */}
            <div className="absolute top-4 right-4 text-7xl text-gray-200/40 font-black rotate-12 select-none pointer-events-none">
              OIF CERTIFIE
            </div>

            <div className="flex justify-between items-start border-b-2 border-amber-950/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#b7102a]" />
                <h3 className="font-headline-lg text-lg text-amber-950 font-bold uppercase tracking-wide">
                  Rapport de Mission Diplomatique
                </h3>
              </div>
              <button
                onClick={() => setShowRapport(false)}
                className="text-gray-500 hover:text-gray-900 rounded-full p-1 hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ambassador Card display */}
              <div className="bg-[#f1eee5] p-3 rounded-xl border border-[#c3c6d3] flex gap-3">
                <img
                  src={character.avatarUrl}
                  alt={character.name}
                  className="w-16 h-16 rounded-xl object-cover border border-amber-950/20"
                />
                <div>
                  <h4 className="font-bold text-amber-950 text-base">{character.name}</h4>
                  <p className="text-xs text-[#b7102a] font-bold uppercase tracking-wider">{character.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Trạng thái:{" "}
                    <strong>{completedCount === 10 ? "Đại sứ Xuất Sắc" : "Đang thực thi công vụ"}</strong>
                  </p>
                </div>
              </div>

              {/* Progress Summary list */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500">Thống Kê Kỳ Tích</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-[#e5e2da]">
                    <span className="text-gray-400 block font-bold uppercase">Ủy nhiệm hoàn thành</span>
                    <strong className="text-lg text-[#0a418e]">{completedCount} / 10 quốc gia</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#e5e2da]">
                    <span className="text-gray-400 block font-bold uppercase">Tổng điểm tích lũy</span>
                    <strong className="text-lg text-green-700">{scoreTotal} điểm</strong>
                  </div>
                </div>
              </div>

              {/* Ambassador's list of completed milestones */}
              <div className="max-h-[140px] overflow-y-auto bg-white p-3 rounded-xl border border-[#e5e2da] space-y-1.5 shadow-inner">
                {stamps.filter((s) => s.unlocked).length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">
                    Chưa có đất nước nào được mở khóa mộc thông hành trong chuyến đi! Hãy chọn chặng trên bản đồ để bắt đầu sứ mệnh.
                  </p>
                ) : (
                  stamps
                    .filter((s) => s.unlocked)
                    .map((st) => {
                      const co = OIF_COUNTRIES.find((x) => x.id === st.countryId);
                      return (
                        <div
                          key={st.countryId}
                          className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-bold text-gray-700 flex items-center gap-1.5">
                            <span>{co?.flag}</span>
                            <span>{co?.nameFr} ({co?.nameVi})</span>
                          </span>
                          <span className="text-green-600 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" /> +{st.score} pts
                            {st.bonusEarned && <span>(⭐ Thưởng)</span>}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Special message from Birdy */}
              <div className="bg-yellow-50/50 border border-yellow-200/60 p-3 rounded-lg flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-normal">
                  <strong>Nhật Ký Hành Trình:</strong>{" "}
                  {completedCount === 10 ? (
                    <span>
                      Felicitations, {character.name}! Bạn đã cống hiến trọn vẹn trái tim cho sự đa dạng Pháp ngữ toàn thế giới. Bản đồ 10 chặng đã bừng sáng hoàn hảo. Bạn xứng đáng được nhận Huân chương Danh dự OIF cao quý nhất!
                    </span>
                  ) : (
                    <span>
                      "Chặng đường vạn dặm khởi nguồn từ bước chân đầu tiên." Hiện bạn đã mở được {completedCount} chặng. Ngôn ngữ tiếng Pháp là hành trang kỳ diệu kết nối bạn với hàng trăm triệu con người trên địa cầu đấy! Hãy tiếp tục gõ cửa phiêu lưu nhé!
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRapport(false)}
              className="mt-5 w-full py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-100 rounded-full font-bold text-xs shadow-md cursor-pointer transition-colors"
            >
              Fermer (Đóng cửa sổ Nhật ký)
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
