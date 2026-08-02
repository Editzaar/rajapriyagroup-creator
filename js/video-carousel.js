/* =========================================================
   RAJA PRIYA GROUP — VIDEO CAROUSEL & AUTO-PLAY ON HOVER
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup Auto-Play on Hover / Tap for all video cards
  const videoCards = document.querySelectorAll('.carousel-video-card');

  videoCards.forEach(card => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.reel-play-overlay');

    if (!video) return;

    // Desktop hover play / pause
    card.addEventListener('mouseenter', () => {
      video.play().then(() => {
        if (playBtn) playBtn.style.opacity = '0';
      }).catch(err => console.log('Autoplay prevented:', err));
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      if (playBtn) playBtn.style.opacity = '1';
    });

    // Mobile tap play / pause toggle
    card.addEventListener('touchstart', () => {
      if (video.paused) {
        // pause other videos
        document.querySelectorAll('.carousel-video-card video').forEach(v => v.pause());
        video.play().then(() => {
          if (playBtn) playBtn.style.opacity = '0';
        }).catch(() => {});
      } else {
        video.pause();
        if (playBtn) playBtn.style.opacity = '1';
      }
    }, { passive: true });
  });

  // 2. Setup Carousel Navigation Arrows (Prev / Next)
  const carouselWrappers = document.querySelectorAll('.video-carousel-wrapper');

  carouselWrappers.forEach(wrapper => {
    const track = wrapper.querySelector('.video-carousel-track');
    const prevBtn = wrapper.querySelector('.carousel-nav-btn.prev');
    const nextBtn = wrapper.querySelector('.carousel-nav-btn.next');

    if (!track || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => {
      const scrollAmount = track.clientWidth * 0.8;
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      const scrollAmount = track.clientWidth * 0.8;
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  });
});
