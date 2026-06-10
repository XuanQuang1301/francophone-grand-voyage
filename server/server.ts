import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { users, userProgress } from "../db/schema";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://postgres:13012005@localhost:5432/grand_voyage";
const client = postgres(connectionString);
const db = drizzle(client);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // ── USER ROUTES ──────────────────────────────────────────────────────────────

  /**
   * POST /api/users/login
   * Body: { nickname: string, avatarId?: string }
   *
   * Nếu nickname đã tồn tại → trả về user cũ (cập nhật lastPlayedAt)
   * Nếu nickname mới → tạo mới
   */
  app.post("/api/users/login", async (req, res) => {
    try {
      const { nickname, avatarId = "default_avatar" } = req.body;

      if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
        return res.status(400).json({ error: "Nickname không hợp lệ" });
      }

      const trimmed = nickname.trim().substring(0, 50);

      // Kiểm tra user đã tồn tại chưa
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.nickname, trimmed))
        .limit(1);

      if (existing.length > 0) {
        // User cũ: cập nhật lastPlayedAt
        const updated = await db
          .update(users)
          .set({ lastPlayedAt: new Date(), avatarId })
          .where(eq(users.nickname, trimmed))
          .returning();

        console.log(`[DB] User existing login: "${trimmed}" (id=${updated[0].id})`);
        return res.json({ user: updated[0], isNewUser: false });
      }

      // User mới: tạo mới
      const created = await db
        .insert(users)
        .values({ nickname: trimmed, avatarId })
        .returning();

      console.log(`[DB] New user created: "${trimmed}" (id=${created[0].id})`);
      return res.json({ user: created[0], isNewUser: true });

    } catch (error: any) {
      console.error("[DB] Login error:", error);
      res.status(500).json({ error: "Lỗi server khi đăng nhập" });
    }
  });

  /**
   * GET /api/users/:nickname
   * Trả về thông tin user theo nickname (kiểm tra tồn tại)
   */
  app.get("/api/users/:nickname", async (req, res) => {
    try {
      const { nickname } = req.params;
      const found = await db
        .select()
        .from(users)
        .where(eq(users.nickname, nickname))
        .limit(1);

      if (found.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy người dùng" });
      }

      return res.json({ user: found[0] });
    } catch (error: any) {
      console.error("[DB] Get user error:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  /**
   * GET /api/users/:userId/progress
   * Lấy tiến trình (stamps) của một user
   */
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "User ID không hợp lệ" });
      }

      const progress = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));

      return res.json({ progress });
    } catch (error: any) {
      console.error("[DB] Get progress error:", error);
      res.status(500).json({ error: "Lỗi khi lấy tiến trình" });
    }
  });

  /**
   * POST /api/users/:userId/progress
   * Lưu hoặc cập nhật một chặng đã hoàn thành
   * Body: { countryCode: string, score: number }
   */
  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const { countryCode, score = 0 } = req.body;

      if (isNaN(userId) || !countryCode) {
        return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
      }

      // Check if progress already exists for this country
      const existing = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId)); // Simplification: we'll check manually

      const existingCountry = existing.find(p => p.countryCode === countryCode);

      if (existingCountry) {
        // Update score if higher, update timestamp
        const newScore = Math.max(existingCountry.score || 0, score);
        const updated = await db
          .update(userProgress)
          .set({ score: newScore, isCompleted: true, completedAt: new Date() })
          .where(eq(userProgress.id, existingCountry.id))
          .returning();
        return res.json({ progress: updated[0] });
      } else {
        // Insert new progress
        const created = await db
          .insert(userProgress)
          .values({ userId, countryCode, score, isCompleted: true })
          .returning();
        return res.json({ progress: created[0] });
      }
    } catch (error: any) {
      console.error("[DB] Save progress error:", error);
      res.status(500).json({ error: "Lỗi khi lưu tiến trình" });
    }
  });

  // ── GEMINI ROUTES ────────────────────────────────────────────────────────────

  // 1. API Route: Handle direct diplomatic communication chatbot
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { countryName, userMessage, history } = req.body;

      const contents = history
        ? history.map((h: any) => ({
            role: h.role,
            parts: [{ text: h.text }],
          }))
        : [];

      contents.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: `You are Capitaine Lumière, a brilliant and charismatic virtual guide (AI hologram) and French cultural attaché from the game "Passeport Francophone". 
          You are speaking with a "Travel Ambassador" who is exploring OIF (Organisation internationale de la Francophonie) countries globally.
          You MUST write all your answers in high-quality French. (Optional: they may ask you for quick Vietnamese translations, which you can provide in parentheses, but prioritize elegant French). 
          Keep it extremely encouraging, educational, fun, and concise (under 80 words), perfect for French learners. 
          Your tone is lively, warm, and highly adventurous! Use fun French expressions like "Fantastique !", "Magnifique !", "En route !".
          Current focus country under exploration: ${countryName}.`,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini chatbot error:", error);
      res.status(500).json({ error: error.message || "Failed to generate text" });
    }
  });

  // 2. API Route: Generate dynamic country scenario
  app.post("/api/gemini/generate-scenario", async (req, res) => {
    try {
      const { countryName } = req.body;

      const prompt = `Génère un défi culturel ou environnemental amusant en français pour le pays: ${countryName}. 
      Le défi doit consister en une situation problématique locale sympathique (non tragique, non politique, axée sur la culture, la langue française solide ou le patrimoine de la francophonie) et proposer une question à choix multiples (QCM) amusante en français pour tester l'Ambassadeur. 
      Donne le résultat directement sous format JSON brut (ne mets pas de balises markdown de type \`\`\`json, commence directement par l'accolade) structuré comme ceci:
      {
        "context": "Short bối cảnh en français",
        "situation": "Description courte de la situation ou du défi en français (môi trường hoặc văn hóa local)",
        "narratorIntro": "Lời dẫn chuyện của Capitaine Lumière cổ vũ tinh thần en français",
        "question": "La question posée par Capitaine Lumière à l'ambassadeur en français",
        "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
        "correctIndex": 0,
        "explanation": "Lời giải thích giáo dục chiêm nghiệm bằng tiếng Việt xen lẫn tiếng Pháp sau khi hoàn thành chọn đáp án"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("Gemini scenario generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate dynamic template scenario" });
    }
  });

  // 3. Vite middleware or static file serving
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with active Vite middlewares...");
    const clientRoot = process.cwd();
    const vite = await createViteServer({
      root: clientRoot,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static /dist directory...");
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`DB connected to: ${connectionString.replace(/:[^:@]+@/, ":***@")}`);
  });
}

startServer();
