import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Avatar } from "@/components/Avatar";
import { ChatScreen } from "./ChatScreen";
import { RippleButton } from "@/components/RippleButton";
import type { User, Chat } from "@shared/schema";
import { formatChatDate, cn } from "@/lib/utils";
import { Menu, Search, Edit2, Settings, Moon, Sun, Users, Bookmark, Phone, User as UserIcon, Shield, Bell, Lock, Globe, Database, Copy, Check, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import Peer from "peerjs";
import { useToast } from "@/hooks/use-toast";

// --- DUMMY DATA ---
const MY_USER: User = {
  id: "me",
  name: "You",
  avatar: null,
  status: "online",
  about: "Code is poetry.",
  phoneNumber: "+1 234 567 890",
  lastSeen: new Date()
};

const GEMINI_USER: User = {
  id: "gemini",
  name: "Gemini AI",
  status: "online",
  about: "I am a large language model, trained by Google.",
  avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/1024px-Google_Gemini_logo.svg.png",
  lastSeen: new Date(),
  phoneNumber: null
};

const DUMMY_CHATS: Chat[] = [
  { id: "gemini", userId: "gemini", lastMessage: "Hello! How can I help you today?", lastMessageTime: Date.now(), unreadCount: 1, lastActivity: Date.now(), pinnedMessageId: null, isPinned: false, isMuted: false },
  { id: "2", userId: "user2", lastMessage: "Are we still on for tonight?", lastMessageTime: Date.now() - 3600000, unreadCount: 0, lastActivity: Date.now() - 3600000, pinnedMessageId: null, isPinned: false, isMuted: false },
  { id: "3", userId: "user3", lastMessage: "Sent you the file.", lastMessageTime: Date.now() - 86400000, unreadCount: 2, lastActivity: Date.now() - 86400000, pinnedMessageId: null, isPinned: false, isMuted: false },
];

const DUMMY_USERS: Record<string, User> = {
  "gemini": GEMINI_USER,
  "user2": { id: "user2", name: "Alice Smith", status: "online", lastSeen: new Date(), avatar: null, about: null, phoneNumber: null },
  "user3": { id: "user3", name: "Bob Jones", status: "offline", lastSeen: new Date(Date.now() - 3600000), avatar: null, about: null, phoneNumber: null },
};

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chats' | 'settings' | 'contacts' | 'saved'>('chats');
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useLocalStorage("teleclone_theme", true);
  const [peerId, setPeerId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const [contacts, setContacts] = useState<User[]>(Object.values(DUMMY_USERS).filter(u => u.id !== "gemini"));
  const [chats, setChats] = useState<Chat[]>(DUMMY_CHATS);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactId, setNewContactId] = useState("");

  const addContact = () => {
    if (!newContactId.trim()) return;
    
    // Check if user already exists in DUMMY_USERS or contacts
    const existingUser = DUMMY_USERS[newContactId];
    
    const newUser: User = existingUser || {
      id: newContactId,
      name: `User ${newContactId.slice(0, 4)}`,
      status: "offline",
      lastSeen: new Date(),
      avatar: null,
      about: "Added via Peer ID",
      phoneNumber: null
    };

    // Update contacts list if not already there
    if (!contacts.find(c => c.id === newUser.id)) {
      setContacts([...contacts, newUser]);
    }

    // Create a new chat for this contact if it doesn't exist
    if (!chats.find(c => c.userId === newUser.id)) {
      const newChat: Chat = {
        id: `chat-${newUser.id}`,
        userId: newUser.id,
        lastMessage: "No messages yet",
        lastMessageTime: Date.now(),
        unreadCount: 0,
        lastActivity: Date.now(),
        pinnedMessageId: null,
        isPinned: false,
        isMuted: false
      };
      setChats([newChat, ...chats]);
      
      // Also update DUMMY_USERS for lookup consistency in this session
      DUMMY_USERS[newUser.id] = newUser;
      
      // Automatically select the new chat
      setActiveChatId(newChat.id);
      handleViewChange('chats');
    }

    setNewContactId("");
    setShowAddContact(false);
    toast({ title: "Contact Added", description: `Chat with ${newUser.name} is ready.` });
  };

  const handleViewChange = (view: 'chats' | 'settings' | 'contacts' | 'saved') => {
    setActiveView(view);
    setIsDrawerOpen(false);
    if (view !== 'chats') {
      setActiveChatId(null);
    }
  };

  useEffect(() => {
    try {
      const peer = new Peer();
      peer.on('open', (id) => {
        setPeerId(id);
      });
      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        toast({ 
          variant: "destructive", 
          title: "Connection Error", 
          description: "Failed to initialize P2P connection. Reconnecting..." 
        });
      });
      return () => peer.destroy();
    } catch (err) {
      console.error('Peer init failed:', err);
    }
  }, []);

  const copyId = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    toast({ title: "Copied!", description: "Your ID has been copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  // Responsive layout state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const filteredChats = chats.filter(chat => {
    const user = DUMMY_USERS[chat.userId];
    return user?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeChatUser = activeChatId ? DUMMY_USERS[chats.find(c => c.id === activeChatId)?.userId || ""] || DUMMY_USERS["gemini"] : null;

  return (
    <div className="flex h-screen w-full bg-[hsl(var(--tg-bg))] text-[hsl(var(--tg-text))] overflow-hidden">
      
      {/* --- LEFT SIDEBAR (Chat List) --- */}
      <motion.div 
        className={cn(
          "w-full md:w-[420px] flex flex-col border-r border-[hsl(var(--tg-border))] bg-[hsl(var(--tg-sidebar-bg))] z-30 transition-all duration-300 relative",
          isMobile && activeChatId ? "-ml-[100%]" : "ml-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 flex items-center gap-3 shrink-0">
          <RippleButton variant="ghost" onClick={() => setIsDrawerOpen(true)} className="p-2 rounded-full">
            <Menu className="w-6 h-6 text-[hsl(var(--tg-text-secondary))]" />
          </RippleButton>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--tg-text-secondary))]" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[hsl(var(--tg-bg))] border border-transparent focus:border-[hsl(var(--tg-accent))] focus:bg-[hsl(var(--tg-sidebar-bg))] rounded-full py-2 pl-10 pr-4 text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Content based on ActiveView */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeView === 'chats' && (
              <motion.div 
                key="chats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar"
              >
                {filteredChats.map((chat) => {
                  const user = DUMMY_USERS[chat.userId];
                  const isActive = activeChatId === chat.id;
                  
                  return (
                    <div 
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 mx-2 rounded-xl cursor-pointer transition-colors group relative overflow-hidden",
                        isActive ? "bg-[hsl(var(--tg-accent))] text-white" : "hover:bg-[hsl(var(--tg-bg))]"
                      )}
                    >
                      <Avatar user={user} online={user.status === 'online'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className={cn("font-semibold truncate", isActive ? "text-white" : "")}>{user.name}</h3>
                          <span className={cn("text-xs", isActive ? "text-white/80" : "text-[hsl(var(--tg-text-secondary))]")}>
                            {formatChatDate(chat.lastMessageTime || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <p className={cn("text-sm truncate pr-2", isActive ? "text-white/90" : "text-[hsl(var(--tg-text-secondary))]")}>
                            {chat.lastMessage}
                          </p>
                          {chat.unreadCount !== null && chat.unreadCount > 0 && (
                            <span className={cn(
                              "text-[11px] font-bold px-1.5 h-5 min-w-[20px] rounded-full flex items-center justify-center",
                              isActive ? "bg-white text-[hsl(var(--tg-accent))]" : "bg-[hsl(var(--tg-accent))] text-white"
                            )}>
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeView === 'contacts' && (
              <motion.div 
                key="contacts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 flex flex-col overflow-hidden"
              >
                <div className="p-4 flex items-center gap-4 shrink-0">
                  <RippleButton variant="ghost" onClick={() => handleViewChange('chats')} className="p-2 -ml-2 rounded-full">
                    <Globe className="rotate-180" />
                  </RippleButton>
                  <h2 className="text-xl font-bold flex-1">Contacts</h2>
                  <RippleButton 
                    className="bg-[hsl(var(--tg-accent))] text-white rounded-full px-4 py-1.5 text-sm"
                    onClick={() => setShowAddContact(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </RippleButton>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {contacts.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer"
                      onClick={() => {
                        handleViewChange('chats');
                        toast({ title: "Chat started", description: `Starting conversation with ${user.name}` });
                      }}
                    >
                      <Avatar user={user} online={user.status === 'online'} />
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs text-[hsl(var(--tg-text-secondary))]">
                          {user.status === 'online' ? 'online' : 'last seen recently'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {showAddContact && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-4 border-t border-[hsl(var(--tg-border))] bg-[hsl(var(--tg-sidebar-bg))]"
                    >
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Enter Peer ID"
                          value={newContactId}
                          onChange={(e) => setNewContactId(e.target.value)}
                          className="flex-1 bg-[hsl(var(--tg-bg))] border border-[hsl(var(--tg-border))] rounded-xl px-4 py-2 text-sm outline-none focus:border-[hsl(var(--tg-accent))]"
                        />
                        <RippleButton onClick={addContact}>Add</RippleButton>
                        <RippleButton variant="ghost" onClick={() => setShowAddContact(false)}>Cancel</RippleButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar p-4"
              >
                <div className="flex items-center gap-4 mb-8">
                  <RippleButton variant="ghost" onClick={() => handleViewChange('chats')} className="p-2 -ml-2 rounded-full">
                    <Globe className="rotate-180" />
                  </RippleButton>
                  <h2 className="text-xl font-bold">Settings</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-[hsl(var(--tg-bg))] rounded-2xl p-4 flex flex-col items-center">
                    <Avatar user={MY_USER} size="xl" className="mb-4" />
                    <h3 className="text-lg font-bold">{MY_USER.name}</h3>
                    <p className="text-[hsl(var(--tg-text-secondary))] text-sm">{peerId || 'Generating ID...'}</p>
                    <RippleButton variant="ghost" className="mt-2 text-[hsl(var(--tg-accent))]" onClick={copyId}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy Peer ID
                    </RippleButton>
                  </div>

                  <div className="bg-[hsl(var(--tg-bg))] rounded-2xl overflow-hidden divide-y divide-[hsl(var(--tg-border))]">
                    {[
                      { icon: Bell, label: "Notifications", sub: "On", color: "text-blue-500" },
                      { icon: Shield, label: "Privacy & Security", sub: "Local Persistence", color: "text-green-500" },
                      { icon: Database, label: "Data & Storage", sub: "PostgreSQL", color: "text-orange-500" },
                      { icon: Lock, label: "Password", sub: "Off", color: "text-gray-500" },
                    ].map((item) => (
                      <button key={item.label} className="w-full p-4 flex items-center gap-4 hover:bg-black/5 transition-colors text-left group">
                        <div className={cn("p-2 rounded-lg bg-black/5 dark:bg-white/5 transition-colors", item.color)}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-[hsl(var(--tg-text-secondary))]">{item.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'saved' && (
              <motion.div 
                key="saved"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 flex flex-col p-4"
              >
                <div className="flex items-center gap-4 mb-8">
                  <RippleButton variant="ghost" onClick={() => handleViewChange('chats')} className="p-2 -ml-2 rounded-full">
                    <Globe className="rotate-180" />
                  </RippleButton>
                  <h2 className="text-xl font-bold">Saved Messages</h2>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-[hsl(var(--tg-text-secondary))]">
                  <Bookmark className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your saved messages will appear here</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-6 right-6 md:hidden">
          <RippleButton className="w-14 h-14 rounded-full flex items-center justify-center bg-[hsl(var(--tg-accent))] text-white shadow-lg">
            <Edit2 className="w-6 h-6" />
          </RippleButton>
        </div>
      </motion.div>

      {/* --- RIGHT PANEL --- */}
      <div className={cn(
        "flex-1 relative bg-[hsl(var(--tg-bg))] h-full",
        isMobile && !activeChatId ? "hidden" : "block"
      )}>
        {activeChatId && activeChatUser ? (
          <ChatScreen 
            chatId={activeChatId}
            user={activeChatUser}
            currentUser={MY_USER}
            onBack={() => setActiveChatId(null)}
            isMobile={isMobile}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-[hsl(var(--tg-text-secondary))]">
            <span className="bg-[hsl(var(--tg-sidebar-bg))] rounded-full p-4 mb-4 shadow-sm text-4xl">✨</span>
            <p className="bg-[hsl(var(--tg-sidebar-bg))] px-4 py-1 rounded-full text-sm shadow-sm">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </div>

      {/* --- DRAWER (Sidebar Menu) --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-[280px] h-full bg-[hsl(var(--tg-sidebar-bg))] z-[110] shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-[hsl(var(--tg-sidebar-bg))] border-b border-[hsl(var(--tg-border))]">
                <Avatar user={MY_USER} size="lg" className="mb-4" />
                <h2 className="font-bold text-lg">{MY_USER.name}</h2>
                <p className="text-[hsl(var(--tg-text-secondary))] text-sm truncate">{peerId || 'Connecting...'}</p>
              </div>

              <div className="flex-1 py-2 overflow-y-auto">
                {[
                  { icon: Users, label: "New Group", action: () => {} },
                  { icon: UserIcon, label: "Contacts", action: () => handleViewChange('contacts') },
                  { icon: Phone, label: "Calls", action: () => {} },
                  { icon: Bookmark, label: "Saved Messages", action: () => handleViewChange('saved') },
                  { icon: Settings, label: "Settings", action: () => handleViewChange('settings') },
                ].map((item) => (
                  <button 
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-6 px-6 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[hsl(var(--tg-text))]"
                  >
                    <item.icon className="w-6 h-6 text-[hsl(var(--tg-text-secondary))]" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}

                <div className="border-t border-[hsl(var(--tg-border))] my-2 mx-4" />
                
                <div className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {isDarkMode ? <Moon className="w-6 h-6 text-[hsl(var(--tg-text-secondary))]" /> : <Sun className="w-6 h-6 text-[hsl(var(--tg-text-secondary))]" />}
                    <span className="font-medium">Night Mode</span>
                  </div>
                  <div 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                        "w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative",
                        isDarkMode ? "bg-[hsl(var(--tg-accent))]" : "bg-gray-300"
                    )}
                  >
                    <motion.div 
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: isDarkMode ? 16 : 0 }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 text-center text-xs text-[hsl(var(--tg-text-secondary))] opacity-50">TeleClone Web v1.0</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
