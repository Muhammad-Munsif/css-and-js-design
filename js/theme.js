// Theme Management
const ThemeManager = {
  init() {
    this.loadTheme();
    this.setupEventListeners();
    this.updateColorInputs();
  },

  loadTheme() {
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    this.setTheme(savedTheme);

    // Update all theme toggles
    document
      .querySelectorAll("#themeToggle, #themeToggleMobile, #themeToggleMobile2")
      .forEach((toggle) => {
        if (toggle) toggle.checked = savedTheme === "dark";
      });
  },

  setTheme(theme) {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(`${theme}-mode`);
    localStorage.setItem("theme", theme);
    this.updateMetaThemeColor(theme);
  },

  toggleTheme() {
    const currentTheme = localStorage.getItem("theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);

    // Update all theme toggles
    document
      .querySelectorAll("#themeToggle, #themeToggleMobile, #themeToggleMobile2")
      .forEach((toggle) => {
        if (toggle) toggle.checked = newTheme === "dark";
      });

    // Update color inputs for better visibility in dark mode
    this.updateColorInputs();
  },

  setupEventListeners() {
    // Desktop toggle
    const desktopToggle = document.getElementById("themeToggle");
    if (desktopToggle) {
      desktopToggle.addEventListener("change", () => this.toggleTheme());
    }

    // Mobile toggles
    const mobileToggle1 = document.getElementById("themeToggleMobile");
    const mobileToggle2 = document.getElementById("themeToggleMobile2");

    if (mobileToggle1) {
      mobileToggle1.addEventListener("change", () => this.toggleTheme());
    }

    if (mobileToggle2) {
      mobileToggle2.addEventListener("change", () => this.toggleTheme());
    }

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.setTheme(e.matches ? "dark" : "light");
        }
      });
  },

  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }

    const colors = {
      light: "#f8fafc",
      dark: "#0f172a",
    };
    metaThemeColor.content = colors[theme] || colors.light;
  },

  updateColorInputs() {
    const currentTheme = localStorage.getItem("theme") || "light";
    const colorInputs = document.querySelectorAll('input[type="color"]');

    colorInputs.forEach((input) => {
      // Update input background for better visibility
      input.style.backgroundColor =
        currentTheme === "dark" ? "#374151" : "#f9fafb";
    });
  },
};

// Initialize theme when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ThemeManager.init());
} else {
  ThemeManager.init();
}

// Export for use in other modules
window.ThemeManager = ThemeManager;
