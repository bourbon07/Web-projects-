import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useEPTheme } from "../../context/AppContext";

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  icon?: React.ReactNode;
  dir?: "rtl" | "ltr";
}

export function CustomSelect({ value, onChange, options, placeholder = "اختر...", icon, dir = "rtl" }: CustomSelectProps) {
  const c = useEPTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative" dir={dir}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all"
        style={{
          border: `1.5px solid ${open ? "#E5233B" : c.border}`,
          background: c.inputBg,
          fontFamily: "'Cairo', sans-serif",
          fontSize: "14px",
          color: selected ? c.text : c.muted,
          outline: "none",
          boxShadow: open ? "0 0 0 3px rgba(229,35,59,0.12)" : "none",
        }}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="flex-1 text-start">
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.icon && <span>{selected.icon}</span>}
              {selected.label}
            </span>
          ) : (
            <span style={{ color: c.muted }}>{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: c.muted }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1.5 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: c.surface,
            border: `1.5px solid ${c.border}`,
            top: "100%",
          }}
        >
          <div className="p-1.5 max-h-56 overflow-y-auto">
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-start"
                  style={{
                    background: isActive ? c.surface3 : "transparent",
                    color: isActive ? "#E5233B" : c.text,
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "14px",
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {opt.icon && <span style={{ fontSize: "18px" }}>{opt.icon}</span>}
                  <span className="flex-1">{opt.label}</span>
                  {isActive && <Check className="w-4 h-4 shrink-0" style={{ color: "#E5233B" }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
