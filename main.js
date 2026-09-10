(function () {
  "use strict";

  var C = window.AM_CONTENT;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------
     Header: transparent -> solid on scroll
     --------------------------------------------------------------- */
  function initHeader() {
    var header = qs(".site-header");
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = qs(".menu-toggle");
    var panel = qs("#mobile-menu");
    var header = qs(".site-header");
    var emergencyBar = qs("#mobile-emergency-bar");
    if (!toggle || !panel) return;

    // The persistent emergency bar sits behind the full-screen menu
    // panel visually (lower z-index) but stays in the DOM — without
    // this it would still be reachable by keyboard while hidden.
    function setBehindPanelFocusable(focusable) {
      if (!emergencyBar) return;
      var link = emergencyBar.tagName === "A" ? emergencyBar : qs("a", emergencyBar);
      if (!link) return;
      if (focusable) {
        link.removeAttribute("tabindex");
        emergencyBar.removeAttribute("aria-hidden");
      } else {
        link.setAttribute("tabindex", "-1");
        emergencyBar.setAttribute("aria-hidden", "true");
      }
    }

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      panel.classList.remove("is-open");
      header.classList.remove("menu-open");
      document.body.style.overflow = "";
      setBehindPanelFocusable(true);
    }
    function open() {
      toggle.setAttribute("aria-expanded", "true");
      panel.classList.add("is-open");
      header.classList.add("menu-open");
      document.body.style.overflow = "hidden";
      setBehindPanelFocusable(false);
      var firstLink = qs("a", panel);
      if (firstLink) firstLink.focus();
    }
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    });
    panel.addEventListener("click", function (e) {
      if (e.target.tagName === "A") close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") close();
    });
  }

  /* ---------------------------------------------------------------
     Hero parallax + scale (signature scroll moment)
     --------------------------------------------------------------- */
  function initHeroParallax() {
    var hero = qs(".hero");
    var media = qs(".hero__media", hero);
    if (!hero || !media || prefersReducedMotion) return;

    var ticking = false;
    var heroHeight = hero.offsetHeight;

    function update() {
      var y = window.scrollY;
      if (y < heroHeight * 1.15) {
        var progress = Math.min(y / heroHeight, 1);
        var translate = progress * heroHeight * 0.22;
        var scale = 1 + progress * 0.08;
        media.style.transform = "translate3d(0," + translate + "px,0) scale(" + scale + ")";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", function () { heroHeight = hero.offsetHeight; }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------
     Persistent mobile emergency CTA — show once past the hero,
     hide again once the footer is reachable.
     --------------------------------------------------------------- */
  function initMobileEmergencyBar() {
    var bar = qs("#mobile-emergency-bar");
    // Full hero (homepage) or the shorter page-hero (secondary pages) —
    // pages with neither (e.g. privacy.html) have nothing to scroll
    // past, so the bar can appear right away.
    var hero = qs(".hero") || qs(".page-hero");
    var footer = qs(".site-footer");
    if (!bar) return;

    var pastHero = !hero;
    var overFooter = false;
    function refresh() { bar.classList.toggle("is-visible", pastHero && !overFooter); }

    if ("IntersectionObserver" in window) {
      if (hero) {
        new IntersectionObserver(function (entries) {
          pastHero = !entries[0].isIntersecting;
          refresh();
        }, { rootMargin: "-90% 0px 0px 0px" }).observe(hero);
      }

      if (footer) {
        new IntersectionObserver(function (entries) {
          overFooter = entries[0].isIntersecting;
          refresh();
        }, { rootMargin: "0px" }).observe(footer);
      }
      refresh();
    } else {
      bar.classList.add("is-visible");
    }
  }

  /* ---------------------------------------------------------------
     Capability accordion — behavior only; rows are already in the
     markup for SEO/no-JS readability, this just wires the toggle.
     --------------------------------------------------------------- */
  function initCapabilityAccordion() {
    qsa(".cap-row__trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var row = trigger.closest(".cap-row");
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!expanded));
        if (row) row.setAttribute("data-open", String(!expanded));
      });
    });
  }

  /* ---------------------------------------------------------------
     Footer year
     --------------------------------------------------------------- */
  function initFooterYear() {
    var y = qs("#footer-year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------
     Contact form: validate + open a pre-filled email
     (no backend on a static site — this is a real, working submit path)
     --------------------------------------------------------------- */
  function initContactForm() {
    var form = qs("#contact-form");
    if (!form) return;
    var status = qs("#form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = new FormData(form);
      var subject = "Service request \u2014 " + (data.get("serviceType") || "General") + " (" + (data.get("propertyType") || "n/a") + ")";
      var bodyLines = [
        "Name: " + data.get("name"),
        "Phone: " + data.get("phone"),
        "Email: " + data.get("email"),
        "Service type: " + data.get("serviceType"),
        "Property/project type: " + data.get("propertyType"),
        "",
        "Message:",
        data.get("message")
      ];
      var mailto = "mailto:" + C.business.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      if (status) {
        status.textContent = "Opening your email app with these details filled in, addressed to " + C.business.email + "\u2026";
        status.classList.add("is-visible", "is-success");
      }
      window.location.href = mailto;
    });
  }

  /* ---------------------------------------------------------------
     Gallery + lightbox — genuinely data-driven from content.js
     --------------------------------------------------------------- */
  function initGallery() {
    var grid = qs("#gallery-grid");
    if (!grid || !C || !C.gallery) return;
    var items = C.gallery;

    items.forEach(function (item, i) {
      var wrap = document.createElement("div");
      wrap.className = "gallery-item";
      wrap.setAttribute("data-span", item.span || "");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-haspopup", "dialog");
      btn.setAttribute("aria-label", "Open larger image: " + item.type + ", " + item.category + ", " + item.location);
      btn.addEventListener("click", function () { openLightbox(i); });

      var img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt;
      img.width = item.width;
      img.height = item.height;
      img.loading = "lazy";
      img.decoding = "async";

      var meta = document.createElement("div");
      meta.className = "gallery-item__meta";
      meta.innerHTML =
        '<span class="gallery-item__cat">' + item.category + " \u2014 " + item.location + "</span>" +
        '<span class="gallery-item__type">' + item.type + "</span>";

      btn.appendChild(img);
      btn.appendChild(meta);
      wrap.appendChild(btn);
      grid.appendChild(wrap);
    });

    var lightbox = qs("#lightbox");
    var lbImg = qs("#lightbox-img");
    var lbCatType = qs("#lightbox-cattype");
    var lbLocation = qs("#lightbox-location");
    var lbCounter = qs("#lightbox-counter");
    var closeBtn = qs(".lightbox__close", lightbox);
    var prevBtn = qs(".lightbox__nav--prev", lightbox);
    var nextBtn = qs(".lightbox__nav--next", lightbox);
    var currentIndex = 0;
    var lastFocused = null;
    var touchStartX = null;

    function renderSlide(i) {
      var item = items[i];
      lbImg.src = item.full;
      lbImg.alt = item.alt;
      lbCatType.textContent = item.category + " \u2014 " + item.type;
      lbLocation.textContent = item.location;
      lbCounter.textContent = (i + 1) + " / " + items.length;
    }
    function openLightbox(i) {
      currentIndex = i;
      lastFocused = document.activeElement;
      renderSlide(currentIndex);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    }
    function show(delta) {
      currentIndex = (currentIndex + delta + items.length) % items.length;
      renderSlide(currentIndex);
    }
    function onKeydown(e) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") show(1);
      else if (e.key === "ArrowLeft") show(-1);
      else if (e.key === "Tab") {
        var focusables = [closeBtn, prevBtn, nextBtn];
        var idx = focusables.indexOf(document.activeElement);
        e.preventDefault();
        idx = e.shiftKey ? (idx - 1 + focusables.length) % focusables.length : (idx + 1) % focusables.length;
        focusables[idx].focus();
      }
    }

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", function () { show(-1); });
    nextBtn.addEventListener("click", function () { show(1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    lightbox.addEventListener("touchstart", function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) show(dx > 0 ? -1 : 1);
      touchStartX = null;
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMobileMenu();
    initHeroParallax();
    initMobileEmergencyBar();
    initCapabilityAccordion();
    initFooterYear();
    initGallery();
    initContactForm();
  });
})();
