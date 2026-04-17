import { Minus, Plus } from "lucide-react";
import { useEPTheme } from "../../context/AppContext";

interface QuantityInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
}

export function QuantityInput({ value, onChange, min = 0, max, step = 1, label, disabled }: QuantityInputProps) {
  const c = useEPTheme();

  const handleDecrease = () => {
    if (disabled) return;
    const newVal = Math.max(min, value - step);
    onChange(newVal);
  };

  const handleIncrease = () => {
    if (disabled) return;
    const newVal = max !== undefined ? Math.min(max, value + step) : value + step;
    onChange(newVal);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: c.text }}>{label}</label>}
      <div
        className="flex items-center gap-1 p-1 rounded-xl transition-all"
        style={{
          background: c.surface2,
          border: `1.5px solid ${c.border}`,
          opacity: disabled ? 0.6 : 1
        }}
      >
        <button
          type="button"
          onClick={handleDecrease}
          disabled={disabled || value <= min}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-black/5 active:scale-95 disabled:opacity-30"
        >
          <Minus className="w-4 h-4" style={{ color: "#E5233B" }} />
        </button>

        <input
          type="text"
          inputMode="decimal"
          value={value.toString()}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(val);
            else if (e.target.value === "") onChange(0);
          }}
          disabled={disabled}
          className="w-12 text-center bg-transparent border-none outline-none font-bold"
          style={{ color: c.text, fontFamily: "'Cairo', sans-serif" }}
        />

        <button
          type="button"
          onClick={handleIncrease}
          disabled={disabled || (max !== undefined && value >= max)}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-black/5 active:scale-95 disabled:opacity-30"
        >
          <Plus className="w-4 h-4" style={{ color: "#E5233B" }} />
        </button>
      </div>
    </div>
  );
}
