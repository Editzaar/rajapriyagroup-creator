/* =========================================================
   RAJA PRIYA GROUP — COMMON SCRIPT
   Shared behaviour for every page: navbar, mobile menu,
   scroll-reveal animation. Page-specific JS lives in its
   own file (home.js, about.js, etc).
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar shrink on scroll ---- */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav toggle & Scrim Backdrop ---- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  let navScrim = document.getElementById('mobileNavScrim');

  if (!navScrim && navLinks) {
    navScrim = document.createElement('div');
    navScrim.id = 'mobileNavScrim';
    navScrim.className = 'mobile-nav-scrim';
    document.body.appendChild(navScrim);
  }

  function closeMobileMenu() {
    if (navLinks) navLinks.classList.remove('mobile-open');
    if (navToggle) navToggle.classList.remove('is-active');
    if (navScrim) navScrim.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      navToggle.classList.toggle('is-active', isOpen);
      if (navScrim) navScrim.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    if (navScrim) {
      navScrim.addEventListener('click', closeMobileMenu);
    }

    // Close menu when a link is tapped
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

});
