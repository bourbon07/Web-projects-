import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  time: string;
  lang: "ar" | "en";
}

const BOT_RESPONSES_AR = [
  "مرحباً! أنا شهاب، مساعدك الذكي في Enjoy Plus. كيف يمكنني مساعدتك اليوم؟",
  "يسعدني مساعدتك في اختيار أفضل أدوات الحلويات والخبيز!",
  "يمكنني مساعدتك في اختيار المنتجات المناسبة لك. ما الذي تبحث عنه؟",
  "لدينا أفضل العروض على منتجات Wilton و KitchenAid الآن!",
  "هل تريد الاطلاع على باقاتنا المجمعة بأسعار مخفضة؟",
  "يمكنك الاستفادة من خصم 20% عند أول طلب لك! استخدم كود: ENJOY20",
  "التوصيل لجميع أنحاء الأردن خلال 24-48 ساعة! 🚚",
  "منتجاتنا أصلية 100% مع ضمان الجودة والإرجاع المجاني خلال 30 يوم.",
];

const BOT_RESPONSES_EN = [
  "Hello! I'm Shehab, your AI assistant at Enjoy Plus. How can I help you today?",
  "I'd love to help you choose the best pastry and baking tools!",
  "I can help you find the right products. What are you looking for?",
  "We have great deals on Wilton and KitchenAid products right now!",
  "Would you like to check our bundle packages at discounted prices?",
  "You can get 20% off your first order! Use code: ENJOY20",
  "We deliver all across Jordan within 24-48 hours! 🚚",
  "100% authentic products with quality guarantee and free 30-day returns.",
];

// Meteor/star cooking bot SVG icon
function ShehabIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chef hat */}
      <ellipse cx="24" cy="20" rx="10" ry="4" fill="white" opacity="0.9" />
      <rect x="16" y="18" width="16" height="10" rx="2" fill="white" opacity="0.9" />
      <ellipse cx="24" cy="16" rx="8" ry="7" fill="white" opacity="0.9" />
      <ellipse cx="19" cy="14" rx="4" ry="4" fill="white" />
      <ellipse cx="24" cy="12" rx="4" ry="4" fill="white" />
      <ellipse cx="29" cy="14" rx="4" ry="4" fill="white" />
      {/* Bot face */}
      <rect x="17" y="26" width="14" height="12" rx="5" fill="white" opacity="0.95" />
      <circle cx="21" cy="31" r="1.5" fill="#E5233B" />
      <circle cx="27" cy="31" r="1.5" fill="#E5233B" />
      <path d="M21 34.5 Q24 36.5 27 34.5" stroke="#E5233B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Meteor tail */}
      <path d="M10 42 L20 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M7 38 L15 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M13 44 L21 34" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Stars */}
      <circle cx="38" cy="10" r="2" fill="white" opacity="0.9" />
      <circle cx="42" cy="18" r="1.5" fill="white" opacity="0.7" />
      <circle cx="35" cy="5" r="1" fill="white" opacity="0.8" />
    </svg>
  );
}

