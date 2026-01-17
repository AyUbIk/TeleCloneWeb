import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import { insertUserSchema, insertChatSchema, messages, chats, users } from "@shared/schema";
import { db } from "./db";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

async function seedDatabase() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      console.log("Seeding database...");
      
      // Create current user
      await storage.createUser({
        id: "me",
        name: "Me",
        about: "Using TeleClone Web",
        phoneNumber: "+1234567890",
        status: "online"
      });

      // Create a bot user
      const bot = await storage.createUser({
        id: "gemini",
        name: "Gemini AI",
        about: "I'm a smart AI bot",
        status: "online",
        avatar: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg"
      });

      // Create a sample chat - use storage if possible or ensure ID uniqueness
      const chat = await db.insert(chats).values({
        id: "chat-1",
        userId: bot.id,
        lastMessage: "Hello! I am Gemini. How can I help you?",
        lastMessageTime: Math.floor(Date.now() / 1000),
        unreadCount: 1,
        lastActivity: Math.floor(Date.now() / 1000),
        isPinned: false,
        isMuted: false
      }).returning();

      if (chat.length > 0) {
        await db.insert(messages).values({
          id: "msg-1",
          chatId: chat[0].id,
          senderId: bot.id,
          text: "Hello! I am Gemini. How can I help you?",
          timestamp: Math.floor(Date.now() / 1000),
          status: "read",
          isSelf: false,
          isVoice: false,
          isEdited: false,
          isSticker: false,
          isCall: false
        });
      }

      console.log("Database seeded!");
    }
  } catch (error) {
    if ((error as any).code === '23505') {
      console.log("Database already seeded (duplicate key skipped).");
    } else {
      console.error("Seeding Error:", error);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed DB on startup
  seedDatabase().catch(console.error);

  // Get User Profile
  app.get("/api/me", async (req, res) => {
    // For this clone, we just return the first user or create one
    // In a real app, this would be auth-protected
    const allUsers = await db.select().from(users).limit(1);
    if (allUsers.length > 0) {
      res.json(allUsers[0]);
    } else {
      const newUser = await storage.createUser({ 
        id: "me",
        name: "User", 
        status: "online" 
      });
      res.json(newUser);
    }
  });

  // Gemini Proxy Route
  app.post(api.gemini.chat.path, async (req, res) => {
    try {
      const { prompt, history } = api.gemini.chat.input.parse(req.body);

      // Convert history to Gemini format
      const contents = (history || []).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }]
      }));

      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const systemInstruction = "You are a witty, helpful friend on Telegram. Keep responses short (max 2-3 sentences), use modern slang/emojis, and be informal.";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      res.json({ response: text });

    } catch (err) {
      console.error("Gemini Error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
           message: err.errors[0].message
        });
      }
      res.status(500).json({ 
        message: "AI service unavailable", 
        response: "Sorry, I can't connect right now! 🤖" 
      });
    }
  });

  return httpServer;
}
