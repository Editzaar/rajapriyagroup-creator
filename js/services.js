/* =========================================================
   SERVICES PAGE SCRIPT
   Smooth-highlights the service section matched by the
   page's URL hash (e.g. services.html#construction) so a
   visitor arriving from a footer/home link lands on the
   right block with a brief gold outline cue.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);
  if (!target) return;

  target.classList.add('is-highlighted');
  setTimeout(() => target.classList.remove('is-highlighted'), 1800);
});
