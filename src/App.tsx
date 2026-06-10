import React, { useState, useEffect } from "react";
import { OifCountryId, PlayerCharacter, StampProgress } from "./types";
import { OIF_COUNTRIES } from "./data/countries";
import CharacterCreator from "./components/CharacterCreator";
import PassportPanel from "./components/PassportPanel";
import WorldMap from "./components/WorldMap";
import RiverNettoyageGame from "./components/RiverNettoyageGame";
import MountainMemoryGame from "./components/MountainMemoryGame";
import CulturalChallenge from "./components/CulturalChallenge";
import MainMenu from "./components/MainMenu";
import { stopAllSpeech } from "./utils/speech";
import { BookOpen, User, Menu, X, Landmark, Compass, HelpCircle } from "lucide-react";

export default function App() {
  const [character, setCharacter] = useState<(PlayerCharacter & { passportColor: string; userId: number }) | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [stamps, setStamps] = useState<StampProgress[]>([]);
  const [activeCountryId, setActiveCountryId] = useState<OifCountryId | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const initialStamps: StampProgress[] = OIF_COUNTRIES.map((country) => ({
      countryId: country.id,
      unlocked: false,
      score: 0,
      bonusEarned: false,
    }));
    setStamps(initialStamps);
  }, []);

  // Fetch user progress when character is loaded
  useEffect(() => {
    if (character && character.userId > 0) {
      fetch(`/api/users/${character.userId}/progress`)
        .then(res => res.json())
        .then(data => {
          if (data.progress) {
            setStamps(prev => prev.map(s => {
              const p = data.progress.find((dp: any) => dp.countryCode === s.countryId);
              if (p) {
                return {
                  ...s,
                  unlocked: true,
                  score: Math.max(s.score, p.score || 0),
                  completedAt: p.completedAt ? new Date(p.completedAt).toLocaleDateString("vi-VN") : undefined,
                };
              }
              return s;
            }));
          }
        })
        .catch(err => console.error("Failed to load progress", err));
    }
  }, [character]);

  const handleCharacterSetup = (char: PlayerCharacter & { passportColor: string; userId: number }) => {
    setCharacter(char);
  };

  const handleSelectCountry = (id: OifCountryId) => {
    stopAllSpeech();
    setActiveCountryId(id);
    setMobileSidebarOpen(false);
  };

  const handleChallengeSuccess = async (score: number, bonus: boolean) => {
    if (!activeCountryId) return;

    const currentCountry = activeCountryId;

    setStamps((prev) =>
      prev.map((s) =>
        s.countryId === currentCountry
          ? {
              ...s,
              unlocked: true,
              score: Math.max(s.score, score),
              bonusEarned: s.bonusEarned || bonus,
              completedAt: new Date().toLocaleDateString("vi-VN"),
            }
          : s
      )
    );
    setActiveCountryId(null);

    // Save to database
    if (character && character.userId > 0) {
      try {
        await fetch(`/api/users/${character.userId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryCode: currentCountry, score }),
        });
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
  };

  if (!gameStarted) {
    return <MainMenu onStartGame={() => setGameStarted(true)} />;
  }

  if (!character) {
    return <CharacterCreator onComplete={handleCharacterSetup} />;
  }

  const activeCountry = OIF_COUNTRIES.find((c) => c.id === activeCountryId);

  const renderMainContent = () => {
    if (!activeCountryId || !activeCountry) {
      return (
        <WorldMap
          stamps={stamps}
          onSelectCountry={handleSelectCountry}
          character={character}
        />
      );
    }

    // Specific mini games
    switch (activeCountryId) {
      case "france":
        return (
          <RiverNettoyageGame
            character={character}
            onBack={() => setActiveCountryId(null)}
            onSuccess={handleChallengeSuccess}
          />
        );
      case "vietnam":
        return (
          <MountainMemoryGame
            onBack={() => setActiveCountryId(null)}
            onSuccess={handleChallengeSuccess}
          />
        );
      default:
        // Handles other 8 countries (including Roumanie) with dynamic AI support and presets
        return (
          <CulturalChallenge
            country={activeCountry}
            character={character}
            onBack={() => setActiveCountryId(null)}
            onSuccess={handleChallengeSuccess}
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#f4f1e8] font-body-md overflow-hidden relative">
      {/* 1. Main Viewport Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Navigation top header */}
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            <h1 className="font-display-lg text-sm sm:text-base font-bold text-primary tracking-tight">
              Grand Voyage • Đại Hải Trình Pháp Ngữ
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick status counters */}
            <div className="hidden sm:flex items-center gap-2.5 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1">
                <Compass className="w-4 h-4 text-secondary" /> Visas:{" "}
                <strong className="text-gray-800">
                  {stamps.filter((s) => s.unlocked).length} / 10
                </strong>
              </span>
              <span className="w-px h-3 bg-gray-300"></span>
              <span>
                Đại sứ: <strong className="text-primary">{character.name}</strong>
              </span>
            </div>

            {/* Mobile Menu Toggle button */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Mở Hộ Chiếu"
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs font-bold font-headline-md">Hộ Chiếu</span>
            </button>
          </div>
        </header>

        {/* Viewport component */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-[#e5e2da]">
          {renderMainContent()}
        </div>
      </main>

      {/* 2. Passport Sidebar Drawer Panel */}
      {/* Desktop view style */}
      <div className="hidden lg:block h-full border-l border-gray-200">
        <PassportPanel
          character={character}
          stamps={stamps}
          onSelectCountry={handleSelectCountry}
        />
      </div>

      {/* Mobile view Modal Drawer slide out style */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Black shade background */}
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          ></div>

          {/* Sliding panel box */}
          <div className="relative w-80 max-w-[85vw] ml-auto h-full bg-[#f1eee5] flex flex-col z-10 animate-fade-in shadow-2xl">
            <div className="p-4 flex justify-between items-center bg-white border-b border-gray-200 shrink-0">
              <span className="font-headline-md text-xs font-black uppercase text-gray-500 tracking-wider">
                Hồ sơ ngoại giao
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Embedded Sidebar in mobile */}
            <div className="flex-1 h-full overflow-y-auto">
              <PassportPanel
                character={character}
                stamps={stamps}
                onSelectCountry={handleSelectCountry}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
