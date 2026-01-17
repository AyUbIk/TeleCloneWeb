import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/Avatar";
import { MessageBubble } from "@/components/MessageBubble";
import { ChatInput } from "@/components/ChatInput";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { formatChatDate, generateId } from "@/lib/utils";
import { useGeminiChat } from "@/hooks/use-gemini";
import { Message, User } from "@shared/schema";
import { ArrowLeft, MoreVertical, Search, Phone, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatScreenProps {
  chatId: string;
  user: User; // The other user
  currentUser: User;
  onBack: () => void;
  isMobile: boolean;
}

export function ChatScreen({ chatId, user, currentUser, onBack, isMobile }: ChatScreenProps) {
  // --- STATE ---
  const [messagesMap, setMessagesMap] = useLocalStorage<Record<string, Message[]>>("teleclone_messages_map_v4", {});
  const messages = messagesMap[chatId] || [];
  
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const geminiMutation = useGeminiChat();

  // --- ACTIONS ---
  
  const addMessage = (msg: Message) => {
    setMessagesMap((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), msg],
    }));
  };

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: generateId(),
      senderId: currentUser.id,
      text,
      timestamp: Date.now(),
      status: 'sent',
      isSelf: true,
      chatId,
      isVoice: false,
      isEdited: false,
      isSticker: false,
      isCall: false,
      image: null,
      voiceUrl: null,
      mediaData: null,
      voiceDuration: null,
      replyToId: null,
      forwardedFrom: null
    };
    
    addMessage(newMessage);

    // If chatting with Gemini, trigger AI response
    if (chatId === 'gemini') {
      setIsTyping(true);
      try {
        const history = messages.map(m => ({
          role: m.isSelf ? "user" as const : "model" as const,
          parts: m.text || ""
        }));
        
        const { response } = await geminiMutation.mutateAsync({
          prompt: text,
          history: history.slice(-10) // Keep context manageable
        });

        const botMsg: Message = {
          id: generateId(),
          senderId: 'gemini',
          text: response,
          timestamp: Date.now(),
          status: 'read',
          isSelf: false,
          chatId,
          isVoice: false,
          isEdited: false,
          isSticker: false,
          isCall: false,
          image: null,
          voiceUrl: null,
          mediaData: null,
          voiceDuration: null,
          replyToId: null,
          forwardedFrom: null
        };
        addMessage(botMsg);
      } catch (err) {
        console.error("Gemini Error:", err);
      } finally {
        setIsTyping(false);
      }
    } else {
        // Mock reply for demo purposes if not gemini
        if (messages.length % 3 === 0) {
             setTimeout(() => {
                 setIsTyping(true);
                 setTimeout(() => {
                    const replyMsg: Message = {
                        id: generateId(),
                        senderId: user.id,
                        text: "That sounds interesting! Tell me more about it.",
                        timestamp: Date.now(),
                        status: 'read',
                        isSelf: false,
                        chatId,
                        isVoice: false,
                        isEdited: false,
                        isSticker: false,
                        isCall: false,
                        image: null,
                        voiceUrl: null,
                        mediaData: null,
                        voiceDuration: null,
                        replyToId: null,
                        forwardedFrom: null
                    };
                    addMessage(replyMsg);
                    setIsTyping(false);
                 }, 2000);
             }, 1000);
        }
    }
  };

  const handleSendVoice = (blob: Blob) => {
    // In a real app, upload blob to server/S3, get URL.
    // Here we save a dummy message
    const newMessage: Message = {
      id: generateId(),
      senderId: currentUser.id,
      text: "",
      isVoice: true,
      voiceDuration: 12, // Mock
      timestamp: Date.now(),
      status: 'sent',
      isSelf: true,
      chatId,
      isEdited: false,
      isSticker: false,
      isCall: false,
      image: null,
      voiceUrl: null,
      mediaData: null,
      replyToId: null,
      forwardedFrom: null
    };
    addMessage(newMessage);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isTyping]);


  // --- RENDER HELPERS ---
  
  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = formatChatDate(msg.timestamp);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, msgs: [msg] });
    }
  });

  const [showProfile, setShowProfile] = useState(false);
  
  return (
    <div className="flex h-full bg-[hsl(var(--tg-bg))] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 chat-bg-pattern opacity-40 pointer-events-none" />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Header */}
        <div className="h-14 sm:h-16 bg-[hsl(var(--tg-sidebar-bg))] border-b border-[hsl(var(--tg-border))] flex items-center px-4 justify-between z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1" onClick={() => setShowProfile(!showProfile)}>
            {isMobile && (
              <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-1 -ml-2 mr-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full shrink-0">
                <ArrowLeft className="w-6 h-6 text-[hsl(var(--tg-text-secondary))]" />
              </button>
            )}
            <Avatar user={user} size="sm" online={user.status === 'online'} className="shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-sm sm:text-base leading-tight text-[hsl(var(--tg-text))] truncate block">{user.name}</span>
              <span className="text-xs text-[hsl(var(--tg-text-secondary))] truncate block">
                {isTyping ? <span className="text-[hsl(var(--tg-accent))] animate-pulse">typing...</span> : (user.status || "last seen recently")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-4 text-[hsl(var(--tg-text-secondary))] shrink-0">
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
               <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full" onClick={() => setShowProfile(!showProfile)}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 custom-scrollbar z-10 space-y-2"
        >
          {groupedMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--tg-text-secondary))] opacity-60">
                  <div className="bg-[hsl(var(--tg-sidebar-bg))] p-4 rounded-full mb-4 shadow-sm">
                     <UserIcon className="w-12 h-12" />
                  </div>
                  <p>No messages here yet...</p>
                  <p className="text-sm">Send a message to start the chat!</p>
              </div>
          )}

          {groupedMessages.map((group, gIndex) => (
            <div key={group.date} className="flex flex-col">
              {/* Sticky Date Divider */}
              <div className="sticky top-2 z-20 flex justify-center mb-4">
                <span className="bg-black/20 dark:bg-black/40 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  {group.date}
                </span>
              </div>

              {/* Messages in this date group */}
              {group.msgs.map((msg, mIndex) => {
                const prev = group.msgs[mIndex - 1];
                const next = group.msgs[mIndex + 1];
                
                // Grouping Logic
                const isFirstInGroup = !prev || prev.senderId !== msg.senderId;
                const isLastInGroup = !next || next.senderId !== msg.senderId;

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Input */}
        <ChatInput onSendMessage={handleSendMessage} onSendVoice={handleSendVoice} />
      </div>

      {/* Profile Drawer */}
      <AnimatePresence>
        {showProfile && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setShowProfile(false)}
              />
            )}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "w-[320px] h-full bg-[hsl(var(--tg-sidebar-bg))] border-l border-[hsl(var(--tg-border))] z-50 flex flex-col shrink-0",
                isMobile ? "fixed right-0 top-0 shadow-2xl" : "relative"
              )}
            >
              <div className="h-16 flex items-center px-4 border-b border-[hsl(var(--tg-border))] shrink-0">
                <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full mr-2">
                  <ArrowLeft className="w-5 h-5 text-[hsl(var(--tg-text-secondary))]" />
                </button>
                <span className="font-semibold">User Info</span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 flex flex-col items-center text-center">
                  <Avatar user={user} size="lg" className="mb-4 w-32 h-32 text-4xl" />
                  <h2 className="text-xl font-bold text-[hsl(var(--tg-text))]">{user.name}</h2>
                  <p className="text-[hsl(var(--tg-text-secondary))] text-sm">{user.status || 'last seen recently'}</p>
                </div>

                <div className="px-6 py-4 space-y-6">
                  {user.phoneNumber && (
                    <div className="flex items-center gap-6">
                      <Phone className="w-6 h-6 text-[hsl(var(--tg-text-secondary))]" />
                      <div className="flex flex-col">
                        <span className="text-sm text-[hsl(var(--tg-text))]">{user.phoneNumber}</span>
                        <span className="text-xs text-[hsl(var(--tg-text-secondary))]">Mobile</span>
                      </div>
                    </div>
                  )}

                  {user.about && (
                    <div className="flex items-center gap-6">
                      <Search className="w-6 h-6 text-[hsl(var(--tg-text-secondary))]" />
                      <div className="flex flex-col">
                        <span className="text-sm text-[hsl(var(--tg-text))]">{user.about}</span>
                        <span className="text-xs text-[hsl(var(--tg-text-secondary))]">Bio</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[hsl(var(--tg-border))] mt-4">
                  <div className="flex border-b border-[hsl(var(--tg-border))]">
                    {['Media', 'Files', 'Links'].map((tab) => (
                      <button key={tab} className="flex-1 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b-2 border-transparent hover:border-[hsl(var(--tg-accent))] text-[hsl(var(--tg-text-secondary))] hover:text-[hsl(var(--tg-accent))]">
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="p-8 text-center text-[hsl(var(--tg-text-secondary))] opacity-60 italic text-sm">
                    No shared content yet
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

