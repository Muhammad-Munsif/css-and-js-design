// Global variables
let elements = [];
let elementIdCounter = 0;
let editMode = false;

// Initialize application
document.addEventListener("DOMContentLoaded", function () {
  initApp();
});

function initApp() {
  // Load saved elements
  loadElements();

  // Setup form submission
  const elementForm = document.getElementById("elementForm");
  if (elementForm) {
    elementForm.addEventListener("submit", function (e) {
      e.preventDefault();
      createElement();
    });
  }

  // Setup search
  const searchInput = document.getElementById("searchElements");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchElements(e.target.value);
    });
  }

  // Setup element button click handlers
  document.querySelectorAll(".element-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const btnClass = Array.from(e.currentTarget.classList)
        .find((cls) => cls.includes("-btn"))
        .replace("-btn", "");
      selectElement(btnClass);
    });
  });

  // Initialize UI
  updateUI();
}

// Load elements from localStorage
function loadElements() {
  try {
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
  } catch (error) {
    console.error("Error loading elements:", error);
    showToast("Error loading saved elements", "error");
  }
}

// Save elements to localStorage
function saveElements() {
  try {
    localStorage.setItem("htmlElements", JSON.stringify(elements));
  } catch (error) {
    console.error("Error saving elements:", error);
    showToast("Error saving elements", "error");
  }
}

// Select element from quick buttons
function selectElement(type) {
  const selectElement = document.getElementById("elementSelect");
  if (selectElement) {
    selectElement.value = type;

    // Highlight selected button
    document.querySelectorAll(".element-btn").forEach((btn) => {
      btn.classList.remove("selected", "ring-2", "ring-blue-500");
    });

    // Find and highlight the clicked button
    const clickedBtn = document.querySelector(`.${type}-btn`);
    if (clickedBtn) {
      clickedBtn.classList.add("selected", "ring-2", "ring-blue-500");
    }
  }
}

// Create new element
function createElement() {
  const elementType = document.getElementById("elementSelect").value;
  const content = document.getElementById("contentInput").value.trim();
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

  // Clear button selections
  document.querySelectorAll(".element-btn").forEach((btn) => {
    btn.classList.remove("selected", "ring-2", "ring-blue-500");
  });
}

// Render a single element
function renderElement(elementData) {
  const resultDiv = document.getElementById("result");
  if (!resultDiv) return;

  // Hide empty state if it's the first element
  if (elements.length === 1) {
    const emptyState = document.getElementById("emptyState");
    if (emptyState) emptyState.style.display = "none";
  }

  // Create element wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "element-wrapper relative group";
  wrapper.dataset.id = elementData.id;
  wrapper.dataset.type = elementData.type;
  wrapper.dataset.content = elementData.content.toLowerCase();

  // Create the HTML element
  const element = document.createElement(elementData.type);
  element.className = "preview-element";
  element.textContent = elementData.content;
  element.dataset.elementId = elementData.id;

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
  element.style.transition = "all 0.3s ease";

  // Add delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
  deleteBtn.className =
    "delete-btn absolute top-2 right-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center z-10 shadow";
  deleteBtn.setAttribute("aria-label", "Delete element");
  deleteBtn.onclick = function () {
    deleteElement(elementData.id);
  };

  // Add element info badge
  const infoBadge = document.createElement("div");
  infoBadge.className =
    "info-badge absolute top-2 left-2 bg-white/80 dark:bg-gray-800/80 text-xs text-gray-600 dark:text-gray-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition";
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
      const emptyState = document.getElementById("emptyState");
      if (emptyState) emptyState.style.display = "block";
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

  if (
    confirm(
      "Are you sure you want to delete ALL elements? This action cannot be undone.",
    )
  ) {
    elements = [];

    // Clear DOM
    const resultDiv = document.getElementById("result");
    if (resultDiv) resultDiv.innerHTML = "";

    // Clear localStorage
    localStorage.removeItem("htmlElements");

    // Update UI
    updateUI();

    // Show empty state
    const emptyState = document.getElementById("emptyState");
    if (emptyState) emptyState.style.display = "block";

    showToast("All elements cleared", "warning");
  }
}

// Toggle edit mode
function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById("editModeBtn");
  if (!btn) return;

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

    // Enable editing on all elements
    document.querySelectorAll(".preview-element").forEach((el) => {
      el.contentEditable = true;
      el.classList.add("editable");
    });

    showToast("Edit mode enabled. Click on elements to edit content.");
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

    // Disable editing
    document.querySelectorAll(".preview-element").forEach((el) => {
      el.contentEditable = false;
      el.classList.remove("editable");

      // Save edited content
      const elementId = el.dataset.elementId;
      if (elementId) {
        const element = elements.find((e) => e.id.toString() === elementId);
        if (element) {
          element.content = el.textContent;
          saveElements();
        }
      }
    });

    showToast("Edit mode disabled. Changes saved.");
  }
}

// Update UI elements
function updateUI() {
  // Update stats
  const totalElements = document.getElementById("totalElements");
  const elementCount = document.getElementById("elementCount");
  const lastElement = document.getElementById("lastElement");

  if (totalElements) {
    totalElements.textContent = elements.length;
  }

  if (elementCount) {
    elementCount.textContent = `${elements.length} element${elements.length !== 1 ? "s" : ""}`;
  }

  if (lastElement) {
    if (elements.length > 0) {
      const last = elements[elements.length - 1];
      lastElement.textContent = `<${last.type}>`;
    } else {
      lastElement.textContent = "None";
    }
  }

  // Update code preview
  updateCodePreview();
}

