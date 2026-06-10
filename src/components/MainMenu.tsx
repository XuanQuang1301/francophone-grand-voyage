import React, { useState } from "react";
import { Compass, Globe, Book, Settings, Info, LogOut, Volume2, UserPlus, MapPin } from "lucide-react";

interface MainMenuProps {
  onStartGame: () => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [voixAI, setVoixAI] = useState(true);
  const [sousTitres, setSousTitres] = useState(true);

  return (
    <div className="relative w-full h-screen bg-[#0A0A10] overflow-hidden font-body-md select-none flex items-center justify-center">
      {/* Blurred Full-Screen Background - Replaces black bars with a beautiful ambient glow */}
      <img 
        src="/main-menu-bg.png" 
        className="absolute inset-0 w-full h-full object-cover blur-[40px] opacity-60 scale-110 pointer-events-none" 
        alt=""
      />

      {/* Main Game Container - Perfectly letterboxed to 16:9 to prevent any image cropping! */}
      <div className="relative w-full h-full max-w-[calc(100vh*16/9)] aspect-video shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Background Image - object-cover inside a 16:9 box guarantees it shows fully without distortion or cropping */}
        <img 
          src="/main-menu-bg.png" 
          alt="Main Menu Background" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Subtle overlay to ensure UI text remains readable */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Main UI Container - padding is relative to the perfectly sized image now */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 md:p-10 lg:p-12">
          
          {/* TOP SECTION */}
          <div className="flex justify-between items-start">
            
            {/* Audio toggle top left */}
            <button className="flex items-center gap-2 bg-[#FDF6E3]/90 hover:bg-white text-[#0B3D91] border border-[#D4C3A3] rounded-full px-4 py-2 transition-all shadow-md backdrop-blur-md cursor-pointer group scale-90 origin-top-left">
              <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs tracking-widest">SON ACTIF</span>
            </button>

            {/* Title Center - Removed to reveal the beautiful title in the image */}
            <div className="flex flex-col items-center mt-2 group cursor-default"></div>

            {/* Post-it Note Right */}
            <div className="bg-[#FDF8E2] text-amber-950 p-4 rounded-sm shadow-lg rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 w-56 border border-[#D4C3A3] relative hidden lg:block origin-top-right">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-black/15 rounded-full blur-[2px]"></div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-600 rounded-full shadow-sm border border-red-800"></div>
              <p className="font-bold mb-1.5 text-[13px] leading-snug">10 pays t'attendent !<br/>10 missions pour la planète.</p>
              <p className="text-[10px] italic text-amber-900/80">Chaque mission t'aide à protéger la planète de manière ludique.</p>
            </div>
          </div>


          {/* MIDDLE SECTION */}
          <div className="flex-1 flex items-center justify-center my-4 pointer-events-none">
            {/* Empty center so we can see the beautiful background! */}
          </div>


          {/* BOTTOM SECTION */}
          <div className="flex justify-between items-end gap-6 relative z-10">
            
            {/* Left: AI Companion & Profile */}
            <div className="flex flex-col gap-4 w-[320px] scale-95 origin-bottom-left">
              {/* Dialogue Box */}
              <div className="bg-[#FDF6E3]/95 backdrop-blur-md rounded-2xl border border-[#D4C3A3] shadow-xl relative p-5 mt-16 group">
                <div className="absolute -top-4 left-5 bg-[#0B3D91] text-[#F4B400] px-4 py-1 rounded-lg border border-[#F4B400] font-extrabold shadow-md flex items-center gap-1.5 text-xs tracking-widest">
                  <MapPin className="w-3.5 h-3.5 animate-bounce" />
                  Capitaine Lumière
                </div>
                {/* AI Character */}
                <div className="absolute bottom-6 -right-28 w-[460px] h-[460px] pointer-events-none z-20 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] group-hover:scale-105 transition-transform duration-500">
                   <img src="/AI.png" alt="AI" className="w-full h-full object-contain animate-float" />
                </div>
                <p className="text-[#4A3B2C] text-[15px] leading-relaxed mt-2 pr-8 relative z-10 font-bold italic">
                  "Bienvenue, Ambassadeur ! Ton passeport va t'ouvrir les portes d'un monde incroyable."
                </p>
              </div>

              {/* Profile Creation */}
              <div className="bg-[#FDF6E3]/95 backdrop-blur-md rounded-2xl border border-[#D4C3A3] p-3 shadow-lg flex items-center gap-3 hover:scale-105 hover:border-[#F4B400] transition-all cursor-pointer group">
                 <div className="w-12 h-12 bg-[#0B3D91] rounded-xl flex items-center justify-center border border-[#F4B400] text-[#F4B400] shadow-inner group-hover:bg-[#F4B400] group-hover:text-[#0B3D91] transition-colors">
                    <UserPlus className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-[9px] text-[#4A3B2C]/70 font-black uppercase tracking-widest mb-0.5">CRÉER MON PASSEPORT</p>
                   <p className="font-black text-[#0B3D91] text-base">Nouveau joueur</p>
                 </div>
              </div>
            </div>

            {/* Center: Commencer Le Voyage + Settings Bar */}
            <div className="flex flex-col items-center gap-5 scale-95 origin-bottom">
              
              {/* COMMENCER LE VOYAGE Button */}
              <button 
                onClick={onStartGame}
                className="group relative bg-[#0B3D91]/90 backdrop-blur-md border-2 border-[#F4B400] rounded-full px-10 py-4 shadow-[0_0_25px_rgba(11,61,145,0.5),inset_0_0_15px_rgba(244,180,0,0.2)] transition-all hover:scale-110 hover:shadow-[0_0_40px_rgba(244,180,0,0.4)] active:scale-95 cursor-pointer overflow-hidden flex items-center gap-4"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_50%)]"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity duration-300"></div>
                <Compass className="w-10 h-10 text-[#F4B400] group-hover:rotate-[360deg] transition-transform duration-1000 ease-in-out filter drop-shadow-[0_0_8px_rgba(244,180,0,0.6)]" />
                <div className="text-left relative z-10">
                  <span className="block font-headline-lg text-2xl font-black text-white tracking-widest drop-shadow-md">
                    COMMENCER LE VOYAGE
                  </span>
                </div>
              </button>

