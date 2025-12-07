// State management
let elements = [];
let editMode = false;
let totalElements = 0;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  updateStats();
  loadFromStorage();
});

// Select element from quick buttons
function selectElement(type) {
  document.getElementById("elementSelect").value = type;

  // Highlight selected button
  document.querySelectorAll(".element-btn").forEach((btn) => {
    btn.classList.remove("ring-2", "ring-blue-400");
  });
  event.target.classList.add("ring-2", "ring-blue-400");
}

// Create new element
function createElement(event) {
  event.preventDefault();

  const form = document.forms.elementForm;
  const elementName = form.elements.element.value;
  const text = form.elements.text.value;

  if (!elementName || !text) {
    showToast("Please fill all fields", "error");
    return;
  }

  // Create element
  const tag = document.createElement(elementName);
  tag.innerHTML = text;
  tag.className = "preview-element";

  // Apply styles
  const textColor = document.getElementById("textColor").value;
  const bgColor = document.getElementById("bgColor").value;
  const addBorder = document.getElementById("addBorder").checked;

  tag.style.color = textColor;
  tag.style.backgroundColor = bgColor + "20"; // Add transparency
  tag.style.border = addBorder ? `2px solid ${bgColor}` : "none";
  tag.style.padding = "15px";
  tag.style.borderRadius = "8px";
  tag.style.margin = "10px 0";

  // Add metadata
  tag.dataset.id = Date.now();
  tag.dataset.type = elementName;
  tag.dataset.content = text;

  // Add delete button to element
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
  deleteBtn.className =
    "absolute top-2 right-2 text-red-400 hover:text-red-300 transition opacity-0 group-hover:opacity-100";
  deleteBtn.onclick = function () {
    deleteElement(tag.dataset.id);
  };

  const wrapper = document.createElement("div");
  wrapper.className = "relative group";
  wrapper.appendChild(tag);
  wrapper.appendChild(deleteBtn);

  // Add to result container
  const resultDiv = document.getElementById("result");
  resultDiv.appendChild(wrapper);

  // Hide empty state
  document.getElementById("emptyState").style.display = "none";

  // Update element count
  totalElements++;
  updateStats();

  // Save to storage
  elements.push({
    id: tag.dataset.id,
    type: elementName,
    content: text,
    styles: { textColor, bgColor, addBorder },
  });
  saveToStorage();

  // Update code preview
  updateCodePreview();

  // Show success message
  showToast(`${elementName.toUpperCase()} element created successfully!`);

  // Clear form
  form.reset();
}

// Delete element
function deleteElement(id) {
  const element = document.querySelector(`[data-id="${id}"]`);
  if (element) {
    element.parentElement.remove();

    // Remove from array
    elements = elements.filter((el) => el.id !== id);
    saveToStorage();

    // Update stats
    totalElements = elements.length;
    updateStats();
    updateCodePreview();

    // Show empty state if no elements
    if (totalElements === 0) {
      document.getElementById("emptyState").style.display = "block";
    }

    showToast("Element deleted", "warning");
  }
}

// Clear all elements
function clearAll() {
  if (confirm("Are you sure you want to delete all elements?")) {
    document.getElementById("result").innerHTML = "";
    elements = [];
    totalElements = 0;
    saveToStorage();
    updateStats();
    updateCodePreview();
    document.getElementById("emptyState").style.display = "block";
    showToast("All elements cleared", "warning");
  }
}

// Export HTML
function exportHTML() {
  const htmlContent = document.getElementById("result").innerHTML;
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "generated-elements.html";
  a.click();
  showToast("HTML exported successfully!");
}

// Toggle edit mode
function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById("editModeBtn");
  if (editMode) {
    btn.innerHTML = '<i class="fas fa-times mr-2"></i> Exit Edit Mode';
    btn.classList.add("bg-red-500/20", "text-red-300", "border-red-400/30");
    btn.classList.remove(
      "bg-purple-500/20",
      "text-purple-300",
      "border-purple-400/30"
    );
    showToast("Edit mode enabled - click elements to edit");
  } else {
    btn.innerHTML = '<i class="fas fa-edit mr-2"></i> Edit Mode';
    btn.classList.remove("bg-red-500/20", "text-red-300", "border-red-400/30");
    btn.classList.add(
      "bg-purple-500/20",
      "text-purple-300",
      "border-purple-400/30"
    );
  }
}

// Update stats
function updateStats() {
  document.getElementById("totalElements").textContent = totalElements;
  document.getElementById(
    "elementCount"
  ).textContent = `${totalElements} element${totalElements !== 1 ? "s" : ""}`;

  if (elements.length > 0) {
    const last = elements[elements.length - 1];
    document.getElementById("lastElement").textContent = `<${last.type}>`;
  }
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

// Copy code to clipboard
function copyCode() {
  const code = document.getElementById("codePreview").textContent;
  navigator.clipboard
    .writeText(code.replace(/&lt;/g, "<").replace(/&gt;/g, ">"))
    .then(() => showToast("Code copied to clipboard!"))
    .catch(() => showToast("Failed to copy code", "error"));
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  // Set message and color
  toastMessage.textContent = message;
  toast.className = toast.className.replace(/bg-(green|red|yellow)-600/, "");

  switch (type) {
    case "error":
      toast.classList.add("bg-red-600");
      break;
    case "warning":
      toast.classList.add("bg-yellow-600");
      break;
    default:
      toast.classList.add("bg-green-600");
  }

  // Show toast
  toast.classList.remove("hidden");
  toast.classList.remove("translate-y-16");
  toast.classList.add("translate-y-0");

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("translate-y-0");
    toast.classList.add("translate-y-16");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 3000);
}

// Save to localStorage
function saveToStorage() {
  localStorage.setItem("htmlElements", JSON.stringify(elements));
}

// Load from localStorage
function loadFromStorage() {
  const saved = localStorage.getItem("htmlElements");
  if (saved) {
    elements = JSON.parse(saved);
    totalElements = elements.length;

    // Recreate elements
    elements.forEach((el) => {
      const form = document.forms.elementForm;
      form.elements.element.value = el.type;
      form.elements.text.value = el.content;

      // Trigger creation without showing toast
      const tempEvent = { preventDefault: () => {} };
      createElement(tempEvent);
    });

    // Clear form
    form.reset();

    if (totalElements > 0) {
      document.getElementById("emptyState").style.display = "none";
      updateStats();
      updateCodePreview();
    }
  }
}

// Search elements
document
  .getElementById("searchElements")
  .addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const elements = document.querySelectorAll(".preview-element");

    elements.forEach((el) => {
      const content = el.textContent.toLowerCase();
      const type = el.tagName.toLowerCase();

      if (content.includes(searchTerm) || type.includes(searchTerm)) {
        el.parentElement.style.display = "block";
      } else {
        el.parentElement.style.display = "none";
      }
    });
  });
