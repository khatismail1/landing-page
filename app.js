/**
 * ============================================
 * نموذج الطلب + معرض الصور (Carousel)
 * Order Form + Image Gallery Carousel
 * ============================================
 */

// ─── الإعدادات ──────────────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqtrYOJut-XgqdkOqi7L7is0w1p-pW0k10Vvu29ubw0vx8LZYN1-ioKhGiD5oEkSg-/exec";
const PRODUCT_VALUE = 279;
const PRODUCT_CURRENCY = "MAD";

// ─── عناصر DOM ──────────────────────────────
const elements = {
  form: document.getElementById("orderForm"),
  submitBtn: document.getElementById("submitBtn"),
  nameInput: document.getElementById("name"),
  phoneInput: document.getElementById("phone"),
  addressInput: document.getElementById("address"),
  nameError: document.getElementById("nameError"),
  phoneError: document.getElementById("phoneError"),
  addressError: document.getElementById("addressError"),
  feedback: document.getElementById("formFeedback"),
};

// ─── تنظيف المدخلات ────────────────────────
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML.trim();
}

// ─── إظهار/إخفاء الأخطاء ───────────────────
function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add("input-error");
  errorEl.textContent = message;
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove("input-error");
  errorEl.textContent = "";
}

function clearAllErrors() {
  clearFieldError(elements.nameInput, elements.nameError);
  clearFieldError(elements.phoneInput, elements.phoneError);
  clearFieldError(elements.addressInput, elements.addressError);
}

// ─── رسائل التغذية الراجعة ─────────────────
function showFeedback(message, type) {
  elements.feedback.textContent = message;
  elements.feedback.className = "form-feedback";
  elements.feedback.classList.add(type === "error" ? "feedback-error" : "feedback-success");
}

function clearFeedback() {
  elements.feedback.textContent = "";
  elements.feedback.className = "form-feedback";
}

// ─── التحقق ─────────────────────────────────
function validateForm() {
  let isValid = true;
  clearAllErrors();

  const name = elements.nameInput.value.trim();
  const phone = elements.phoneInput.value.trim();
  const address = elements.addressInput.value.trim();

  if (!name) {
    showFieldError(elements.nameInput, elements.nameError, "السم الكامل لازم");
    isValid = false;
  } else if (name.length < 2) {
    showFieldError(elements.nameInput, elements.nameError, "السم لازم يكون على الأقل حرفين");
    isValid = false;
  }

  if (!phone) {
    showFieldError(elements.phoneInput, elements.phoneError, "نمرة التيليفون لازم");
    isValid = false;
  } else if (!/^[\d\s\-()+]{6,20}$/.test(phone)) {
    showFieldError(elements.phoneInput, elements.phoneError, "كتب نمرة تيليفون صحيحة");
    isValid = false;
  }

  if (!address) {
    showFieldError(elements.addressInput, elements.addressError, "العينوان ديال التوصيل لازم");
    isValid = false;
  } else if (address.length < 5) {
    showFieldError(elements.addressInput, elements.addressError, "كتب العينوان كامل");
    isValid = false;
  }

  return isValid;
}

// ─── حالة الزر ──────────────────────────────
function setButtonLoading(isLoading) {
  if (isLoading) {
    elements.submitBtn.disabled = true;
    elements.submitBtn.classList.add("is-loading");
  } else {
    elements.submitBtn.disabled = false;
    elements.submitBtn.classList.remove("is-loading");
  }
}

// ─── إرسال الطلب ───────────────────────────
// Google Apps Script doesn't return CORS headers, so we must use no-cors.
// With no-cors the response is "opaque" (unreadable) — that's expected and fine.
// We use a form-encoded URLSearchParams body because Google Apps Script
// reads e.parameter reliably from that format, unlike raw JSON in no-cors mode.
async function submitOrder(data) {
  // Send as URL-encoded form so GAS can read e.parameter.name / phone / address
  const body = new URLSearchParams({
    name:    data.name,
    phone:   data.phone,
    address: data.address,
  });

  await fetch(SCRIPT_URL, {
    method: "POST",
    mode:   "no-cors",   // required — GAS doesn't send CORS headers
    body:   body,
  });
  // no-cors gives an opaque response; we can't read it, but the request IS sent.
}

