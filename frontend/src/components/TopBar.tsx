import { useState, useEffect } from "react";

export default function TopBar() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="fixed left-64 right-0 top-0 h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 shadow z-50">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        AI Voice Agent Dashboard
      </h1>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>
  );
}
