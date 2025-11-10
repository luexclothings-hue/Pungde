"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "dark" as const,
      name: "Premium Dark",
      icon: "🌙",
      gradient: "linear-gradient(135deg, #0a0c10, #1a1d24)",
      description: "Luxurious dark theme"
    },
    {
      id: "farmer" as const,
      name: "Farmer's Earth",
      icon: "🌾",
      gradient: "linear-gradient(135deg, #2d5016, #4a7c2c)",
      description: "Nature-inspired warmth"
    },
    {
      id: "light" as const,
      name: "Light Pro",
      icon: "☀️",
      gradient: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
      description: "Clean & modern"
    }
  ];

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-label">Choose Theme</div>
      <div className="theme-options">
        {themes.map((t) => (
          <button
            key={t.id}
            className={`theme-option ${theme === t.id ? "active" : ""}`}
            onClick={() => setTheme(t.id)}
            title={t.description}
          >
            <div 
              className="theme-preview" 
              style={{ background: t.gradient }}
            >
              <span className="theme-icon">{t.icon}</span>
            </div>
            <div className="theme-info">
              <div className="theme-name">{t.name}</div>
              <div className="theme-desc">{t.description}</div>
            </div>
            {theme === t.id && (
              <div className="theme-check">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
