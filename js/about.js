/* =========================================================
   ABOUT PAGE SCRIPT — animated milestone counters
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const counters = document.querySelectorAll('.milestone-num');
  if (!counters.length) return;

  const animate = (el) => {
    const raw = el.textContent.trim();      // e.g. "150+"
    const target = parseInt(raw, 10);
    const suffix = raw.replace(/[0-9]/g, '');
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => io.observe(el));
  }

});
