// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Initialize theme
  initTheme();

  // Load saved elements
  loadElements();

  // Setup form submission
  document
    .getElementById("elementForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      createElement();
    });

  // Setup mobile form submission (clone from desktop)
  const mobileFormContainer = document.getElementById("mobileFormContainer");
  if (mobileFormContainer) {
    const desktopForm = document.getElementById("elementForm");
    if (desktopForm) {
      mobileFormContainer.innerHTML = desktopForm.innerHTML;
      mobileFormContainer
        .querySelector("form")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          createElement();
          closeMobileMenu();
        });
    }
  }

  // Setup search
  document
    .getElementById("searchElements")
    .addEventListener("input", function (e) {
      searchElements(e.target.value);
    });

  // Setup theme toggles
  setupThemeToggles();

  // Setup mobile menu
  setupMobileMenu();
});

// Global variables
let elements = [];
let elementIdCounter = 0;
let editMode = false;

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  // Update all theme toggles
  document
    .querySelectorAll("#themeToggle, #themeToggleMobile, #themeToggleMobile2")
    .forEach((toggle) => {
      toggle.checked = savedTheme === "dark";
    });
}

function setTheme(theme) {
  document.body.className = theme + "-mode";
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);

  // Update all theme toggles
  document
    .querySelectorAll("#themeToggle, #themeToggleMobile, #themeToggleMobile2")
    .forEach((toggle) => {
      toggle.checked = newTheme === "dark";
    });
}

function setupThemeToggles() {
  // Desktop toggle
  const desktopToggle = document.getElementById("themeToggle");
  if (desktopToggle) {
    desktopToggle.addEventListener("change", toggleTheme);
  }

  // Mobile toggles
  const mobileToggle1 = document.getElementById("themeToggleMobile");
  const mobileToggle2 = document.getElementById("themeToggleMobile2");

  if (mobileToggle1) {
    mobileToggle1.addEventListener("change", toggleTheme);
  }

  if (mobileToggle2) {
    mobileToggle2.addEventListener("change", toggleTheme);
  }
}

