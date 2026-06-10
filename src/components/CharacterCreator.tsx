import React, { useState } from "react";
import { PlayerCharacter } from "../types";
import { Sparkles, Globe, User, BookOpen } from "lucide-react";

interface CharacterCreatorProps {
  onComplete: (character: PlayerCharacter & { passportColor: string; userId: number }) => void;
}

const PRESET_AVATARS = [
  {
    id: "lucas",
    name: "Lucas (16 ans)",
    desc: "Dynamique, curieux et avide de découvertes. Toujours muni de sa boussole et de son carnet de bord.",
    url: "/Lucas.png",
  },
  {
    id: "chiloe",
    name: "Chiloe (17 ans)",
    desc: "Passionnée de photographie et de culture. Immortalise chaque beau moment de son voyage.",
    url: "/Chiloe.png",
  },
];

const DIPLOMATIC_TITLES = [
  {
    fr: "Ambassadeur Culturel",
    desc: "Représentant officiel chargé de promouvoir les ponts de la connaissance et du développement.",
  },
  {
    fr: "Attaché d'Espoir et d'Éducation",
    desc: "Agit pour éclairer les régions isolées grâce à l'éducation et aux bourses scolaires.",
  },
  {
    fr: "Gardien du Patrimoine",
    desc: "Spécialiste de la restauration de la nature, de l'écologie et de la préservation du patrimoine.",
  },
];

const PASSPORT_COVERS = [
  { color: "bg-primary text-white border-primary-container", label: "Bleu OIF", name: "blue" },
  { color: "bg-secondary text-white border-red-800", label: "Rouge Classique", name: "red" },
  { color: "bg-amber-900 text-amber-100 border-amber-950", label: "Or Antique", name: "gold" },
];

