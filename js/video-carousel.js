/* =========================================================
   RAJA PRIYA GROUP — VIDEO CAROUSEL, AUDIO TOGGLE & AUTO-PLAY
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const videoCards = document.querySelectorAll('.carousel-video-card');

  videoCards.forEach(card => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.reel-play-overlay');
    const soundBtn = card.querySelector('.sound-toggle-btn');

    if (!video) return;

    // Remove stale broken image error handler on video parent
    if (card.classList.contains('img-fallback')) {
      card.classList.remove('img-fallback');
    }

    // Toggle Sound Button
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent card click
        video.muted = !video.muted;
        if (video.muted) {
          soundBtn.innerHTML = '🔇 Muted';
          soundBtn.style.background = 'rgba(0,0,0,0.75)';
          soundBtn.style.color = '#fff';
        } else {
          soundBtn.innerHTML = '🔊 Sound ON';
          soundBtn.style.background = 'var(--gradient-gold)';
          soundBtn.style.color = '#000';
          // Ensure playing
          video.play().catch(() => {});
        }
      });
    }

    // Click card to Unmute and Play with Audio
    card.addEventListener('click', () => {
      video.muted = false;
      if (soundBtn) {
        soundBtn.innerHTML = '🔊 Sound ON';
        soundBtn.style.background = 'var(--gradient-gold)';
        soundBtn.style.color = '#000';
      }
      video.play().then(() => {
        if (playBtn) playBtn.style.opacity = '0';
      }).catch(err => console.log('Play error:', err));
    });

    // Desktop Hover Play (Muted by default to respect browser policies)
    card.addEventListener('mouseenter', () => {
      video.play().then(() => {
        if (playBtn) playBtn.style.opacity = '0';
      }).catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      if (playBtn) playBtn.style.opacity = '1';
    });
  });

  // Carousel Navigation Arrows
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
