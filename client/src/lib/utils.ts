import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isSameYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate deterministic color for avatar based on ID
export function getAvatarColor(id: string) {
  const colors = [
    "from-red-500 to-orange-500",
    "from-orange-500 to-yellow-500",
    "from-yellow-500 to-lime-500",
    "from-lime-500 to-green-500",
    "from-green-500 to-teal-500",
    "from-teal-500 to-cyan-500",
    "from-cyan-500 to-blue-500",
    "from-blue-500 to-indigo-500",
    "from-indigo-500 to-purple-500",
    "from-purple-500 to-pink-500",
    "from-pink-500 to-rose-500",
  ];
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export function formatMessageTime(timestamp: number) {
  return format(new Date(timestamp), "HH:mm");
}

export function formatChatDate(timestamp: number) {
  const date = new Date(timestamp);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  if (isSameYear(date, new Date())) return format(date, "MMM d");
  return format(date, "d.MM.yyyy");
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
