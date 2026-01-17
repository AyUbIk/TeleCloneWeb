import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tables
export const users = pgTable("users", {
  id: text("id").primaryKey(), // UUID or PeerID
  name: text("name").notNull(),
  avatar: text("avatar"), // Base64 or URL
  status: text("status").default("offline"), // 'online' | 'offline'
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  about: text("about"),
  phoneNumber: text("phone_number"),
});

export const messages = pgTable("app_messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  text: text("text"),
  image: text("image"),
  isVoice: boolean("is_voice").default(false),
  voiceUrl: text("voice_url"),
  mediaData: text("media_data"), // Base64
  voiceDuration: integer("voice_duration"),
  timestamp: integer("timestamp").notNull(), // Unix timestamp
  status: text("status").default("sent"), // 'sending' | 'sent' | 'read'
  isSelf: boolean("is_self").default(false),
  replyToId: text("reply_to_id"),
  isEdited: boolean("is_edited").default(false),
  forwardedFrom: text("forwarded_from"),
  isSticker: boolean("is_sticker").default(false),
  isCall: boolean("is_call").default(false),
  chatId: text("chat_id").notNull(),
});

export const chats = pgTable("app_chats", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // The other user
  lastMessage: text("last_message"),
  lastMessageTime: integer("last_message_time"),
  lastActivity: integer("last_activity"),
  unreadCount: integer("unread_count").default(0),
  pinnedMessageId: text("pinned_message_id"),
  isPinned: boolean("is_pinned").default(false),
  isMuted: boolean("is_muted").default(false),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertMessageSchema = createInsertSchema(messages);
export const insertChatSchema = createInsertSchema(chats);

// Types - Explicitly defined to avoid build issues with inference
export interface User {
  id: string;
  name: string;
  avatar: string | null;
  status: string | null;
  lastSeen: Date | null;
  about: string | null;
  phoneNumber: string | null;
}

export type InsertUser = z.infer<typeof insertUserSchema>;

export interface Message {
  id: string;
  senderId: string;
  text: string | null;
  image: string | null;
  isVoice: boolean | null;
  voiceUrl: string | null;
  mediaData: string | null;
  voiceDuration: number | null;
  timestamp: number;
  status: string | null;
  isSelf: boolean | null;
  replyToId: string | null;
  isEdited: boolean | null;
  forwardedFrom: string | null;
  isSticker: boolean | null;
  isCall: boolean | null;
  chatId: string;
}

export type InsertMessage = z.infer<typeof insertMessageSchema>;

export interface Chat {
  id: string;
  userId: string;
  lastMessage: string | null;
  lastMessageTime: number | null;
  lastActivity: number | null;
  unreadCount: number | null;
  pinnedMessageId: string | null;
  isPinned: boolean | null;
  isMuted: boolean | null;
  user?: User;
}

export type InsertChat = z.infer<typeof insertChatSchema>;

// API Request/Response Types
export interface GeminiRequest {
  prompt: string;
  history?: { role: "user" | "model"; parts: string }[];
}

export interface GeminiResponse {
  response: string;
}