export function FloatingBot() {
  const { lang } = useApp();
  const c = useEPTheme();
  const [open, setOpen] = useState(false);
  // Bot maintains its own language context independent of site language
  const [botLang, setBotLang] = useState<"ar" | "en">(lang);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "مرحباً! أنا شهاب 🌟 كيف يمكنني مساعدتك في عالم الحلويات والخبيز؟",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lang: "ar",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = (ar: string, en: string) => (botLang === "ar" ? ar : en);
  const isRTL = lang === "ar";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      text: msgText,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lang: botLang,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const responses = botLang === "ar" ? BOT_RESPONSES_AR : BOT_RESPONSES_EN;
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: reply, sender: "bot", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), lang: botLang },
      ]);
      setTyping(false);
    }, 1200);
  };

  // Fixed positioning based on language direction
  const chatSide = isRTL ? { right: "24px" } : { left: "24px" };

  return (
    <>
      {/* Floating Button - Fixed position (not draggable) */}
      {!open && (
        <div style={{ position: "fixed", bottom: "24px", ...chatSide, zIndex: 999 }}>
          <motion.button
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}
          >
            <ShehabIcon size={34} />
            {/* AI Badge */}
            <span
              className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-white flex items-center justify-center"
              style={{ background: "#FFB800", fontSize: "8px", fontWeight: 800, color: "#1a1a1a", border: "2px solid white", minWidth: "22px" }}
            >
              AI
            </span>
            {/* Pulse ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "rgba(229,35,59,0.25)" }}
            />
          </motion.button>
        </div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed z-50 w-80 md:w-96 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              border: "2px solid #FFDDE4",
              bottom: "24px",
              ...chatSide,
            }}
            dir={botLang === "ar" ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 p-3.5"
              style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}
            >
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ShehabIcon size={26} />
              </div>
              <div className="flex-1">
                <p className="text-white" style={{ fontFamily: "'Almarai', sans-serif", fontWeight: 700, fontSize: "17px" }}>
                  {t("شهاب - المساعد الذكي", "Shehab - AI Assistant")}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-white/80" style={{ fontSize: "13px", fontFamily: "'Almarai', sans-serif" }}>
                    {t("متصل الآن", "Online Now")}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-2.5" style={{ background: c.surface2 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user"
                    ? (msg.lang === "ar" ? "justify-start" : "justify-end")
                    : (msg.lang === "ar" ? "justify-end" : "justify-start")}`}
                  dir={msg.lang === "ar" ? "rtl" : "ltr"}
                >
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mx-1" style={{ background: "#E5233B" }}>
                      <ShehabIcon size={16} />
                    </div>
                  )}
                  <div
                    className="max-w-[75%] px-3 py-2 rounded-2xl shadow-sm"
                    style={{
                      background: msg.sender === "bot" ? c.surface : "#E5233B",
                      color: msg.sender === "bot" ? c.text : "#FFF",
                      borderRadius: msg.sender === "bot"
                        ? (msg.lang === "ar" ? "4px 16px 16px 16px" : "16px 4px 16px 16px")
                        : (msg.lang === "ar" ? "16px 4px 16px 16px" : "4px 16px 16px 16px"),
                    }}
                  >
                    <p style={{ fontSize: "15px", fontFamily: "'Almarai', sans-serif", lineHeight: 1.6 }}>{msg.text}</p>
                    <p style={{ fontSize: "11px", opacity: 0.6, marginTop: "2px" }}>{msg.time}</p>
                  </div>
                </div>
              ))}
              {typing && (
                <div className={`flex ${botLang === "ar" ? "justify-end" : "justify-start"} items-center gap-2`} dir={botLang === "ar" ? "rtl" : "ltr"}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#E5233B" }}>
                    <ShehabIcon size={16} />
                  </div>
                  <div className="flex gap-1 px-3 py-2 rounded-2xl shadow-sm" style={{ background: c.surface }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#E5233B" }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-3 py-2 flex gap-2 overflow-x-auto" style={{ background: c.surface2 }}>
              {[
                t("العروض الحالية", "Current Deals"),
                t("الباقات", "Bundles"),
                t("التوصيل", "Delivery"),
                t("المنتجات", "Products"),
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="shrink-0 px-3 py-1 rounded-full border text-xs"
                  style={{ borderColor: c.border, color: "#E5233B", fontFamily: "'Almarai', sans-serif", background: c.surface }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 p-3" style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}>
              <input
                type="text"
                placeholder={t("اكتب رسالتك...", "Type your message...")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-3 py-2 rounded-full outline-none text-sm"
                style={{ background: c.surface3, fontFamily: "'Almarai', sans-serif", border: `1px solid ${c.border}`, color: c.text }}
              />
              <button
                onClick={() => sendMessage()}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ background: "#E5233B" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}