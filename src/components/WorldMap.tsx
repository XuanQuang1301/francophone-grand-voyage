import React, { useState } from "react";
import { OifCountryId, CountryMetadata, StampProgress, PlayerCharacter } from "../types";
import { OIF_COUNTRIES } from "../data/countries";
import { speakFrench } from "../utils/speech";
import { Compass } from "lucide-react";

interface WorldMapProps {
  stamps: StampProgress[];
  onSelectCountry: (id: OifCountryId) => void;
  character: PlayerCharacter;
}

// Each country's card position as a percentage of the image dimensions.
// Based on the 1536×1024 "Mission Francophonie" grid (5 columns × 2 rows).
// These are the CENTER of each illustrated card, plus the card's width/height span.
const CARD_AREAS: Record<OifCountryId, { cx: number; cy: number; w: number; h: number }> = {
  // Row 1
  france:     { cx: 18.0, cy: 42.5, w: 14, h: 31 },
  canada:     { cx: 34.0, cy: 42.5, w: 14, h: 31 },
  belgique:   { cx: 50.0, cy: 42.5, w: 14, h: 31 },
  roumanie:   { cx: 66.0, cy: 42.5, w: 14, h: 31 },
  suisse:     { cx: 82.0, cy: 42.5, w: 14, h: 31 },
  // Row 2
  maroc:      { cx: 18.0, cy: 79.0, w: 14, h: 31 },
  senegal:    { cx: 34.0, cy: 79.0, w: 14, h: 31 },
  madagascar: { cx: 50.0, cy: 79.0, w: 14, h: 31 },
  tunisie:    { cx: 66.0, cy: 79.0, w: 14, h: 31 },
  vietnam:    { cx: 82.0, cy: 79.0, w: 14, h: 31 },
};

