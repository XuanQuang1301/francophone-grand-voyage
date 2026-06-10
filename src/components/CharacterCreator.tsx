import React, { useState } from "react";
import { PlayerCharacter } from "../types";
import { Sparkles, Globe, User, BookOpen } from "lucide-react";

interface CharacterCreatorProps {
  onComplete: (character: PlayerCharacter & { passportColor: string; userId: number }) => void;
}

const PRESET_AVATARS = [
  {
    id: "lucas",
    name: "Lucas (Nam - 16 tuổi)",
    desc: "Năng động, tò mò và thích khám phá. Luôn mang theo la bàn và sổ tay hành trình.",
    url: "/Lucas.png",
  },
  {
    id: "chiloe",
    name: "Chiloe (Nữ - 17 tuổi)",
    desc: "Yêu nhiếp ảnh và văn hóa. Ghi lại mọi khoảnh khắc đẹp trong chuyến đi.",
    url: "/Chiloe.png",
  },
];

const DIPLOMATIC_TITLES = [
  {
    fr: "Ambassadeur Culturel",
    vi: "Đại sứ Văn hóa Pháp ngữ",
    desc: "Đại diện chính thức thúc đẩy cầu nối kiến thức và phát triển.",
  },
  {
    fr: "Attaché d'Espoir et d'Éducation",
    vi: "Tự viên Giáo dục & Hy vọng",
    desc: "Hành động thắp sáng vùng cao bằng con chữ và học bổng học đường.",
  },
  {
    fr: "Gardien du Patrimoine",
    vi: "Người bảo hộ Di sản Xanh",
    desc: "Chuyên trách cải tạo tự nhiên, sinh thái và gìn giữ văn hiến.",
  },
];

