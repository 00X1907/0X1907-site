import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      return stored || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "dark") {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme, setTheme };
};