export default function WorldMap({ stamps, onSelectCountry, character }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<CountryMetadata | null>(null);

  const handleMouseEnter = (country: CountryMetadata) => {
    setHoveredCountry(country);
    speakFrench(country.nameFr, { rate: 0.9 });
  };

  const handleMouseLeave = () => setHoveredCountry(null);

  const getStatusBadge = (id: OifCountryId) => {
    const stamp = stamps.find((s) => s.countryId === id);
    if (!stamp?.unlocked) return { text: "Chưa thám hiểm", color: "text-rose-500 bg-rose-50 border-rose-200" };
    return {
      text: stamp.bonusEarned ? "Hoàn Hảo ⭐" : "Đã Đóng Mộc ✓",
      color: "text-green-600 bg-green-50 border-green-200",
    };
  };

  return (
    <div 
      className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #DDF4FF 0%, #F8F3E8 100%)" }}
    >

      {/* ── Aspect-ratio wrapper so overlay % coords map 1:1 to the image ── */}
      <div
        className="relative flex-shrink-0"
        style={{
          /* Keep the image's natural 3:2 ratio; fit inside the container */
          aspectRatio: "1536 / 1024",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
      >
        {/* The illustrated map */}
        <img
          alt="Mission Francophonie - 10 pays francophones"
          src="/world_map.png"
          className="w-full h-full object-fill pointer-events-none select-none"
          draggable={false}
        />

        {/* ── Tooltip animation ── */}
        <style>{`
          .tt-pop {
            animation: ttPop 0.18s cubic-bezier(0.175,0.885,0.32,1.15) forwards;
          }
          @keyframes ttPop {
            from { opacity:0; transform:scale(0.9) translateY(4px); }
            to   { opacity:1; transform:scale(1)   translateY(0);   }
          }
          .card-glow {
            box-shadow: 0 0 0 3px rgba(255,200,40,0.7), 0 0 20px 6px rgba(255,200,40,0.35);
          }
        `}</style>

        {/* ── Invisible clickable overlays — one per country card ── */}
        {OIF_COUNTRIES.map((country) => {
          const area = CARD_AREAS[country.id];
          if (!area) return null;

          const isUnlocked = stamps.find((s) => s.countryId === country.id)?.unlocked || false;
          const isHovered  = hoveredCountry?.id === country.id;

          /* Left edge of the clickable rect */
          const left = area.cx - area.w / 2;
          const top  = area.cy - area.h / 2;

          /* Tooltip: row 1 (cy<60) → show below; row 2 → show above */
          const isTopRow = area.cy < 60;
          const isLeftCol  = area.cx < 30;
          const isRightCol = area.cx > 70;

          let ttClass = isTopRow
            ? "absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2"
            : "absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2";

          if (isLeftCol)  ttClass = isTopRow
            ? "absolute top-[calc(100%+8px)] left-0"
            : "absolute bottom-[calc(100%+8px)] left-0";
          if (isRightCol) ttClass = isTopRow
            ? "absolute top-[calc(100%+8px)] right-0"
            : "absolute bottom-[calc(100%+8px)] right-0";

          return (
            <div
              key={country.id}
              className="absolute"
              style={{
                left:   `${left}%`,
                top:    `${top}%`,
                width:  `${area.w}%`,
                height: `${area.h}%`,
                zIndex: isHovered ? 40 : 20,
              }}
            >
              {/* Transparent interactive overlay */}
              <div
                className={`
                  relative w-full h-full rounded-2xl cursor-pointer
                  transition-all duration-200
                  ${isHovered ? "bg-white/5" : "bg-transparent"}
                `}
                onMouseEnter={() => handleMouseEnter(country)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onSelectCountry(country.id)}
              >
                {/* Completed stamp overlay badge */}
                {isUnlocked && (
                  <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md select-none">
                    ✓
                  </span>
                )}

                {/* ── Tooltip ── */}
                {isHovered && (
                  <div className={`pointer-events-none ${ttClass} z-50`} style={{ minWidth: "260px", maxWidth: "300px" }}>
                    <div className="bg-white/97 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200/80 tt-pop">
                      {/* Header */}
                      <div className="flex items-center gap-2.5 mb-2.5 border-b border-gray-100 pb-2.5">
                        <span className="text-3xl leading-none">{country.flag}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-[#0a418e] leading-tight truncate">
                            {country.nameFr}
                          </h3>
                          <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest mt-0.5">
                            Thủ đô: <span className="text-stone-700 font-bold normal-case">{country.capital}</span>
                          </p>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusBadge(country.id).color}`}>
                          {getStatusBadge(country.id).text}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="space-y-1 text-[10.5px] text-stone-700 mb-2.5">
                        <p className="flex justify-between">
                          <span className="text-stone-400 font-bold uppercase text-[9px]">Ngôn ngữ</span>
                          <span className="font-semibold text-right max-w-[160px]">{country.language}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-stone-400 font-bold uppercase text-[9px]">Dân số</span>
                          <span className="font-semibold">{country.population}</span>
                        </p>
                      </div>

                      {/* Mission */}
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 text-[10px] text-amber-900 font-semibold leading-relaxed">
                        🎯 <strong>{country.challengeTitle}</strong>
                        <br />
                        <span className="text-stone-600 font-normal">{country.challengeScenarioVi.substring(0, 75)}…</span>
                      </div>

                      {/* Fun fact */}
                      <p className="mt-2 text-[9px] text-sky-800 italic leading-relaxed bg-sky-50 border border-sky-100 rounded-lg p-1.5">
                        💡 {country.funFact}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Player Character — Bottom left ── */}
      <div className="absolute bottom-0 left-2 z-30 flex items-end pointer-events-auto select-none" style={{ maxWidth: "340px" }}>
        <div className="flex items-end gap-3">
          <img
            alt={character.name}
            src={character.avatarUrl}
            className="w-40 sm:w-48 md:w-56 h-auto drop-shadow-2xl pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      {/* ── AI Mascot & Progress HUD — Top right ── */}
      <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-3 pointer-events-auto select-none">
        {/* Progress HUD */}
        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-[#0a418e] animate-spin-slow" />
          <div>
            <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase leading-none">Mission OIF</p>
            <p className="text-sm font-bold text-[#0a418e] leading-tight">
              {stamps.filter((s) => s.unlocked).length} / 10 Hoàn thành
            </p>
          </div>
        </div>

        {/* AI Mascot & Speech */}
        <div className="flex items-start gap-3 flex-row-reverse mt-2">
          <img
            alt="Guide AI Mascot"
            src="/AI.png"
            className="w-32 sm:w-40 md:w-48 h-auto drop-shadow-2xl pointer-events-none"
            draggable={false}
          />

          {/* Speech bubble */}
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl rounded-tr-none shadow-xl border-2 border-amber-200/60 mt-4 max-w-[240px] md:max-w-[280px]">
            <p className="text-xs md:text-sm text-gray-800 leading-relaxed font-medium text-right">
              <strong className="text-[#0a418e] font-black block text-sm md:text-base mb-1">
                {hoveredCountry ? `📍 ${hoveredCountry.nameVi}!` : "AI chào bạn!"}
              </strong>
              {hoveredCountry
                ? <>Nhấn để bắt đầu nhiệm vụ <b>{hoveredCountry.challengeTitle}</b>!</>
                : <>Di chuột vào <b>khung quốc gia</b> để xem chi tiết, nhấn để chơi!</>
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
