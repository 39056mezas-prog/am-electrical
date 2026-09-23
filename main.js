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

    if ("IntersectionObserver" in window) {
      var sentinel = document.createElement("div");
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.style.cssText = "position:absolute;top:40px;left:0;width:1px;height:1px;pointer-events:none;";
      document.body.prepend(sentinel);
      new IntersectionObserver(function (entries) {
        header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
      }).observe(sentinel);
    } else {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    }
  }

  /* ---------------------------------------------------------------
     Nav tab bar: keep the focused link in view.
     Chromium (and others) don't auto-scroll a horizontally-scrolling
     container when a child inside it receives keyboard focus, so
     tabbing past the visible edge leaves the focus ring half off-
     screen. block:"nearest" keeps this from also nudging the whole
     page vertically just because a header link was focused.
     --------------------------------------------------------------- */
  function initNavFocusScroll() {
    qsa(".site-header__nav a").forEach(function (link) {
      link.addEventListener("focus", function () {
        link.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    });
  }

  /* ---------------------------------------------------------------
     Hero parallax + scale (signature scroll moment).
     Implemented entirely in CSS via scroll-driven animations
     (animation-timeline: scroll()), see styles.css. No scroll
     listener needed here, this function only handles the fallback
     for browsers without CSS scroll-timeline support, and even then
     it only runs a rAF loop while the hero is actually on screen
     (gated by IntersectionObserver), never a bare scroll listener.
     --------------------------------------------------------------- */
  function initHeroParallax() {
    if (CSS && CSS.supports && CSS.supports("animation-timeline: scroll()")) return;
    var hero = qs(".hero");
    var media = qs(".hero__media", hero);
    if (!hero || !media || prefersReducedMotion || !("IntersectionObserver" in window)) return;

    var heroHeight = hero.offsetHeight;
    var rafId = null;

    function tick() {
      var y = window.scrollY;
      var progress = Math.min(Math.max(y / heroHeight, 0), 1);
      var translate = progress * heroHeight * 0.22;
      var scale = 1 + progress * 0.08;
      media.style.transform = "translate3d(0," + translate + "px,0) scale(" + scale + ")";
      rafId = window.requestAnimationFrame(tick);
    }

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (rafId === null) rafId = window.requestAnimationFrame(tick);
      } else if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }).observe(hero);

    window.addEventListener("resize", function () { heroHeight = hero.offsetHeight; }, { passive: true });
  }

  /* ---------------------------------------------------------------
     Persistent mobile emergency CTA, show once past the hero,
     hide again once the footer is reachable.
     --------------------------------------------------------------- */
  function initMobileEmergencyBar() {
    var bar = qs("#mobile-emergency-bar");
    // Full hero (homepage) or the shorter page-hero (secondary pages) ,
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
     Capability accordion, behavior only; rows are already in the
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
     Scroll reveal: section-level fade/rise as content enters the
     viewport. IntersectionObserver only, no scroll listener, fully
     skipped for prefers-reduced-motion. Motivated by hierarchy: it
     paces the page instead of dumping the whole section at once.
     --------------------------------------------------------------- */
  function initScrollReveal() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;
    var targets = qsa(
      ".section-pad, .section-pad-sm, .emergency-band, .page-cta-band, .emergency-split-card, .gallery-item"
    );
    if (!targets.length) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el, i) {
      el.classList.add("reveal");
      if (el.classList.contains("emergency-split-card") || el.classList.contains("gallery-item")) {
        el.style.transitionDelay = (i % 4) * 60 + "ms";
      }
      io.observe(el);
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
     (no backend on a static site, this is a real, working submit path)
     --------------------------------------------------------------- */
  function initContactForm() {
    var form = qs("#contact-form");
    if (!form) return;
    var status = qs("#form-status");

    // Footer/nav links to a specific service (e.g. /?service=Maintenance#contact)
    // land here with that service already chosen, so the visitor doesn't
    // have to pick it again themselves.
    var serviceField = qs("#field-service-type", form);
    if (serviceField) {
      var requested = new URLSearchParams(window.location.search).get("service");
      if (requested && qs('option[value="' + requested + '"]', serviceField)) {
        serviceField.value = requested;
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = new FormData(form);
      var subject = "Service request: " + (data.get("serviceType") || "General") + " (" + (data.get("propertyType") || "n/a") + ")";
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
     Gallery + lightbox, genuinely data-driven from content.js
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
        '<span class="gallery-item__cat">' + item.category + ", " + item.location + "</span>" +
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
      lbCatType.textContent = item.category + ", " + item.type;
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
    initNavFocusScroll();
    initHeroParallax();
    initMobileEmergencyBar();
    initCapabilityAccordion();
    initFooterYear();
    initGallery();
    initContactForm();
    initScrollReveal();
  });
})();