// Mobile Menu Management
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const closeMobileMenuBtn = document.getElementById("closeMobileMenu");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      mobileMenu.style.display = "block";
      setTimeout(() => mobileMenu.classList.add("active"), 10);
    });
  }

  if (closeMobileMenuBtn && mobileMenu) {
    closeMobileMenuBtn.addEventListener("click", closeMobileMenu);
  }

  if (mobileMenu) {
    mobileMenu.addEventListener("click", function (e) {
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) {
    mobileMenu.classList.remove("active");
    setTimeout(() => (mobileMenu.style.display = "none"), 300);
  }
}

// Load elements from localStorage
function loadElements() {
  const saved = localStorage.getItem("htmlElements");
  if (saved) {
    elements = JSON.parse(saved);
    elementIdCounter =
      elements.length > 0 ? Math.max(...elements.map((e) => e.id)) + 1 : 0;

    // Render all elements
    elements.forEach((element) => {
      renderElement(element);
    });

    updateUI();
  }
}

// Save elements to localStorage
function saveElements() {
  localStorage.setItem("htmlElements", JSON.stringify(elements));
}

// Select element from quick buttons
function selectElement(type) {
  const selectElement = document.getElementById("elementSelect");
  if (selectElement) {
    selectElement.value = type;

    // Highlight selected button
    document.querySelectorAll(".element-btn").forEach((btn) => {
      btn.classList.remove("ring-2", "ring-blue-500");
    });
    event.target.classList.add("ring-2", "ring-blue-500");
  }
}

// Create new element
function createElement() {
  const elementType = document.getElementById("elementSelect").value;
  const content = document.getElementById("contentInput").value;
  const textColor = document.getElementById("textColor").value;
  const bgColor = document.getElementById("bgColor").value;
  const addBorder = document.getElementById("addBorder").checked;

  if (!elementType || !content) {
    showToast("Please select element type and enter content", "error");
    return;
  }

  // Create element object
  const elementData = {
    id: elementIdCounter++,
    type: elementType,
    content: content,
    textColor: textColor,
    bgColor: bgColor,
    addBorder: addBorder,
    timestamp: new Date().toISOString(),
  };

  // Add to array
  elements.push(elementData);

  // Save to localStorage
  saveElements();

  // Render the element
  renderElement(elementData);

  // Update UI
  updateUI();

  // Show success message
  showToast(`${elementType.toUpperCase()} element created successfully!`);

  // Clear form
  document.getElementById("elementForm").reset();
}

// Render a single element
function renderElement(elementData) {
  const resultDiv = document.getElementById("result");

  // Hide empty state if it's the first element
  if (elements.length === 1) {
    document.getElementById("emptyState").style.display = "none";
  }

  // Create element wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "relative group";
  wrapper.dataset.id = elementData.id;

  // Create the HTML element
  const element = document.createElement(elementData.type);
  element.className = "preview-element";
  element.textContent = elementData.content;

  // Apply styles
  element.style.color = elementData.textColor;
  element.style.backgroundColor = elementData.bgColor + "40";
  element.style.border = elementData.addBorder
    ? `2px solid ${elementData.bgColor}`
    : "2px dashed var(--primary)";
  element.style.padding = "1rem";
  element.style.borderRadius = "0.5rem";
  element.style.margin = "0.5rem 0";
  element.style.wordBreak = "break-word";

  // Add delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
  deleteBtn.className =
    "absolute top-2 right-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center z-10 shadow";
  deleteBtn.onclick = function () {
    deleteElement(elementData.id);
  };

  // Add element info badge
  const infoBadge = document.createElement("div");
  infoBadge.className =
    "absolute top-2 left-2 bg-white/80 dark:bg-gray-800/80 text-xs text-gray-600 dark:text-gray-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition";
  infoBadge.textContent = `<${elementData.type}>`;

  wrapper.appendChild(element);
  wrapper.appendChild(deleteBtn);
  wrapper.appendChild(infoBadge);
  resultDiv.appendChild(wrapper);
}

// Delete element
function deleteElement(id) {
  if (confirm("Are you sure you want to delete this element?")) {
    // Remove from array
    elements = elements.filter((el) => el.id !== id);

    // Remove from DOM
    const elementToRemove = document.querySelector(`[data-id="${id}"]`);
    if (elementToRemove) {
      elementToRemove.remove();
    }

    // Save to localStorage
    saveElements();

    // Update UI
    updateUI();

    // Show empty state if no elements
    if (elements.length === 0) {
      document.getElementById("emptyState").style.display = "block";
    }

    showToast("Element deleted", "warning");
  }
}

// Clear all elements
function clearAll() {
  if (elements.length === 0) {
    showToast("No elements to clear", "info");
    return;
  }

  if (confirm("Are you sure you want to delete ALL elements?")) {
    elements = [];

    // Clear DOM
    document.getElementById("result").innerHTML = "";

    // Clear localStorage
    localStorage.removeItem("htmlElements");

    // Update UI
    updateUI();

    // Show empty state
    document.getElementById("emptyState").style.display = "block";

    showToast("All elements cleared", "warning");
  }
}

// Toggle edit mode
function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById("editModeBtn");
  if (editMode) {
    btn.innerHTML =
      '<i class="fas fa-times mr-2"></i> <span class="hidden lg:inline">Exit Edit</span>';
    btn.classList.add(
      "bg-red-100",
      "dark:bg-red-900/30",
      "text-red-700",
      "dark:text-red-400",
      "border-red-200",
      "dark:border-red-800",
    );
    btn.classList.remove(
      "bg-purple-100",
      "dark:bg-purple-900/30",
      "text-purple-700",
      "dark:text-purple-400",
      "border-purple-200",
      "dark:border-purple-800",
    );
    showToast("Edit mode enabled");
  } else {
    btn.innerHTML =
      '<i class="fas fa-edit mr-2"></i> <span class="hidden lg:inline">Edit</span>';
    btn.classList.remove(
      "bg-red-100",
      "dark:bg-red-900/30",
      "text-red-700",
      "dark:text-red-400",
      "border-red-200",
      "dark:border-red-800",
    );
    btn.classList.add(
      "bg-purple-100",
      "dark:bg-purple-900/30",
      "text-purple-700",
      "dark:text-purple-400",
      "border-purple-200",
      "dark:border-purple-800",
    );
  }
}

// Update UI elements
function updateUI() {
  // Update stats
  document.getElementById("totalElements").textContent = elements.length;
  document.getElementById("elementCount").textContent = `${
    elements.length
  } element${elements.length !== 1 ? "s" : ""}`;

  if (elements.length > 0) {
    const last = elements[elements.length - 1];
    document.getElementById("lastElement").textContent = `<${last.type}>`;
  } else {
    document.getElementById("lastElement").textContent = "None";
  }

  // Update code preview
  updateCodePreview();
}