const PASSPORT_COVERS = [
  { color: "bg-primary text-white border-primary-container", label: "Bleu Souverain (Xanh OIF cực chất)", name: "blue" },
  { color: "bg-secondary text-white border-red-800", label: "Rouge Impérial (Đỏ Châu Âu cổ điển)", name: "red" },
  { color: "bg-amber-900 text-amber-100 border-amber-950", label: "Or Antique (Vàng hoàng thổ ấm áp)", name: "gold" },
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
          ? `🎉 Chào mừng Đại sứ mới ${user.nickname}!`
          : `👋 Chào mừng trở lại, ${user.nickname}!`,
        isNew: isNewUser,
      });

      // Ngắn delay để user thấy thông báo rồi vào game
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
      // Fallback: vẫn cho vào game nếu DB lỗi
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
    <div className="min-h-screen bg-[#F4F1E8] flex items-center justify-center p-4 relative overflow-hidden font-body-md">
      {/* Background Decorative Maps Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <img
          alt="Vintage Map background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIb6KspELutfXiNZtQO-mD8-TTT_hy_M0oS92umbdRNEHPeQ8yNV4LGZkp0GK3JxYYvIwGjdfAzlwBqk1uNORcH_sdL3NMEl4QLoaVSks2M1dfHuVRd1eub9nC6Grc0OCZYYUr-oGCGtqcQ-vHzzhY5GElnie-9EKjS92_hTmLqIpAAfbw-w2KzewUsYESd_15d9W6TLAwU-kpTyESBMzL94L7pYUP8eEfE94de7ASGIo22DlSQZQCRPT0msMtKyqsiAzT-1wY2eA"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        {/* Left pane: Immersive Lore / Preview */}
        <div className="md:w-5/12 bg-primary text-white p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle paper patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container via-primary to-blue-950 opacity-90 z-0"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-8 h-8 text-secondary-fixed animate-spin-slow" />
              <span className="font-display-lg text-xl font-bold tracking-tight text-amber-200">GRAND VOYAGE</span>
            </div>
            <h1 className="font-headline-lg text-2xl font-bold mb-4 text-white leading-tight">
              Bắt Đầu Hành Trình Pháp Ngữ Kỳ Diệu
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Bạn sắm vai một nhà ngoại giao, một <strong>Đại sứ du học & Hòa bình</strong> tinh tế được bổ nhiệm bởi Hiệp hội Đối ngoại OIF Quốc tế. Nhiệm vụ của bạn là dấn thân qua 10 chặng đất nước kỳ vĩ, giúp đỡ dân bản xứ vượt qua các nghịch cảnh thực tế, và ghi tên mình vào trang sử vàng du hành thương mến!
            </p>
          </div>

          {/* Prestige Passport Preview */}
          <div className="relative z-10 bg-blue-950/40 p-4 rounded-xl border border-blue-400/20 backdrop-blur-sm shadow-inner">
            <h3 className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-3 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Bản xem trước Hộ chiếu du lịch
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-300 bg-white/10 shrink-0">
                <img src={selectedAvatar} alt="Ambassador preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-headline-md text-amber-100 text-base font-bold truncate">
                  {name || "Votre Nom / Tên của bạn"}
                </p>
                <p className="text-secondary-fixed-dim text-xs font-semibold uppercase tracking-wider">
                  {selectedTitle}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-[10px] text-amber-200 font-bold">
                  <span>Visa: 0 / 10 Pays</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-blue-200 italic mt-4 text-center">
            "Sức mạnh ngôn ngữ là nhịp cầu hòa hợp văn hóa"
          </div>
        </div>

        {/* Right pane: Customizer Form */}
        <form onSubmit={handleSubmit} className="md:w-7/12 p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-headline-lg text-2xl text-primary font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-amber-500 w-6 h-6 animate-pulse" /> Thiết Lập Hồ Sơ Đại Sứ
            </h2>

            {/* Part 1: Diplomat name */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1.5">
                <User className="text-primary w-4 h-4" /> Họ và tên Đại sứ:
              </label>
              <input
                type="text"
                required
                maxLength={25}
                placeholder="Nhập tên ngoại giao của bạn... (Ví dụ: Xuan Quang)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-gray-800"
              />
            </div>

            {/* Part 2: Choose avatars */}
            <div className="mb-6">
              <span className="block text-gray-700 text-sm font-bold mb-2">Chọn nhân vật đại diện:</span>
              <div className="grid grid-cols-2 gap-4">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => { setSelectedAvatar(av.url); setSelectedAvatarId(av.id); }}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all text-left flex flex-col hover:bg-gray-50 ${
                      selectedAvatar === av.url ? "border-amber-500 ring-2 ring-amber-400/50 bg-amber-50/40" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="w-full aspect-[4/5] overflow-hidden border-b border-gray-200 bg-slate-100">
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">{av.name}</h4>
                      <p className="text-[11px] sm:text-xs text-gray-500 leading-snug mt-1">{av.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Part 3: Choose Title / Sứ mệnh */}
            <div className="mb-6">
              <span className="block text-gray-700 text-sm font-bold mb-2">Chọn chức danh lĩnh vực đảm nhận:</span>
              <div className="space-y-3">
                {DIPLOMATIC_TITLES.map((t) => (
                  <label
                    key={t.fr}
                    onClick={() => setSelectedTitle(t.fr)}
                    className={`block p-3 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 flex items-start gap-3 ${
                      selectedTitle === t.fr ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="diplomatic_title"
                      checked={selectedTitle === t.fr}
                      onChange={() => setSelectedTitle(t.fr)}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-headline-md text-sm font-bold text-primary">{t.fr}</p>
                      <p className="text-[11px] text-gray-400 font-bold italic mb-1">{t.vi}</p>
                      <p className="text-xs text-gray-600 font-medium leading-tight">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Part 4: Choose passport color theme */}
            <div className="mb-6">
              <span className="block text-gray-700 text-sm font-bold mb-2">Bìa sổ Hộ chiếu (Passport Cover):</span>
              <div className="flex gap-4">
                {PASSPORT_COVERS.map((cov) => (
                  <button
                    key={cov.name}
                    type="button"
                    onClick={() => setPassportColor(cov.name)}
                    className={`flex-1 p-2 rounded-lg border-2 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                      passportColor === cov.name
                        ? "border-amber-500 ring-2 ring-amber-300 bg-gray-50 text-gray-900 shadow-sm"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${cov.color.split(" ")[0]}`}></div>
                    <span className="sr-only sm:not-sr-only text-[10px]">{cov.name.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Login status message */}
          {loginMsg && (
            <div className={`mb-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-center animate-pulse ${
              loginMsg.isNew ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {loginMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary text-white font-bold py-3.5 px-6 rounded-full hover:bg-secondary-container transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Globe className="w-4 h-4 animate-spin text-amber-200" /> Đang kết nối...</>
            ) : (
              <><Globe className="w-4 h-4 animate-spin-slow text-amber-200" /> Nhận Hộ Chiếu & Bắt Đầu Đại Hải Trình</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