// Update code preview
function updateCodePreview() {
  const codePreview = document.getElementById("codePreview");
  if (!codePreview) return;

  let html = "";
  elements.forEach((el) => {
    const borderStyle = el.addBorder ? `border: 2px solid ${el.bgColor};` : "";
    html += `&lt;${el.type} style="color: ${el.textColor}; background-color: ${el.bgColor}40; ${borderStyle}"&gt;${el.content}&lt;/${el.type}&gt;\n`;
  });

  codePreview.textContent = html || "<!-- No elements generated yet -->";

  // Add syntax highlighting
  codePreview.innerHTML = codePreview.textContent
    .replace(/&lt;/g, '<span class="text-purple-600">&lt;')
    .replace(/&gt;/g, "&gt;</span>")
    .replace(/style="/g, '<span class="text-red-600">style="</span>')
    .replace(/color:/g, '<span class="text-blue-600">color:</span>')
    .replace(
      /background-color:/g,
      '<span class="text-blue-600">background-color:</span>',
    )
    .replace(/border:/g, '<span class="text-blue-600">border:</span>');
}

// Export HTML
function exportHTML() {
  if (elements.length === 0) {
    showToast("No elements to export", "info");
    return;
  }

  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated HTML Elements</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            padding: 2rem;
            background: #f8fafc;
            color: #1e293b;
            max-width: 1200px;
            margin: 0 auto;
        }
        .container {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        .generated-element {
            margin: 0;
            padding: 1rem;
            border-radius: 0.5rem;
            word-break: break-word;
            transition: transform 0.2s ease;
        }
        .generated-element:hover {
            transform: translateY(-2px);
        }
        .element-info {
            font-size: 0.75rem;
            color: #64748b;
            margin-top: 0.5rem;
            font-family: monospace;
        }
        .export-info {
            background: #e2e8f0;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 2rem;
            font-size: 0.875rem;
        }
        @media (prefers-color-scheme: dark) {
            body {
                background: #0f172a;
                color: #f1f5f9;
            }
            .export-info {
                background: #1e293b;
            }
        }
    </style>
</head>
<body>
    <div class="export-info">
        <h1>Generated HTML Elements</h1>
        <p>Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Total elements: ${elements.length}</p>
    </div>
    <div class="container">\n`;

  elements.forEach((el, index) => {
    const borderStyle = el.addBorder ? `border: 2px solid ${el.bgColor};` : "";
    htmlContent += `        <${el.type} class="generated-element" style="color: ${el.textColor}; background-color: ${el.bgColor}40; ${borderStyle}">
            ${el.content}
            <div class="element-info">Element ${index + 1}: &lt;${el.type}&gt;</div>
        </${el.type}>\n`;
  });

  htmlContent += `    </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `generated-elements-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("HTML exported successfully!");
}

// Copy code to clipboard
async function copyCode() {
  if (elements.length === 0) {
    showToast("No code to copy", "info");
    return;
  }

  let html = "";
  elements.forEach((el) => {
    const borderStyle = el.addBorder ? `border: 2px solid ${el.bgColor};` : "";
    html += `<${el.type} style="color: ${el.textColor}; background-color: ${el.bgColor}40; ${borderStyle}">${el.content}</${el.type}>\n`;
  });

  try {
    await navigator.clipboard.writeText(html);
    showToast("Code copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy:", err);
    showToast("Failed to copy code", "error");
  }
}

// Search elements
function searchElements(searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const wrappers = document.querySelectorAll(".element-wrapper");
  const emptyState = document.getElementById("emptyState");

  let visibleCount = 0;

  wrappers.forEach((wrapper) => {
    const type = wrapper.dataset.type || "";
    const content = wrapper.dataset.content || "";

    if (type.includes(searchLower) || content.includes(searchLower)) {
      wrapper.style.display = "block";
      visibleCount++;
    } else {
      wrapper.style.display = "none";
    }
  });

  // Update empty state based on search results
  if (emptyState) {
    if (visibleCount === 0 && searchTerm.trim() !== "") {
      emptyState.style.display = "block";
      emptyState.innerHTML = `
                <div class="empty-icon w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-4 lg:mb-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center">
                    <i class="fas fa-search text-white text-2xl lg:text-4xl"></i>
                </div>
                <h3 class="empty-title text-lg lg:text-xl text-gray-800 dark:text-white mb-2">No matching elements</h3>
                <p class="empty-message text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">No elements found matching "${searchTerm}"</p>
            `;
    } else if (visibleCount === 0 && searchTerm.trim() === "") {
      emptyState.style.display = elements.length === 0 ? "block" : "none";
    } else {
      emptyState.style.display = "none";
    }
  }
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastMessage) return;

  // Set message
  toastMessage.textContent = message;

  // Remove previous color classes
  const colorClasses = [
    "bg-green-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-blue-600",
    "bg-purple-600",
  ];
  toast.classList.remove(...colorClasses);

  // Set color based on type
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
  toast.style.display = "flex";

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.add("hidden");
    setTimeout(() => {
      toast.style.display = "none";
    }, 300);
  }, 3000);
}

// Make functions available globally
window.selectElement = selectElement;
window.createElement = createElement;
window.clearAll = clearAll;
window.toggleEditMode = toggleEditMode;
window.exportHTML = exportHTML;
window.copyCode = copyCode;
window.searchElements = searchElements;
window.showToast = showToast;