// Update code preview
function updateCodePreview() {
  let html = "";
  elements.forEach((el) => {
    const borderStyle = el.addBorder ? `border: 2px solid ${el.bgColor};` : "";
    html += `&lt;${el.type} style="color: ${el.textColor}; background-color: ${el.bgColor}40; ${borderStyle}"&gt;${el.content}&lt;/${el.type}&gt;\n`;
  });
  document.getElementById("codePreview").textContent =
    html || "<!-- No elements generated yet -->";
}

// Export HTML
function exportHTML() {
  if (elements.length === 0) {
    showToast("No elements to export", "info");
    return;
  }

  let htmlContent =
    "<!DOCTYPE html>\n<html>\n<head>\n<title>Generated Elements</title>\n<style>\nbody { font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; color: #1e293b; }\n.generated-element { margin: 10px 0; padding: 10px; border-radius: 8px; }\n</style>\n</head>\n<body>\n";

  elements.forEach((el) => {
    const borderStyle = el.addBorder ? `border: 2px solid ${el.bgColor};` : "";
    htmlContent += `<${el.type} class="generated-element" style="color: ${el.textColor}; background-color: ${el.bgColor}40; ${borderStyle}">${el.content}</${el.type}>\n`;
  });

  htmlContent += "</body>\n</html>";

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "generated-elements.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("HTML exported successfully!");
}

// Copy code to clipboard
function copyCode() {
  if (elements.length === 0) {
    showToast("No code to copy", "info");
    return;
  }

  let html = "";
  elements.forEach((el) => {
    const borderStyle = el.addBorder ? `border: 2px solid ${el.bgColor};` : "";
    html += `<${el.type} style="color: ${el.textColor}; background-color: ${el.bgColor}40; ${borderStyle}">${el.content}</${el.type}>\n`;
  });

  navigator.clipboard
    .writeText(html)
    .then(() => showToast("Code copied to clipboard!"))
    .catch(() => showToast("Failed to copy code", "error"));
}

// Search elements
function searchElements(searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const wrappers = document.querySelectorAll("#result > div");

  let visibleCount = 0;

  wrappers.forEach((wrapper) => {
    const element = wrapper.querySelector(".preview-element");
    const content = element.textContent.toLowerCase();
    const type = element.tagName.toLowerCase();

    if (content.includes(searchLower) || type.includes(searchLower)) {
      wrapper.style.display = "block";
      visibleCount++;
    } else {
      wrapper.style.display = "none";
    }
  });

  // Show/hide empty state based on search results
  const emptyState = document.getElementById("emptyState");
  if (visibleCount === 0 && searchTerm.trim() !== "") {
    emptyState.style.display = "block";
    emptyState.innerHTML = `
                    <div class="w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-4 lg:mb-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center">
                        <i class="fas fa-search text-white text-2xl lg:text-4xl"></i>
                    </div>
                    <h3 class="text-lg lg:text-xl text-gray-800 dark:text-white mb-2">No matching elements</h3>
                    <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">No elements found matching "${searchTerm}"</p>
                `;
  } else if (visibleCount === 0 && searchTerm.trim() === "") {
    emptyState.style.display = "block";
    emptyState.innerHTML = `
                    <div class="w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-4 lg:mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <i class="fas fa-code text-white text-2xl lg:text-4xl"></i>
                    </div>
                    <h3 class="text-lg lg:text-xl text-gray-800 dark:text-white mb-2">No elements created yet</h3>
                    <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">Start creating HTML elements using the form on the left. Your creations will appear here in real-time.</p>
                `;
  } else {
    emptyState.style.display = "none";
  }
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  // Set message and color
  toastMessage.textContent = message;

  // Remove previous color classes
  toast.className = toast.className.replace(
    /bg-(green|red|yellow|blue|purple)-600/,
    "",
  );

  switch (type) {
    case "error":
      toast.classList.add("bg-red-600");
      break;
    case "warning":
      toast.classList.add("bg-yellow-600");
      break;
    case "info":
      toast.classList.add("bg-blue-600");
      break;
    default:
      toast.classList.add("bg-green-600");
  }

  // Show toast
  toast.classList.remove("hidden");

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
