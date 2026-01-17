import { formatMessageTime, cn } from "@/lib/utils";
import { Message } from "@shared/schema";
import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export function MessageBubble({ message, isFirstInGroup, isLastInGroup }: MessageBubbleProps) {
  const isSelf = message.isSelf;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-1",
        isSelf ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[75%] px-3 py-1.5 shadow-sm text-[15px] leading-snug break-words",
          // Bubble Colors
          isSelf 
            ? "bg-[hsl(var(--tg-bubble-self))] text-[hsl(var(--tg-text))]" 
            : "bg-[hsl(var(--tg-bubble-other))] text-[hsl(var(--tg-text))]",
          // Border Radius Logic
          "rounded-2xl",
          isSelf && isLastInGroup && "rounded-br-none",
          !isSelf && isLastInGroup && "rounded-bl-none",
          // Spacing for groups
          isLastInGroup ? "mb-2" : "mb-0.5"
        )}
      >
        {/* Reply Context (if any) */}
        {message.replyToId && (
            <div className="mb-1 pl-2 border-l-2 border-[hsl(var(--tg-accent))] opacity-75 text-sm cursor-pointer hover:opacity-100">
                <span className="text-[hsl(var(--tg-accent))] font-medium block text-xs">Reply to Message</span>
                <span className="truncate block opacity-70">Click to view original</span>
            </div>
        )}

        {/* Media (Image) */}
        {message.image && (
          <div className="mb-1 rounded-lg overflow-hidden cursor-pointer">
            <img src={message.image} alt="Attachment" className="max-w-full h-auto object-cover" />
          </div>
        )}
        
        {/* Media (Voice) */}
        {message.isVoice && (
          <div className="flex items-center gap-2 py-1 min-w-[160px]">
             <div className="w-8 h-8 rounded-full bg-[hsl(var(--tg-accent))] flex items-center justify-center cursor-pointer text-white">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
             </div>
             <div className="flex-1">
                 <div className="h-1 bg-black/10 dark:bg-white/10 rounded-full w-full mb-1">
                     <div className="h-full w-1/3 bg-[hsl(var(--tg-accent))] rounded-full"></div>
                 </div>
                 <div className="text-xs opacity-70">0:12</div>
             </div>
          </div>
        )}

        {/* Text Content */}
        {message.text && (
          <span className="whitespace-pre-wrap">{message.text}</span>
        )}
        
        {/* Metadata: Time & Status */}
        <div className="float-right ml-3 mt-1.5 flex items-center gap-1 select-none opacity-60 text-[11px]">
          {message.isEdited && <span>edited</span>}
          <span>{formatMessageTime(message.timestamp)}</span>
          {isSelf && (
            <span className={cn("ml-0.5", message.status === 'read' ? "text-[hsl(var(--tg-accent))]" : "")}>
              {message.status === 'sending' && <span className="animate-pulse">🕒</span>}
              {message.status === 'sent' && <Check className="w-3.5 h-3.5" />}
              {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-[hsl(var(--tg-accent))]" />}
            </span>
          )}
        </div>

        {/* Tail SVG */}
        {isLastInGroup && (
          <svg
            className={cn(
              "absolute bottom-0 w-[9px] h-[16px]",
              isSelf ? "-right-[8px] fill-[hsl(var(--tg-bubble-self))]" : "-left-[8px] fill-[hsl(var(--tg-bubble-other))]"
            )}
            viewBox="0 0 11 20"
            style={{ transform: isSelf ? "" : "scaleX(-1)" }}
          >
            <path d="M0 20C2.5 16 7 17 7 11V0h4v20H0z" />
          </svg>
        )}
      </div>
    </motion.div>
  );
}
