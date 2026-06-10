import React, { useState } from "react";
import { Compass, Globe, Book, Settings, Info, LogOut, Volume2, UserPlus } from "lucide-react";

interface MainMenuProps {
  onStartGame: () => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [voixAI, setVoixAI] = useState(true);
  const [sousTitres, setSousTitres] = useState(true);

  return (
    <div className="relative w-full h-screen bg-[#DDF4FF] overflow-hidden font-body-md select-none">
      {/* Background Layer */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="/main-menu-bg.png" 
          alt="Main Menu Background" 
          className="w-full h-full object-cover object-center"
        />
        {/* Soft light overlay instead of dark */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#DDF4FF]/40 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col justify-between p-8">
        
        {/* TOP SECTION */}
        <div className="flex justify-between items-start">
          
          {/* Audio toggle top left */}
          <button className="flex items-center gap-2 bg-white/90 hover:bg-white text-[#0a418e] border-2 border-[#0a418e]/20 rounded-full px-5 py-2.5 transition-all shadow-lg backdrop-blur-sm cursor-pointer">
            <Volume2 className="w-5 h-5" />
            <span className="font-black text-sm tracking-widest">SON ACTIF</span>
          </button>

          {/* Title Center */}
          <div className="flex flex-col items-center mt-2">
            <h1 className="font-headline-lg text-6xl md:text-8xl font-black text-[#FFF8E7] text-center leading-none tracking-tight [text-shadow:0_3px_10px_rgba(0,0,0,0.45),_0_0_20px_rgba(255,215,0,0.25)]">
              Passeport<br />Francophone
            </h1>
            <div className="mt-4 bg-white/95 border-4 border-[#0a418e] rounded-2xl px-8 py-3 shadow-xl relative">
               <h2 className="font-display-lg text-[#0a418e] text-2xl font-black tracking-[0.1em] uppercase relative z-10">
                 Les Ambassadeurs du Monde
               </h2>
            </div>
            <p className="mt-5 text-[#0a418e] font-bold italic drop-shadow-sm text-xl bg-white/60 px-6 py-1.5 rounded-full backdrop-blur-md">
              Apprendre le français par le voyage et l'aventure
            </p>
          </div>

          {/* Post-it Note Right */}
          <div className="bg-[#fdf8e2] text-amber-950 p-5 rounded-sm shadow-2xl rotate-3 w-64 border border-[#e5e0c8] relative hidden lg:block">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-black/10 rounded-full blur-sm"></div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full shadow-sm border border-red-800"></div>
            <p className="font-bold mb-2">10 pays t'attendent !<br/>10 missions pour la planète.</p>
            <p className="text-sm italic">Chaque mission t'aide à protéger la planète de manière ludique.</p>
          </div>
        </div>


        {/* MIDDLE SECTION */}
        <div className="flex-1 flex items-center justify-center my-8">
          <button 
            onClick={onStartGame}
            className="group relative bg-gradient-to-b from-[#0B3D91] to-[#082B6A] border-[3px] border-[#F4B400] rounded-2xl px-12 py-6 shadow-[0_8px_20px_rgba(11,61,145,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer overflow-hidden flex items-center gap-4"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_50%)]"></div>
            <Compass className="w-12 h-12 text-[#F4B400] group-hover:rotate-45 transition-transform duration-500" />
            <div className="text-left relative z-10">
              <span className="block font-headline-lg text-3xl font-black text-white tracking-wider drop-shadow-md">
                COMMENCER LE VOYAGE
              </span>
            </div>
          </button>
        </div>


        {/* BOTTOM SECTION */}
        <div className="flex justify-between items-end gap-6 relative z-10">
          
          {/* Left: AI Companion & Profile */}
          <div className="flex flex-col gap-4 w-[360px]">
            {/* Dialogue Box */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border-[3px] border-[#5CC8FF] shadow-[0_0_25px_rgba(92,200,255,0.4)] relative p-6 mt-20">
              <div className="absolute -top-6 left-6 bg-white text-[#0B3D91] px-5 py-2 rounded-xl border-2 border-[#5CC8FF] font-extrabold shadow-md flex items-center gap-2 text-sm tracking-widest">
                <Compass className="w-4 h-4 text-[#5CC8FF]" />
                Capitaine Lumière
              </div>
              <div className="absolute bottom-12 -right-8 w-56 h-56 pointer-events-none z-20 drop-shadow-[0_0_12px_#5CC8FF] drop-shadow-[0_0_24px_#5CC8FF]">
                 <img src="/AI.png" alt="AI" className="w-full h-full object-contain animate-float" />
              </div>
              <p className="text-[#334155] text-[18px] leading-[1.6] mt-3 pr-8 relative z-10 font-bold">
                "Bienvenue, Ambassadeur ! Ton passeport va t'ouvrir les portes d'un monde incroyable."
              </p>
            </div>

            {/* Profile Creation */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-[#0a418e]/20 p-4 shadow-xl flex items-center gap-4 hover:scale-105 transition-transform cursor-pointer">
               <div className="w-14 h-14 bg-[#0a418e] rounded-xl flex items-center justify-center border-2 border-white text-white shadow-lg">
                  <UserPlus className="w-7 h-7" />
               </div>
               <div>
                 <p className="text-[11px] text-[#0a418e]/70 font-black uppercase tracking-widest mb-0.5">CRÉER MON PASSEPORT</p>
                 <p className="font-black text-gray-800 text-lg">Nouveau joueur</p>
               </div>
            </div>
          </div>

          {/* Center: Settings Bar */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border-2 border-[#0a418e]/20 p-5 flex gap-10 shadow-2xl items-center relative z-10">
            
            <div className="flex flex-col items-center gap-2.5">
              <span className="text-[11px] text-[#0a418e] font-black tracking-widest">LANGUE</span>
              <div className="flex bg-gray-100 rounded-xl p-1.5 border-2 border-gray-200">
                <button className="px-5 py-2 bg-[#0a418e] text-white rounded-lg text-xs font-black shadow-md">FR</button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <span className="text-[11px] text-[#0a418e] font-black tracking-widest">SOUS-TITRES</span>
              <div className="flex bg-gray-100 rounded-xl p-1.5 border-2 border-gray-200">
                <button onClick={() => setSousTitres(false)} className={`px-5 py-2 rounded-lg text-xs font-black transition-colors ${!sousTitres ? 'bg-gray-400 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>Désactivés</button>
                <button onClick={() => setSousTitres(true)} className={`px-5 py-2 rounded-lg text-xs font-black transition-colors ${sousTitres ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>Activés</button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <span className="text-[11px] text-[#0a418e] font-black tracking-widest">VOIX AI</span>
              <div className="flex bg-gray-100 rounded-xl p-1.5 border-2 border-gray-200">
                <button onClick={() => setVoixAI(false)} className={`px-5 py-2 rounded-lg text-xs font-black transition-colors ${!voixAI ? 'bg-gray-400 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>Désactivée</button>
                <button onClick={() => setVoixAI(true)} className={`px-5 py-2 rounded-lg text-xs font-black transition-colors ${voixAI ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>Activée</button>
              </div>
            </div>

          </div>

          {/* Right: Vertical Menu */}
          <div className="flex flex-col gap-3 w-[280px]">
            <button className="bg-[#FFF8E7]/95 backdrop-blur-sm hover:bg-white text-gray-800 rounded-xl p-3 shadow-xl border-2 border-[#F4B400]/40 flex items-center gap-3 transition-all cursor-pointer group">
               <div className="bg-[#0B3D91] text-white p-2 rounded-full shadow-inner group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
               </div>
               <span className="font-bold tracking-wider text-[#0B3D91]">CARTE DU MONDE</span>
            </button>
            <button className="bg-[#FFF8E7]/95 backdrop-blur-sm hover:bg-white text-gray-800 rounded-xl p-3 shadow-xl border-2 border-[#F4B400]/40 flex items-center gap-3 transition-all cursor-pointer group">
               <div className="bg-[#22C55E] text-white p-2 rounded-full shadow-inner group-hover:scale-110 transition-transform">
                  <Book className="w-5 h-5" />
               </div>
               <span className="font-bold tracking-wider text-[#0B3D91]">MON PASSEPORT</span>
            </button>
            <button className="bg-[#FFF8E7]/95 backdrop-blur-sm hover:bg-white text-gray-800 rounded-xl p-3 shadow-xl border-2 border-[#F4B400]/40 flex items-center gap-3 transition-all cursor-pointer group">
               <div className="bg-[#F4B400] text-white p-2 rounded-full shadow-inner group-hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5" />
               </div>
               <span className="font-bold tracking-wider text-[#0B3D91]">PARAMÈTRES</span>
            </button>
            <button className="bg-[#FFF8E7]/95 backdrop-blur-sm hover:bg-white text-gray-800 rounded-xl p-3 shadow-xl border-2 border-[#F4B400]/40 flex items-center gap-3 transition-all cursor-pointer group">
               <div className="bg-purple-500 text-white p-2 rounded-full shadow-inner group-hover:scale-110 transition-transform">
                  <Info className="w-5 h-5" />
               </div>
               <span className="font-bold tracking-wider text-[#0B3D91]">À PROPOS</span>
            </button>
            
            <button className="mt-4 bg-white/95 hover:bg-red-50 text-red-600 border-2 border-red-200 rounded-xl p-3 shadow-xl flex items-center justify-center gap-2 transition-colors cursor-pointer font-black tracking-widest">
               <LogOut className="w-4 h-4" /> QUITTER
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
