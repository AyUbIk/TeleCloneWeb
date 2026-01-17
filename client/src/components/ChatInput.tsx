import { useState, useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Mic, Send, Paperclip, Smile } from "lucide-react";
import { RippleButton } from "./RippleButton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendVoice: (blob: Blob) => void;
  isTyping?: boolean;
}

export function ChatInput({ onSendMessage, onSendVoice }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle text submit
  const handleSubmit = () => {
    if (!text.trim()) return;
    try {
      onSendMessage(text);
      setText("");
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Recording Logic (Simulation)
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    // In a real app, we'd get the blob from MediaRecorder
    // Here we just simulate passing a blob
    const dummyBlob = new Blob([""], { type: "audio/ogg" }); 
    onSendVoice(dummyBlob); 
  };

  return (
    <div className="p-2 sm:p-4 bg-[hsl(var(--tg-sidebar-bg))] border-t border-[hsl(var(--tg-border))] flex items-end gap-2 relative z-20">
      <RippleButton variant="icon" className="shrink-0 mb-1" onClick={() => console.log('Attach clicked')}>
        <Paperclip className="w-6 h-6" />
      </RippleButton>

      <div className="flex-1 relative bg-[hsl(var(--tg-bg))] dark:bg-black/20 rounded-2xl flex items-center">
        {!isRecording ? (
          <TextareaAutosize
            minRows={1}
            maxRows={6}
            placeholder="Write a message..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-[hsl(var(--tg-text))] placeholder-gray-400 custom-scrollbar"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="flex-1 flex items-center gap-3 px-4 py-3 h-[48px]">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
            <span className="text-[hsl(var(--tg-text))] font-mono">
              {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
            </span>
            <span className="text-[hsl(var(--tg-text-secondary))] text-sm ml-auto">
              Release to send
            </span>
          </div>
        )}
        
        {!isRecording && (
          <button 
            type="button"
            className="p-2 mr-1 text-[hsl(var(--tg-text-secondary))] hover:text-[hsl(var(--tg-accent))] transition-colors"
            onClick={() => console.log('Emoji clicked')}
          >
            <Smile className="w-6 h-6" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {text.length > 0 ? (
          <motion.div
            key="send"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
          >
            <RippleButton 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[hsl(var(--tg-accent))] text-white hover:bg-[hsl(var(--tg-accent-hover))]"
              onClick={handleSubmit}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </RippleButton>
          </motion.div>
        ) : (
          <motion.div
            key="mic"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -90 }}
          >
            <RippleButton 
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isRecording 
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" 
                  : "bg-[hsl(var(--tg-sidebar-bg))] hover:bg-black/5 dark:hover:bg-white/5 text-[hsl(var(--tg-text-secondary))]"
              )}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
            >
              <Mic className="w-6 h-6" />
            </RippleButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
