/* =========================================================
   HOME PAGE SCRIPT — testimonial slider
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsWrap = document.getElementById('testimonialDots');
  if (!slides.length || !dotsWrap) return;

  let current = 0;
  let timer = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('button');

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    restartTimer();
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }

  restartTimer();
});
