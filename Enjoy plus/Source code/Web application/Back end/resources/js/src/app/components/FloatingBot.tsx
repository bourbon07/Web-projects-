import { useState, useRef, useEffect } from "react";
import { X, Send, ShoppingCart, Tag } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import axiosConfig from "../../api/axiosConfig";
import { toast } from "sonner";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  time: string;
  lang: "ar" | "en";
  data?: any;
}

// Reusable Icon Component for the Assistant
function AssistantIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="20" rx="10" ry="4" fill="white" opacity="0.9" />
      <rect x="16" y="18" width="16" height="10" rx="2" fill="white" opacity="0.9" />
      <ellipse cx="24" cy="16" rx="8" ry="7" fill="white" opacity="0.9" />
      <ellipse cx="19" cy="14" rx="4" ry="4" fill="white" />
      <ellipse cx="24" cy="12" rx="4" ry="4" fill="white" />
      <ellipse cx="29" cy="14" rx="4" ry="4" fill="white" />
      <rect x="17" y="26" width="14" height="12" rx="5" fill="white" opacity="0.95" />
      <circle cx="21" cy="31" r="1.5" fill="#E5233B" />
      <circle cx="27" cy="31" r="1.5" fill="#E5233B" />
      <path d="M21 34.5 Q24 36.5 27 34.5" stroke="#E5233B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 42 L20 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M7 38 L15 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M13 44 L21 34" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="38" cy="10" r="2" fill="white" opacity="0.9" />
      <circle cx="42" cy="18" r="1.5" fill="white" opacity="0.7" />
      <circle cx="35" cy="5" r="1" fill="white" opacity="0.8" />
    </svg>
  );
}