              {/* Settings Bar */}
              <div className="bg-[#FDF6E3]/95 backdrop-blur-md rounded-3xl border border-[#D4C3A3] p-4 flex gap-6 shadow-xl items-center relative z-10">
                
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] text-[#4A3B2C] font-black tracking-widest">LANGUE</span>
                  <div className="flex bg-[#EAE0C8] rounded-xl p-1 shadow-inner border border-[#D4C3A3]/50">
                    <button className="px-4 py-1 bg-[#0B3D91] text-[#F4B400] rounded-lg text-[10px] font-black shadow border border-[#0B3D91]">FR</button>
                  </div>
                </div>

                <div className="w-px h-8 bg-[#D4C3A3]/50"></div>

                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] text-[#4A3B2C] font-black tracking-widest">SOUS-TITRES</span>
                  <div className="flex bg-[#EAE0C8] rounded-xl p-1 shadow-inner border border-[#D4C3A3]/50">
                    <button onClick={() => setSousTitres(false)} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${!sousTitres ? 'bg-[#4A3B2C] text-[#FDF6E3] shadow' : 'text-[#4A3B2C]/60 hover:text-[#4A3B2C]'}`}>OFF</button>
                    <button onClick={() => setSousTitres(true)} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${sousTitres ? 'bg-[#22C55E] text-white shadow' : 'text-[#4A3B2C]/60 hover:text-[#4A3B2C]'}`}>ON</button>
                  </div>
                </div>

                <div className="w-px h-8 bg-[#D4C3A3]/50"></div>

                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] text-[#4A3B2C] font-black tracking-widest">VOIX AI</span>
                  <div className="flex bg-[#EAE0C8] rounded-xl p-1 shadow-inner border border-[#D4C3A3]/50">
                    <button onClick={() => setVoixAI(false)} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${!voixAI ? 'bg-[#4A3B2C] text-[#FDF6E3] shadow' : 'text-[#4A3B2C]/60 hover:text-[#4A3B2C]'}`}>OFF</button>
                    <button onClick={() => setVoixAI(true)} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${voixAI ? 'bg-[#22C55E] text-white shadow' : 'text-[#4A3B2C]/60 hover:text-[#4A3B2C]'}`}>ON</button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Vertical Menu */}
            <div className="flex flex-col gap-2.5 w-[240px] scale-95 origin-bottom-right">
              <button className="bg-[#FDF6E3]/95 backdrop-blur-md hover:bg-white text-[#0B3D91] rounded-2xl p-3 shadow-lg border border-[#D4C3A3] hover:border-[#F4B400] flex items-center gap-3 transition-all cursor-pointer group hover:-translate-y-1">
                 <div className="bg-[#0B3D91] text-[#F4B400] p-1.5 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                    <Globe className="w-4 h-4" />
                 </div>
                 <span className="font-black tracking-wider text-xs">CARTE DU MONDE</span>
              </button>
              <button className="bg-[#FDF6E3]/95 backdrop-blur-md hover:bg-white text-[#0B3D91] rounded-2xl p-3 shadow-lg border border-[#D4C3A3] hover:border-[#22C55E] flex items-center gap-3 transition-all cursor-pointer group hover:-translate-y-1">
                 <div className="bg-[#22C55E] text-white p-1.5 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                    <Book className="w-4 h-4" />
                 </div>
                 <span className="font-black tracking-wider text-xs">MON PASSEPORT</span>
              </button>
              <button className="bg-[#FDF6E3]/95 backdrop-blur-md hover:bg-white text-[#0B3D91] rounded-2xl p-3 shadow-lg border border-[#D4C3A3] hover:border-[#F4B400] flex items-center gap-3 transition-all cursor-pointer group hover:-translate-y-1">
                 <div className="bg-[#F4B400] text-white p-1.5 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                    <Settings className="w-4 h-4" />
                 </div>
                 <span className="font-black tracking-wider text-xs">PARAMÈTRES</span>
              </button>
              <button className="bg-[#FDF6E3]/95 backdrop-blur-md hover:bg-white text-[#0B3D91] rounded-2xl p-3 shadow-lg border border-[#D4C3A3] hover:border-purple-500 flex items-center gap-3 transition-all cursor-pointer group hover:-translate-y-1">
                 <div className="bg-purple-500 text-white p-1.5 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                    <Info className="w-4 h-4" />
                 </div>
                 <span className="font-black tracking-wider text-xs">À PROPOS</span>
              </button>
              
              <button className="mt-2 bg-[#4A3B2C]/90 hover:bg-red-600 text-white border border-transparent rounded-2xl p-3 shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer font-black tracking-widest hover:-translate-y-1">
                 <LogOut className="w-4 h-4" /> QUITTER
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

