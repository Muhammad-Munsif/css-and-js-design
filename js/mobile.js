// Mobile Menu Management
const MobileManager = {
  init() {
    this.setupEventListeners();
    this.cloneFormToMobile();
    this.detectTouchDevice();
  },

  setupEventListeners() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const closeMobileMenuBtn = document.getElementById("closeMobileMenu");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener("click", () => this.openMobileMenu());

      // Add touch feedback
      mobileMenuBtn.addEventListener("touchstart", () => {
        mobileMenuBtn.classList.add("active");
      });

      mobileMenuBtn.addEventListener("touchend", () => {
        setTimeout(() => mobileMenuBtn.classList.remove("active"), 150);
      });
    }

    if (closeMobileMenuBtn && mobileMenu) {
      closeMobileMenuBtn.addEventListener("click", () =>
        this.closeMobileMenu(),
      );

      // Also close on Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileMenu.style.display === "block") {
          this.closeMobileMenu();
        }
      });
    }

    if (mobileMenu) {
      // Close when clicking outside
      mobileMenu.addEventListener("click", (e) => {
        if (e.target === mobileMenu) {
          this.closeMobileMenu();
        }
      });

      // Prevent body scroll when menu is open
      mobileMenu.addEventListener(
        "touchmove",
        (e) => {
          if (e.target.classList.contains("mobile-menu-content")) {
            return;
          }
          e.preventDefault();
        },
        { passive: false },
      );
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        this.closeMobileMenu();
      }
    });
  },

  openMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    if (!mobileMenu) return;

    mobileMenu.style.display = "block";

    // Trigger reflow
    mobileMenu.offsetHeight;

    // Add active class with slight delay
    setTimeout(() => {
      mobileMenu.classList.add("active");
      document.body.style.overflow = "hidden";
    }, 10);
  },

  closeMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    if (!mobileMenu) return;

    mobileMenu.classList.remove("active");
    document.body.style.overflow = "";

    setTimeout(() => {
      mobileMenu.style.display = "none";
    }, 300);
  },

  cloneFormToMobile() {
    const mobileFormContainer = document.getElementById("mobileFormContainer");
    const desktopForm = document.getElementById("elementForm");

    if (!mobileFormContainer || !desktopForm) return;

    // Clone the form
    const formClone = desktopForm.cloneNode(true);
    formClone.id = "mobileElementForm";

    // Clear container and add cloned form
    mobileFormContainer.innerHTML = "";
    mobileFormContainer.appendChild(formClone);

    // Update button IDs and add mobile-specific classes
    const submitBtn = formClone.querySelector(".submit-btn");
    const clearBtn = formClone.querySelector(".clear-btn");

    if (submitBtn) {
      submitBtn.id = "mobileSubmitBtn";
      submitBtn.classList.add("mobile-submit-btn");
    }

    if (clearBtn) {
      clearBtn.id = "mobileClearBtn";
      clearBtn.onclick = () => {
        if (typeof clearAll === "function") {
          clearAll();
        }
        this.closeMobileMenu();
      };
    }

    // Add event listener for form submission
    formClone.addEventListener("submit", (e) => {
      e.preventDefault();

      if (typeof createElement === "function") {
        // Get values from mobile form
        const elementType = formClone.querySelector("#elementSelect").value;
        const content = formClone.querySelector("#contentInput").value;

        if (!elementType || !content) {
          if (typeof showToast === "function") {
            showToast("Please select element type and enter content", "error");
          }
          return;
        }

        // Update main form values
        document.getElementById("elementSelect").value = elementType;
        document.getElementById("contentInput").value = content;
        document.getElementById("textColor").value =
          formClone.querySelector("#textColor").value;
        document.getElementById("bgColor").value =
          formClone.querySelector("#bgColor").value;
        document.getElementById("addBorder").checked =
          formClone.querySelector("#addBorder").checked;

        // Create element
        createElement();
        this.closeMobileMenu();
      }
    });

    // Add click handlers for element buttons in mobile form
    const elementBtns = formClone.querySelectorAll(".element-btn");
    elementBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const elementType = e.target
          .closest(".element-btn")
          .classList[1].replace("-btn", "");
        formClone.querySelector("#elementSelect").value = elementType;

        // Highlight selected button
        elementBtns.forEach((b) =>
          b.classList.remove("selected", "ring-2", "ring-blue-500"),
        );
        e.target
          .closest(".element-btn")
          .classList.add("selected", "ring-2", "ring-blue-500");
      });
    });
  },

  detectTouchDevice() {
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    if (isTouchDevice) {
      document.body.classList.add("touch-device");

      // Improve touch experience
      document.querySelectorAll("button, .element-btn").forEach((btn) => {
        btn.classList.add("touch-target");
      });
    } else {
      document.body.classList.add("no-touch-device");
    }
  },

  updateMobileFormValues(elementType, content) {
    const mobileForm = document.getElementById("mobileElementForm");
    if (!mobileForm) return;

    const select = mobileForm.querySelector("#elementSelect");
    const input = mobileForm.querySelector("#contentInput");

    if (select) select.value = elementType;
    if (input) input.value = content;
  },
};

// Initialize mobile features when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => MobileManager.init());
} else {
  MobileManager.init();
}

// Export for use in other modules
window.MobileManager = MobileManager;
