/* =========================================================
   PROJECTS PAGE SCRIPT — category filtering
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-full-card');
  const noResults = document.getElementById('noResults');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      cards.forEach(card => {
        const categories = card.dataset.category.split(' ');
        const matches = filter === 'all' || categories.includes(filter);
        card.classList.toggle('is-hidden', !matches);
        if (matches) visibleCount++;
      });

      noResults.hidden = visibleCount !== 0;
    });
  });

});
