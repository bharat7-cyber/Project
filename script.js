/* ==========================================================
   श्री सिद्धिविनायक गणेश उत्सव मंडल — script.js
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- helpers ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const toHindiDigits = (n) => String(n).replace(/\d/g, d => '०१२३४५६७८९'[d]);

  /* =====================================================
     1. PREMIUM LOADER
  ===================================================== */
  const loader = $('#loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('loaded'), 1500);
  });
  // fallback in case load event already fired
  setTimeout(() => loader.classList.add('loaded'), 3200);

  /* =====================================================
     2. PARTICLE CANVAS (ambient golden particles + cursor/touch trail)
  ===================================================== */
  const pCanvas = $('#particle-canvas');
  const pCtx = pCanvas.getContext('2d');
  let particles = [];
  const maxAmbient = 40;

  function resizeCanvases() {
    [pCanvas, $('#petal-canvas'), $('#cursor-canvas')].forEach(c => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    });
  }
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  function spawnAmbientParticle() {
    return {
      x: Math.random() * pCanvas.width,
      y: pCanvas.height + 10,
      r: Math.random() * 1.8 + 0.6,
      speed: Math.random() * 0.5 + 0.15,
      drift: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
      life: 0
    };
  }
  for (let i = 0; i < maxAmbient; i++) particles.push(spawnAmbientParticle());

  function drawParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      p.life += 1;
      pCtx.beginPath();
      pCtx.fillStyle = `rgba(246,214,122,${p.alpha})`;
      pCtx.shadowColor = 'rgba(232,114,12,0.8)';
      pCtx.shadowBlur = 6;
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fill();
      if (p.y < -10) Object.assign(p, spawnAmbientParticle());
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ---------- interactive golden particles on move/touch ---------- */
  let burstParticles = [];
  function addBurst(x, y) {
    for (let i = 0; i < 2; i++) {
      burstParticles.push({
        x, y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.3,
        r: Math.random() * 2 + 1,
        alpha: 1
      });
    }
    if (burstParticles.length > 160) burstParticles.splice(0, burstParticles.length - 160);
  }
  function drawBurst() {
    pCtx.save();
    burstParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.018;
      pCtx.beginPath();
      pCtx.fillStyle = `rgba(255,205,110,${Math.max(p.alpha,0)})`;
      pCtx.shadowColor = 'rgba(255,154,61,0.9)';
      pCtx.shadowBlur = 8;
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fill();
    });
    burstParticles = burstParticles.filter(p => p.alpha > 0);
    pCtx.restore();
    requestAnimationFrame(drawBurst);
  }
  drawBurst();

  let lastBurst = 0;
  function handleMove(x, y) {
    const now = Date.now();
    if (now - lastBurst > 45) { addBurst(x, y); lastBurst = now; }
  }
  window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  /* =====================================================
     3. GOLDEN CURSOR TRAIL (desktop only)
  ===================================================== */
  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isDesktop) {
    const cCanvas = $('#cursor-canvas');
    const cCtx = cCanvas.getContext('2d');
    let trail = [];
    window.addEventListener('mousemove', (e) => {
      trail.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (trail.length > 24) trail.shift();
    });
    function drawTrail() {
      cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
      trail.forEach((t, i) => {
        t.life -= 0.045;
        if (t.life <= 0) return;
        cCtx.beginPath();
        cCtx.fillStyle = `rgba(212,175,55,${t.life * 0.5})`;
        cCtx.shadowColor = 'rgba(246,214,122,0.9)';
        cCtx.shadowBlur = 10;
        cCtx.arc(t.x, t.y, (i / trail.length) * 4 + 1, 0, Math.PI * 2);
        cCtx.fill();
      });
      trail = trail.filter(t => t.life > 0);
      requestAnimationFrame(drawTrail);
    }
    drawTrail();
  }

  /* =====================================================
     4. FALLING FLOWER PETALS
  ===================================================== */
  const flCanvas = $('#petal-canvas');
  const flCtx = flCanvas.getContext('2d');
  let petals = [];
  const petalColors = ['#e8720c', '#f6a24d', '#d4af37', '#f3d1a0'];

  function spawnPetal() {
    return {
      x: Math.random() * flCanvas.width,
      y: -20,
      size: Math.random() * 7 + 5,
      speed: Math.random() * 0.9 + 0.4,
      drift: Math.random() * 1 - 0.5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.05,
      color: petalColors[Math.floor(Math.random() * petalColors.length)]
    };
  }
  let petalBurstActive = true;
  for (let i = 0; i < 18; i++) petals.push(spawnPetal());

  function drawPetals() {
    flCtx.clearRect(0, 0, flCanvas.width, flCanvas.height);
    petals.forEach(p => {
      p.y += p.speed;
      p.x += Math.sin(p.y * 0.01) * p.drift * 0.6;
      p.angle += p.spin;
      flCtx.save();
      flCtx.translate(p.x, p.y);
      flCtx.rotate(p.angle);
      flCtx.fillStyle = p.color;
      flCtx.globalAlpha = 0.75;
      flCtx.beginPath();
      flCtx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      flCtx.fill();
      flCtx.restore();
      if (p.y > flCanvas.height + 20) Object.assign(p, spawnPetal(), { y: -20 });
    });
    requestAnimationFrame(drawPetals);
  }
  drawPetals();

  function petalShower(count = 60) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => petals.push(spawnPetal()), i * 25);
    }
  }

  /* =====================================================
     5. OPENING SEQUENCE — divine doors
  ===================================================== */
  const openBtn = $('#open-door-btn');
  const openingScreen = $('#opening-screen');
  const doors = $('#temple-doors');
  const bellSound = $('#bell-sound');
  const mainSite = $('#main-site');

  function revealMainSite() {
    mainSite.classList.remove('hidden');
    document.body.style.overflow = 'auto';
    setTimeout(() => {
      $('#ganpati-img').classList.add('revealed');
      $('#mandal-emblem').classList.add('revealed');
      $('.hero-title').classList.add('revealed');
      $('.hero-tagline').classList.add('revealed');
      $('.hero-scroll-hint').classList.add('revealed');
    }, 300);
    initScrollReveal();
  }

  document.body.style.overflow = 'hidden';

  openBtn.addEventListener('click', () => {
    try { bellSound.currentTime = 0; bellSound.play().catch(() => {}); } catch (e) {}
    openingScreen.classList.add('fade-out');
    doors.classList.add('active');
    petalShower(40);

    requestAnimationFrame(() => {
      setTimeout(() => doors.classList.add('opening'), 80);
    });

    setTimeout(() => {
      doors.style.visibility = 'hidden';
      revealMainSite();
      window.scrollTo(0, 0);
    }, 2400);
  });

  /* Easter egg: tap ॐ three times => flower shower */
  let omTapCount = 0;
  let omTapTimer = null;
  $('#om-tap').addEventListener('click', () => {
    omTapCount++;
    clearTimeout(omTapTimer);
    omTapTimer = setTimeout(() => { omTapCount = 0; }, 1200);
    if (omTapCount >= 3) {
      petalShower(90);
      omTapCount = 0;
    }
  });

  /* =====================================================
     6. MUSIC TOGGLE
  ===================================================== */
  const musicBtn = $('#music-toggle');
  const bgMusic = $('#bg-music');
  let musicOn = false;
  musicBtn.addEventListener('click', () => {
    musicOn = !musicOn;
    if (musicOn) {
      bgMusic.play().catch(() => {});
      musicBtn.classList.remove('muted');
    } else {
      bgMusic.pause();
      musicBtn.classList.add('muted');
    }
  });
  musicBtn.classList.add('muted');

  /* =====================================================
     7. PARALLAX ON GANPATI HERO IMAGE
  ===================================================== */
  const parallaxWrap = $('#parallax-ganpati');
  function applyParallax(x, y) {
    const relX = (x / window.innerWidth - 0.5) * 14;
    const relY = (y / window.innerHeight - 0.5) * 10;
    parallaxWrap.style.transform = `translate(${relX}px, ${relY}px) scale(1.04)`;
  }
  window.addEventListener('mousemove', (e) => applyParallax(e.clientX, e.clientY));
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      parallaxWrap.style.transform += ` translateY(${scrollY * 0.15}px)`;
    }
  });

  /* =====================================================
     8. SCROLL REVEAL for sections
  ===================================================== */
  function initScrollReveal() {
    const revealEls = $$('.reveal-section');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.18 });
    revealEls.forEach(el => io.observe(el));

    /* side nav active state */
    const navDots = $$('.nav-dot');
    const sectionIds = ['hero','mandal-intro','aadhar-stambh','countdown','yatra','safar','karyakram','gallery','invitation','location'];
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navDots.forEach(d => d.classList.remove('active'));
          const dot = document.querySelector(`.nav-dot[href="#${entry.target.id}"]`);
          if (dot) dot.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) navIo.observe(el);
    });
  }

  /* =====================================================
     9. YATRA THREAD PROGRESS + STAGE ACTIVATION
  ===================================================== */
  const yatraTrack = $('.yatra-track');
  const threadFill = $('#thread-fill');
  const stages = $$('.yatra-stage');

  function updateYatra() {
    if (!yatraTrack) return;
    const rect = yatraTrack.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.65;
    const total = rect.height;
    let progressPx = viewportCenter - rect.top;
    progressPx = Math.max(0, Math.min(progressPx, total));
    const pct = total > 0 ? (progressPx / total) * 100 : 0;
    threadFill.style.height = pct + '%';

    stages.forEach(stage => {
      const sRect = stage.getBoundingClientRect();
      if (sRect.top < viewportCenter) stage.classList.add('active');
      else stage.classList.remove('active');
    });
  }
  window.addEventListener('scroll', updateYatra);
  window.addEventListener('resize', updateYatra);

  /* =====================================================
     9B. बप्पा के आगमन का सफर — INTERACTIVE GLOWING TIMELINE
  ===================================================== */
  const safarSteps = $$('.safar-step');
  const safarPanels = $$('.safar-panel');
  const safarFill = $('#safar-progress-fill');

  function setSafarStep(idx) {
    safarSteps.forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
      btn.classList.toggle('completed', i < idx);
      btn.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    safarPanels.forEach((panel, i) => {
      panel.classList.toggle('active', i === idx);
    });
    if (safarFill) {
      const pct = safarSteps.length > 1 ? (idx / (safarSteps.length - 1)) * 100 : 0;
      safarFill.style.width = pct + '%';
    }
  }

  safarSteps.forEach((btn, i) => {
    btn.addEventListener('click', () => setSafarStep(i));
  });

  if (safarSteps.length) setSafarStep(0);

  /* =====================================================
     10. SMART COUNTDOWN
  ===================================================== */
  const PAAT_POOJAN = new Date('2026-07-05T09:00:00+05:30');
  const BAPPA_AAGMAN = new Date('2026-09-14T06:00:00+05:30');

  const cdEyebrow = $('#countdown-eyebrow');
  const cdTitle = $('#countdown-title');
  const cdDate = $('#countdown-date');
  const paatCd = $('#countdown-date');

  function currentTarget() {
    const now = new Date();
    if (now < PAAT_POOJAN) {
      return { date: PAAT_POOJAN, title: 'पाट पूजन', dateLabel: '५ जुलाई २०२६', eyebrow: '॥ प्रतीक्षा ॥' };
    }
    return { date: BAPPA_AAGMAN, title: 'बप्पा का भव्य आगमन', dateLabel: '१४ सितंबर २०२६', eyebrow: '॥ प्रतीक्षा ॥' };
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const target = currentTarget();
    cdTitle.textContent = target.title;
    cdDate.textContent = target.dateLabel;
    cdEyebrow.textContent = target.eyebrow;

    const now = new Date();
    let diff = target.date - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    $('#cd-days').textContent = toHindiDigits(pad2(days));
    $('#cd-hours').textContent = toHindiDigits(pad2(hours));
    $('#cd-mins').textContent = toHindiDigits(pad2(mins));
    $('#cd-secs').textContent = toHindiDigits(pad2(secs));
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =====================================================
     11. तिथि सुरक्षित करें — download .ics calendar file
  ===================================================== */
  $('#save-date-btn').addEventListener('click', () => {
    const target = currentTarget();
    const start = target.date;
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${target.title} - श्री सिद्धिविनायक गणेश उत्सव मंडल`,
      'LOCATION:हनुमान मंदिर, हेमू कॉलोनी, जरीपटका, नागपुर',
      'DESCRIPTION:श्री सिद्धिविनायक गणेश उत्सव मंडल में आपका हार्दिक स्वागत है।',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ganesh-Utsav-Mandal.ics';
    a.click();
    URL.revokeObjectURL(url);
  });

  /* =====================================================
     12. LOCATION LINKS
  ===================================================== */
  const LAT = 21.1795, LNG = 79.1275; // approx Jaripatka, Nagpur
  const mapsQuery = encodeURIComponent('हनुमान मंदिर, हेमू कॉलोनी, जरीपटका, नागपुर');
  $('#route-btn').href = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
  $('#maps-btn').href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  /* =====================================================
     13. WHATSAPP INVITE SHARE
  ===================================================== */
  const waMessage = encodeURIComponent(
    'श्री सिद्धिविनायक गणेश उत्सव मंडल 🙏\n' +
    'बप्पा के भव्य आगमन उत्सव में आपका हार्दिक स्वागत है।\n' +
    'पाट पूजन: ५ जुलाई २०२६ | आगमन: १४ सितंबर २०२६\n' +
    'स्थान: हनुमान मंदिर, हेमू कॉलोनी, जरीपटका, नागपुर\n' +
    'गणपति बप्पा मोरया! 🐘'
  );
  $('#whatsapp-invite-btn').addEventListener('click', () => {
    window.open(`https://wa.me/?text=${waMessage}`, '_blank');
  });

  /* =====================================================
     14. DIGITAL PERSONALIZED INVITATION
  ===================================================== */
  const nameInput = $('#visitor-name');
  const generateBtn = $('#generate-invite-btn');
  const inviteCardWrap = $('#invite-card-wrap');
  const inviteMsg = $('#invite-msg');

  generateBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      nameInput.style.borderColor = '#e8720c';
      setTimeout(() => nameInput.style.borderColor = '', 900);
      return;
    }
    inviteMsg.textContent = `${name}, श्री सिद्धिविनायक के भव्य आगमन उत्सव में आपका हार्दिक स्वागत है।`;
    inviteCardWrap.classList.remove('hidden');
    inviteCardWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    petalShower(24);
  });

  $('#share-invite-btn').addEventListener('click', () => {
    const name = nameInput.value.trim() || 'भक्त';
    const msg = encodeURIComponent(
      `${name}, श्री सिद्धिविनायक के भव्य आगमन उत्सव में आपका हार्दिक स्वागत है। 🙏\n` +
      'पाट पूजन: ५ जुलाई २०२६ | आगमन: १४ सितंबर २०२६\n' +
      'स्थान: हनुमान मंदिर, हेमू कॉलोनी, जरीपटका, नागपुर\n' +
      'गणपति बप्पा मोरया! 🐘'
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  });

  /* =====================================================
     15. LOTUS PETALS FOR EMBLEM SVG (drawn dynamically)
  ===================================================== */
  const lotusGroup = document.getElementById('lotus-petals');
  if (lotusGroup) {
    const n = 16;
    for (let i = 0; i < n; i++) {
      const angle = (360 / n) * i;
      const petal = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      petal.setAttribute('d', 'M0,-70 C6,-58 6,-50 0,-44 C-6,-50 -6,-58 0,-70 Z');
      petal.setAttribute('transform', `rotate(${angle})`);
      lotusGroup.appendChild(petal);
    }
  }

});