// ─── معالج الإرسال ─────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();
  clearFeedback();
  if (!validateForm()) return;

  const formData = {
    name: sanitize(elements.nameInput.value),
    phone: sanitize(elements.phoneInput.value),
    address: sanitize(elements.addressInput.value),
  };

  setButtonLoading(true);

  try {
    if (typeof fbq === "function") {
      fbq("track", "InitiateCheckout", {
        value: PRODUCT_VALUE,
        currency: PRODUCT_CURRENCY,
      });
    }

    await submitOrder(formData);
    showFeedback("الطلب تسلم مزيان!", "success");

    setTimeout(() => { window.location.href = "thankyou.html"; }, 600);

  } catch (error) {
    console.error("خطأ فالإرسال:", error);
    let msg = "حاجة مشات مزيان. حاول من جديد.";
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      msg = "مشكل فالنتا. شوف الكونيكسيون ديالك وحاول من جديد.";
    }
    showFeedback(msg, "error");
    setButtonLoading(false);
  }
}

// ─── مسح الأخطاء عند الكتابة ───────────────
function setupRealtimeValidation() {
  elements.nameInput.addEventListener("input", () => {
    clearFieldError(elements.nameInput, elements.nameError);
    clearFeedback();
  });
  elements.phoneInput.addEventListener("input", () => {
    clearFieldError(elements.phoneInput, elements.phoneError);
    clearFeedback();
  });
  elements.addressInput.addEventListener("input", () => {
    clearFieldError(elements.addressInput, elements.addressError);
    clearFeedback();
  });
}

// ═══════════════════════════════════════════════
// معرض الصور — Image Gallery Carousel
// ═══════════════════════════════════════════════

function initGallery() {
  const slides = document.querySelectorAll(".slide");
  const thumbs = document.querySelectorAll(".thumb");
  const counter = document.getElementById("slideCounter");
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");

  const video    = document.getElementById("productVideo");
  const muteBtn  = document.getElementById("muteBtn");
  const iconMuted = document.getElementById("iconMuted");
  const iconSound = document.getElementById("iconSound");

  if (!slides.length) return;

  let current = 0;
  const total = slides.length;
  let autoPlayInterval = null;

  // Pause/resume video based on which slide is active
  function syncVideo(index) {
    if (!video) return;
    if (index === 0) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;

    slides.forEach((s) => s.classList.remove("active"));
    thumbs.forEach((t) => t.classList.remove("active"));

    slides[index].classList.add("active");
    thumbs[index].classList.add("active");

    if (counter) counter.textContent = index + 1;
    current = index;
    syncVideo(index);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Thumbnail clicks
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      goTo(parseInt(thumb.dataset.thumb));
      resetAutoPlay();
    });
  });

  // Arrow navigation
  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); resetAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); resetAutoPlay(); });

  // Mute toggle button
  if (muteBtn && video) {
    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      iconMuted.style.display = video.muted ? "block" : "none";
      iconSound.style.display = video.muted ? "none"  : "block";
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { next(); resetAutoPlay(); }
    if (e.key === "ArrowRight") { prev(); resetAutoPlay(); }
  });

  // Swipe support for mobile (RTL aware)
  let touchStartX = 0;
  const display = document.getElementById("mainDisplay");
  if (display) {
    display.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    display.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        // RTL: swipe directions are inverted
        if (diff > 0) prev();
        else next();
        resetAutoPlay();
      }
    }, { passive: true });
  }

  // Auto-play carousel
  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      next();
    }, 4000);
  }

  function resetAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  // Start auto-play, pause on hover
  startAutoPlay();
  if (display) {
    display.addEventListener("mouseenter", stopAutoPlay);
    display.addEventListener("mouseleave", startAutoPlay);
  }
}

// ─── التشغيل ────────────────────────────────
function init() {
  if (elements.form) {
    elements.form.addEventListener("submit", handleFormSubmit);
    setupRealtimeValidation();
  }
  initGallery();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
