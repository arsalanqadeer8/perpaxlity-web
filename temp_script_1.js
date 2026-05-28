

    function initScrollReveals() {
      const items = document.querySelectorAll('.reveal');
      if (!items.length) return;
      if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in-view')); return; }
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); } });
      }, { threshold: .16 });
      items.forEach(el => io.observe(el));
    }
    window.addEventListener('load', initScrollReveals);
    /* -- HERO SLIDESHOW -- */
    let _hsIdx = 0;
    let _hsTimer = null;

    function goSlide(n) {
      const slides = document.querySelectorAll('.hs-slide');
      const dots = document.querySelectorAll('.hs-dot');
      if (!slides.length) return;
      slides[_hsIdx]?.classList.remove('active');
      dots[_hsIdx]?.classList.remove('active');
      _hsIdx = (n + slides.length) % slides.length;
      slides[_hsIdx]?.classList.add('active');
      dots[_hsIdx]?.classList.add('active');
    }

    function changeSlide(dir) {
      clearInterval(_hsTimer);
      goSlide(_hsIdx + dir);
      startHsTimer();
    }

    function startHsTimer() {
      clearInterval(_hsTimer);
      _hsTimer = setInterval(() => goSlide(_hsIdx + 1), 4500);
    }

    startHsTimer();
    async function forgotPassword() {
      const em = (document.getElementById('l-email').value || '').trim().toLowerCase();
      if (!em || !em.includes('@')) { showToast('Enter your email first, then click Forgot Password', 'tw2', 4000); return; }
      if (!_sb) { showToast('Supabase Auth not configured', 'te'); return; }
      try {
        const { error } = await _sb.auth.resetPasswordForEmail(em);
        if (error) { showToast(error.message || 'Could not send reset email', 'te', 5000); return; }
        showToast('Password reset email sent! Check your inbox.', 'ts', 5000);
      } catch (e) { showToast('Network error. Try again.', 'te'); }
    }