export default function CharacterCreator({ onComplete }: CharacterCreatorProps) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [selectedAvatarId, setSelectedAvatarId] = useState(PRESET_AVATARS[0].id);
  const [selectedTitle, setSelectedTitle] = useState(DIPLOMATIC_TITLES[0].fr);
  const [passportColor, setPassportColor] = useState("blue");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState<{ text: string; isNew: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    setLoginMsg(null);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: name.trim(), avatarId: selectedAvatarId }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      const { user, isNewUser } = data;

      setLoginMsg({
        text: isNewUser
          ? `🎉 Bienvenue au nouvel Ambassadeur ${user.nickname} !`
          : `👋 Bon retour, ${user.nickname} !`,
        isNew: isNewUser,
      });

      setTimeout(() => {
        onComplete({
          name: user.nickname,
          avatarUrl: selectedAvatar,
          title: selectedTitle,
          gender: "ambassador",
          passportColor,
          userId: user.id,
        });
      }, 800);

    } catch (err) {
      console.error("Login error:", err);
      onComplete({
        name: name.trim(),
        avatarUrl: selectedAvatar,
        title: selectedTitle,
        gender: "ambassador",
        passportColor,
        userId: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0A0A10] overflow-hidden font-body-md select-none flex items-center justify-center">
      {/* Blurred Full-Screen Background - Replaces black bars */}
      <img 
        src="/main-menu-bg.png" 
        className="absolute inset-0 w-full h-full object-cover blur-[40px] opacity-60 scale-110 pointer-events-none" 
        alt=""
      />

      {/* Main Container - Letterboxed to 16:9 for perfect fit */}
      <div className="relative w-full h-full max-w-[calc(100vh*16/9)] aspect-video shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-4 md:p-8">
        
        {/* Crisp Background Image Layer */}
        <img 
          src="/main-menu-bg.png" 
          alt="Main Menu Background" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Character Creator Form Container */}
        <div className="relative z-10 w-full max-w-5xl h-full max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left pane: Immersive Lore / Preview */}
          <div className="md:w-5/12 bg-[#0B3D91] text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
            {/* Subtle paper patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/50 via-blue-900 to-[#0A1A3A] opacity-90 z-0"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-8 h-8 text-[#F4B400] animate-spin-slow" />
                  <span className="font-headline-lg text-xl font-bold tracking-tight text-[#FDF6E3]">GRAND VOYAGE</span>
                </div>
                <h1 className="font-headline-lg text-2xl font-bold mb-4 text-white leading-tight">
                  Commencer le Grand Voyage Francophone
                </h1>
                <p className="text-blue-100/90 text-sm leading-relaxed mb-6">
                  Vous incarnez un diplomate, un <strong>Ambassadeur de l'Éducation et de la Paix</strong> nommé par l'Organisation Internationale de la Francophonie (OIF). Votre mission est de voyager à travers 10 pays magnifiques, d'aider les populations locales à surmonter les défis réels, et d'inscrire votre nom dans l'histoire d'or du voyage !
                </p>
              </div>

              {/* Prestige Passport Preview */}
              <div className="mt-auto">
                <div className="bg-[#0A1A3A]/40 p-4 rounded-xl border border-blue-400/20 backdrop-blur-sm shadow-inner mb-4">
                  <h3 className="text-[10px] uppercase tracking-widest text-[#F4B400] font-black mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Aperçu du Passeport Diplomatique
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F4B400] bg-white/10 shrink-0">
                      <img src={selectedAvatar} alt="Ambassador preview" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-headline-md text-[#FDF6E3] text-base font-bold truncate">
                        {name || "Votre Nom"}
                      </p>
                      <p className="text-[#F4B400] text-[10px] font-black uppercase tracking-wider mt-0.5 truncate">
                        {selectedTitle}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4B400]/20 border border-[#F4B400]/40 text-[10px] text-[#FDF6E3] font-bold">
                        <span>Visa : 0 / 10 Pays</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-blue-200/70 italic text-center font-semibold">
                  "Le pouvoir de la langue est un pont vers l'harmonie culturelle"
                </div>
              </div>
            </div>
          </div>

          {/* Right pane: Customizer Form (Scrollable) */}
          <form onSubmit={handleSubmit} className="md:w-7/12 p-6 md:p-8 flex flex-col overflow-y-auto bg-[#FDF6E3]/50">
            <div>
              <h2 className="font-headline-lg text-2xl text-[#0B3D91] font-bold mb-6 flex items-center gap-2">
                <Sparkles className="text-[#F4B400] w-6 h-6 animate-pulse" /> Création du Passeport Diplomatique
              </h2>

              {/* Part 1: Diplomat name */}
              <div className="mb-6">
                <label className="block text-[#4A3B2C] text-sm font-bold mb-2 flex items-center gap-1.5">
                  <User className="text-[#0B3D91] w-4 h-4" /> Nom de l'Ambassadeur :
                </label>
                <input
                  type="text"
                  required
                  maxLength={25}
                  placeholder="Saisissez votre nom diplomatique... (ex: Jean)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#D4C3A3] bg-white outline-none focus:ring-4 focus:ring-[#0B3D91]/20 focus:border-[#0B3D91] transition-all text-[#4A3B2C] font-semibold"
                />
              </div>

              {/* Part 2: Choose avatars */}
              <div className="mb-6">
                <span className="block text-[#4A3B2C] text-sm font-bold mb-2">Choisissez votre avatar :</span>
                <div className="grid grid-cols-2 gap-4">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => { setSelectedAvatar(av.url); setSelectedAvatarId(av.id); }}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-md ${
                        selectedAvatar === av.url ? "border-[#F4B400] ring-4 ring-[#F4B400]/20" : "border-transparent opacity-80 hover:opacity-100 hover:border-[#0B3D91]/50"
                      }`}
                    >
                      <div className="w-full aspect-[4/5] bg-slate-100">
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover object-top" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Part 3: Choose Title */}
              <div className="mb-6">
                <span className="block text-[#4A3B2C] text-sm font-bold mb-2">Choisissez votre domaine diplomatique :</span>
                <div className="space-y-3">
                  {DIPLOMATIC_TITLES.map((t) => (
                    <label
                      key={t.fr}
                      onClick={() => setSelectedTitle(t.fr)}
                      className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm flex items-start gap-3 ${
                        selectedTitle === t.fr ? "border-[#0B3D91] bg-[#0B3D91]/5" : "border-[#D4C3A3] bg-white hover:border-[#0B3D91]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="diplomatic_title"
                        checked={selectedTitle === t.fr}
                        onChange={() => setSelectedTitle(t.fr)}
                        className="mt-1 text-[#0B3D91] focus:ring-[#0B3D91]"
                      />
                      <div>
                        <p className="font-headline-md text-sm font-bold text-[#0B3D91] mb-1">{t.fr}</p>
                        <p className="text-[11px] text-[#4A3B2C]/80 font-medium leading-tight">{t.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Part 4: Choose passport color theme */}
              <div className="mb-6">
                <span className="block text-[#4A3B2C] text-sm font-bold mb-2">Couverture du Passeport :</span>
                <div className="flex gap-3">
                  {PASSPORT_COVERS.map((cov) => (
                    <button
                      key={cov.name}
                      type="button"
                      onClick={() => setPassportColor(cov.name)}
                      className={`flex-1 p-2 rounded-xl border-2 text-[10px] font-bold transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                        passportColor === cov.name
                          ? "border-[#F4B400] ring-4 ring-[#F4B400]/20 bg-white text-[#0B3D91] shadow-sm"
                          : "border-[#D4C3A3] bg-white/50 text-[#4A3B2C]/60 hover:bg-white"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full shadow-inner ${cov.color.split(" ")[0]}`}></div>
                      <span>{cov.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Login status message */}
            {loginMsg && (
              <div className={`mt-auto mb-4 px-4 py-3 rounded-xl text-sm font-bold text-center animate-pulse shadow-sm ${
                loginMsg.isNew ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}>
                {loginMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-auto w-full bg-[#0B3D91] text-[#FDF6E3] font-bold py-4 px-6 rounded-xl hover:bg-[#1A52B8] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-70 disabled:cursor-not-allowed border-2 border-[#F4B400]/20 hover:border-[#F4B400]"
            >
              {isLoading ? (
                <><Globe className="w-5 h-5 animate-spin text-[#F4B400]" /> Connexion en cours...</>
              ) : (
                <><Globe className="w-5 h-5 animate-spin-slow text-[#F4B400]" /> Obtenir le Passeport & Commencer le Voyage</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
