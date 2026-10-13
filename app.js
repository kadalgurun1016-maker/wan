(function () {
    "use strict";

    var LOADER_DURATION = 1100;
    var nav = document.getElementById("navbar");
    var navToggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");
    var linkList = Array.prototype.slice.call(
        navLinks.querySelectorAll("a.nav-link")
    );

    /* ---------- Loader ---------- */
    window.addEventListener("DOMContentLoaded", function () {
        var loader = document.querySelector(".loader");
        if (!loader) return;

        var hide = function () {
            loader.classList.add("is-hidden");
            document.body.classList.remove("is-loading");
            document.removeEventListener("load", onLoad);
            window.removeEventListener("pageshow", onLoad);
        };

        var onLoad = function () {
            setTimeout(hide, LOADER_DURATION);
        };

        var loaded = document.readyState === "complete";
        if (loaded) {
            setTimeout(hide, LOADER_DURATION);
        } else {
            document.addEventListener("load", onLoad);
            window.addEventListener("pageshow", onLoad);
        }
    });

    /* ---------- Smooth scroll for same-origin anchors ---------- */
    linkList.forEach(function (link) {
        link.addEventListener("click", function (e) {
            var href = link.getAttribute("href");
            if (!href || href.charAt(0) !== "#") return;
            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            var offset = 0;
            if (nav && nav.offsetHeight) {
                offset = nav.offsetHeight + 12;
            }
            var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: "smooth" });

            history.replaceState(null, "", href);
        });
    });

    /* ---------- Navbar state ---------- */
    var lastScrollY = window.scrollY;
    var ticking = false;

    function updateNav() {
        if (!nav) return;
        var y = window.scrollY;
        var isScrolled = y > 24;
        nav.classList.toggle("scrolled", isScrolled);
        lastScrollY = y;
        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });

    updateNav();

    /* ---------- Mobile nav toggle ---------- */
    if (navToggle) {
        navToggle.addEventListener("click", function () {
            var open = navToggle.classList.toggle("open");
            navLinks.classList.toggle("open", open);
            navToggle.setAttribute(
                "aria-expanded",
                open ? "true" : "false"
            );
        });
    }

    /* ---------- Active link based on scroll ---------- */
    function setActiveLink() {
        if (!navLinks || linkList.length === 0) return;
        var sections = linkList.map(function (link) {
            var id = link.getAttribute("data-link") || "";
            var el = id ? document.getElementById(id) : null;
            if (!el) return null;
            var top = el.getBoundingClientRect().top;
            var offset = 200;
            return { link: link, top: top - offset };
        }).filter(function (s) { return s !== null; });

        var current = null;
        if (sections.length > 0) {
            var firstAbove = sections.filter(function (s) { return s.top <= 0; });
            current = firstAbove.length > 0 ? firstAbove[firstAbove.length - 1] : sections[0];
        }

        linkList.forEach(function (link) {
            link.classList.toggle("active", link === current);
        });
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(setActiveLink);
            ticking = true;
        }
    }, { passive: true });

    setActiveLink();

    /* ---------- Close mobile nav on link tap ---------- */
    linkList.forEach(function (link) {
        link.addEventListener("click", function () {
            if (navLinks.classList.contains("open")) {
                navToggle.classList.remove("open");
                navLinks.classList.remove("open");
                if (navToggle) navToggle.setAttribute("aria-expanded", "false");
            }
        });
    });

    /* ---------- Close mobile nav on outside scroll/tap ---------- */
    document.addEventListener("click", function (e) {
        if (!navLinks || !navLinks.classList.contains("open")) return;
        if (navToggle && navToggle.contains(e.target)) return;
        if (navLinks.contains(e.target)) return;
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    });

    /* ---------- Scroll reveal ---------- */
    var revealEls = Array.prototype.slice.call(
        document.querySelectorAll(".reveal")
    );
    if (revealEls.length > 0) {
        var revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
        );

        revealEls.forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    /* ---------- Contact form validation ---------- */
    var form = document.querySelector(".contact-form");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showMsg(name, msg) {
        var msgEl = form.querySelector("[data-msg=" + name + "]");
        if (!msgEl) return;
        msgEl.textContent = msg || "";
        msgEl.classList.toggle("is-visible", msg && msg.length > 0);
    }

    function setInvalid(name, invalid) {
        var input = form.querySelector("[name=" + name + "]");
        if (!input) return;
        input.classList.toggle("is-invalid", invalid);
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var name = form.querySelector("#name").value.trim();
            var email = form.querySelector("#email").value.trim();
            var message = form.querySelector("#message").value.trim();

            var valid = true;

            if (!name) {
                setInvalid("name", true);
                showMsg("name", "Nama tidak boleh kosong.");
                valid = false;
            } else {
                setInvalid("name", false);
                showMsg("name", "");
            }

            if (!email) {
                setInvalid("email", true);
                showMsg("email", "Email tidak boleh kosong.");
                valid = false;
            } else if (!emailRe.test(email)) {
                setInvalid("email", true);
                showMsg("email", "Format email tidak sesuai.");
                valid = false;
            } else {
                setInvalid("email", false);
                showMsg("email", "");
            }

            if (!message) {
                setInvalid("message", true);
                showMsg("message", "Pesan tidak boleh kosong.");
                valid = false;
            } else {
                setInvalid("message", false);
                showMsg("message", "");
            }

            if (!valid) return;

            var btn = form.querySelector(".btn-full");
            var originalText = btn.textContent;
            var btnParent = btn.parentNode;
            if (btn) {
                btn.disabled = true;
                btn.textContent = "Mengirim...";
            }

            setTimeout(function () {
                if (btnParent) {
                    var success = document.createElement("div");
                    success.className = "form-success";
                    success.style.cssText =
                        "padding:12px 14px;background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.4);border-radius:10px;color:#34d399;font-size:14px;";
                    success.textContent = "Pesan terkirim. Terima kasih!";
                    btnParent.insertBefore(success, btn);
                }
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
                form.reset();
                linkList.forEach(function (link) {
                    link.classList.remove("is-invalid");
                });
                document.querySelectorAll(".field-msg").forEach(function (el) {
                    el.textContent = "";
                    el.classList.remove("is-visible");
                });
            }, 900);
        });

        /* Clear invalid state on input */
        form.addEventListener("input", function (e) {
            var el = e.target;
            var name = el.name;
            if (!name) return;
            var invalid = el.classList.contains("is-invalid");
            if (invalid && el.value.trim().length > 0) {
                el.classList.remove("is-invalid");
                showMsg(name, "");
            }
        });
    }
})();