import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  
  // Check if current theme is dark to handle the switch state
  const isDark = theme === "dark";

  return (
    <div
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative w-[4.6rem] h-10 shrink-0 flex items-center cursor-pointer rounded-full p-1 transition-colors duration-500 shadow-inner
        ${isDark ? 'bg-secondary/60 border border-slate-700' : 'bg-secondary/10 border border-slate-300'}
      `}
    >
      <span className="sr-only">Toggle theme</span>

      {/* The Sliding Thumb */}
      <div
        className={`
          bg-white w-8 h-8 rounded-full shadow-md transform transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center relative overflow-hidden
          ${isDark ? 'translate-x-8' : 'translate-x-0'}
        `}
      >
        {/* Sun Icon: Visible when Light */}
        <Sun 
          className={`
            absolute w-4 h-4 text-orange-500 transition-all duration-500
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `} 
        />

        {/* Moon Icon: Visible when Dark */}
        <Moon 
          className={`
            absolute w-4 h-4 text-blue-600 transition-all duration-500
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `} 
        />
      </div>
    </div>
  );
}