export function FloatingBot() {
  const { lang, addToCart, toggleWishlist, currentUser } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper for multi-language UI strings
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const isRTL = lang === "ar";
  const sideDir = isRTL ? { right: "24px" } : { left: "24px" };

  const [pendingFilter, setPendingFilter] = useState<{ id: string, name: string, type: 'category' | 'brand' } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Welcoming message when chat opens
  useEffect(() => {
    if (open && messages.length === 0) {
      const name = currentUser?.name || (lang === 'ar' ? "عزيزي" : "there");
      const welcomeMsg: Message = {
        id: Date.now(),
        text: lang === 'ar'
          ? `أهلاً ${name}! أنا شهاب🤖، كيف يمكنني مساعدتك اليوم؟`
          : `Hello ${name}! I'm Shehab🤖, how can I assist you today?`,
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lang: lang
      };
      setMessages([welcomeMsg]);
    }
  }, [open, lang]);

  const handleSendMessage = async (text?: string, isHidden: boolean = false) => {
    const msgText = text || input;
    if (!msgText.trim()) return;

    if (!isHidden) {
      const userMsg: Message = {
        id: Date.now(),
        text: msgText,
        sender: "user",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lang: lang,
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    setInput("");
    setTyping(true);
    setPendingFilter(null); // Clear any pending filter on new message

    try {
      // Calling Flowise directly instead of proxying through Laravel to avoid timeouts
      const response = await fetch("http://localhost:3000/api/v1/prediction/e3bc3187-8684-41ad-aba7-59d64e41833e", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: msgText,
          overrideConfig: {
              sessionId: localStorage.getItem("ai_session_id") || `session_${Date.now()}`
          }
        })
      });

      if (!response.ok) throw new Error("Connection failed");
      
      const data = await response.json();
      const rawReply = data.text || data.response || "";
      
      let parsed = null;
      let botText = rawReply;

      // Try to parse JSON from the reply
      try {
        if (rawReply.includes('{')) {
          const jsonMatch = rawReply.match(/\{.*\}/s);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
            botText = parsed.message || rawReply.split('{')[0].trim();
          }
        }
      } catch (e) {
        console.warn("Parsing structured data failed", e);
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lang: lang,
        data: parsed || data
      };

      setMessages((prev) => [...prev, botMsg]);

    } catch (error: any) {
      console.error("AI Communication error", error);
      const botErrorMsg: Message = {
        id: Date.now() + 2,
        text: t("حدث خطأ في الاتصال. حاول مرة أخرى.", "Connection error. Please try again."),
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lang: lang
      };
      setMessages((prev) => [...prev, botErrorMsg]);
    } finally {
      setTyping(false);
    }
  };

  const handleFilterClick = (item: any, type: 'category' | 'brand') => {
    setPendingFilter({ id: item.id, name: item.name, type });

    const confirmMsg: Message = {
      id: Date.now(),
      text: lang === 'ar'
        ? `هل تريد تصفية المنتجات حسب ${type === 'category' ? 'الفئة' : 'العلامة التجارية'}: ${item.name}؟`
        : `Do you want to filter products by ${type}: ${item.name}?`,
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lang: lang,
      data: { type: 'confirmation', target: { id: item.id, name: item.name, type } }
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  return (
    <>
      {/* Floating Entry Button */}
      {!open && (
        <div style={{ position: "fixed", bottom: "24px", ...sideDir, zIndex: 999 }}>
          <motion.button
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}
          >
            <AssistantIcon size={34} />
            <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
          </motion.button>
        </div>
      )}

      {/* Dynamic Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            className="fixed z-50 w-80 md:w-96 rounded-2xl shadow-2xl overflow-hidden border-2 bg-white"
            style={{ bottom: "24px", ...sideDir, borderColor: "#FFDDE4" }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-3.5 text-white" style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <AssistantIcon size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold tracking-tight">{t("شهاب - مساعدك الذكي", "Shehab - Smart Assistant")}</p>
                <div className="flex items-center gap-1.5 text-xs opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {t("متصل الآن", "Online")}
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
                <X size={20} />
              </button>
            </div>

            {/* Message Area */}
            <div className="h-80 overflow-y-auto p-3 space-y-4" style={{ background: c.surface2 }}>

              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className="flex items-end gap-1.5 max-w-[90%]">
                    {msg.sender === "bot" && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-red-500 text-white">
                        <AssistantIcon size={14} />
                      </div>
                    )}
                    <div
                      className="px-3 py-2 rounded-2xl text-sm shadow-sm"
                      style={{
                        background: msg.sender === "bot" ? "white" : "#E5233B",
                        color: msg.sender === "bot" ? "#333" : "white",
                        borderRadius: msg.sender === "bot"
                          ? (isRTL ? "4px 16px 16px 16px" : "16px 4px 16px 16px")
                          : (isRTL ? "16px 4px 16px 4px" : "4px 16px 16px 4px"),
                      }}
                    >
                      {/* Text with line breaks for recipes/steps */}
                      <div className="whitespace-pre-line">{msg.text}</div>
                      <span className="block text-[8px] opacity-40 mt-1">{msg.time}</span>
                    </div>
                  </div>

                  {/* Render Confirmation Buttons */}
                  {msg.sender === "bot" && msg.data?.type === 'confirmation' && (
                    <div className="mt-2 flex gap-2 ps-8">
                      <button
                        onClick={() => handleSendMessage(t(`نعم، عرض منتجات ${msg.data.target.name}`, `Yes, show products for ${msg.data.target.name}`))}
                        className="px-4 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold shadow-sm hover:bg-green-600 transition-colors"
                      >
                        {t("نعم", "Yes")}
                      </button>
                      <button
                        onClick={() => {
                          setMessages(prev => [...prev, {
                            id: Date.now(),
                            text: t("تم إلغاء التصفية. هل هناك شيء آخر؟", "Filter cancelled. Anything else?"),
                            sender: "bot",
                            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            lang: lang
                          }]);
                        }}
                        className="px-4 py-1.5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold shadow-sm hover:bg-gray-300 transition-colors"
                      >
                        {t("لا", "No")}
                      </button>
                    </div>
                  )}

                  {/* Render Interactive Cards (Products/Packages) */}
                  {msg.sender === "bot" && (msg.data?.type === 'products' || msg.data?.type === 'packages' || msg.data?.type === 'mixed') && msg.data?.items && (
                    <div className="mt-2 w-full flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1 ps-8">
                      {msg.data.items.map((item: any, i: number) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => navigate(item.link)}
                          className="shrink-0 w-48 rounded-xl overflow-hidden shadow-lg cursor-pointer border bg-white group"
                          style={{ borderColor: c.border }}
                        >
                          <div className="relative overflow-hidden h-28">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {item.type === 'package' ? t("باقة", "Bundle") : t("منتج", "Product")}
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-bold line-clamp-1 mb-1">{item.name}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-red-500 font-black">{item.price}</p>
                              <ShoppingCart size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Render Categories/Brands Buttons */}
                  {msg.sender === "bot" && (msg.data?.type === 'categories' || msg.data?.type === 'brands') && msg.data?.items && (
                    <div className="mt-2 flex flex-wrap gap-2 ps-8">
                      {msg.data.items.map((item: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => handleFilterClick(item, msg.data.type === 'categories' ? 'category' : 'brand')}
                          className="px-3 py-1.5 rounded-full border bg-white shadow-sm hover:shadow-md hover:border-red-500 transition-all text-xs font-medium flex items-center gap-1.5"
                          style={{ borderColor: c.border, color: '#444' }}
                        >
                          <Tag size={12} className="text-red-500" />
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white rounded-2xl w-fit shadow-sm ms-8">
                  {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 bg-red-500/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input */}
            <div className="p-3 border-t bg-gray-50/50" style={{ borderColor: c.border }}>
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 border shadow-inner" style={{ borderColor: c.border }}>
                <input
                  type="text"
                  placeholder={t("اسأل شهاب عن وصفة أو منتج...", "Ask Shehab for a recipe or product...")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-transparent text-sm outline-none py-1"
                />
                <button
                  disabled={typing || !input.trim()}
                  onClick={() => handleSendMessage()}
                  className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}