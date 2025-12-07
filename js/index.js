// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Load saved elements
  loadElements();

  // Setup form submission
  document
    .getElementById("elementForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      createElement();
    });

  // Setup search
  document
    .getElementById("searchElements")
    .addEventListener("input", function (e) {
      searchElements(e.target.value);
    });
});

// Global variables
let elements = [];
let elementIdCounter = 0;

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

// Create new element
function createElement() {
  const elementType = document.getElementById("elementSelect").value;
  const content = document.getElementById("contentInput").value;

  if (!elementType || !content) {
    showToast("Please select element type and enter content", "error");
    return;
  }

  // Create element object
  const elementData = {
    id: elementIdCounter++,
    type: elementType,
    content: content,
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

  // Add delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
  deleteBtn.className =
    "absolute top-2 right-2 text-red-400 hover:text-red-300 transition opacity-0 group-hover:opacity-100 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center z-10";
  deleteBtn.onclick = function () {
    deleteElement(elementData.id);
  };

  wrapper.appendChild(element);
  wrapper.appendChild(deleteBtn);
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
    html += `&lt;${el.type}&gt;${el.content}&lt;/${el.type}&gt;\n`;
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
    "<!DOCTYPE html>\n<html>\n<head>\n<title>Generated Elements</title>\n<style>\nbody { font-family: Arial, sans-serif; padding: 20px; }\n.generated-element { margin: 10px 0; padding: 10px; }\n</style>\n</head>\n<body>\n";

  elements.forEach((el) => {
    htmlContent += `<${el.type} class="generated-element">${el.content}</${el.type}>\n`;
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
    html += `<${el.type}>${el.content}</${el.type}>\n`;
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

  wrappers.forEach((wrapper) => {
    const element = wrapper.querySelector(".preview-element");
    const content = element.textContent.toLowerCase();
    const type = element.tagName.toLowerCase();

    if (content.includes(searchLower) || type.includes(searchLower)) {
      wrapper.style.display = "block";
    } else {
      wrapper.style.display = "none";
    }
  });
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  // Set message and color
  toastMessage.textContent = message;

  // Remove previous color classes
  toast.className = toast.className.replace(
    /bg-(green|red|yellow|blue)-600/,
    ""
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
