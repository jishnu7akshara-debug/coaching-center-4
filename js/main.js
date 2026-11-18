/* Disha Academy — interactions (vanilla JS, no libraries) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = () => innerWidth > 1100;

  /* ---------- image safety net: never show a broken image ---------- */
  $$('img').forEach(im => im.addEventListener('error', () => { im.style.opacity = 0; if (im.parentElement) im.parentElement.style.background = 'linear-gradient(135deg,#D6EFE2,#FFE2D7)'; }, { once: true }));

  /* ---------- hero word stagger ---------- */
  $$('#h1 .w > span').forEach((s, i) => s.style.transitionDelay = (0.08 + i * 0.09) + 's');

  /* ---------- LOADER: ring + words + doors ---------- */
  const startSite = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('go');
    setTimeout(startArches, 1600);
  };
  (() => {
    const loader = $('#loader');
    if (!loader || reduce) { if (loader) loader.remove(); startSite(); return; }
    const arc = $('#ldArc'), pct = $('#ldPct'), words = $('#ldWords');
    const imgs = $$('.hero img'); const total = imgs.length + 1; let got = 0;
    imgs.forEach(im => { if (im.complete && im.naturalWidth) got++; else { const f = () => got++; im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true }); } });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => got++);
    const t0 = performance.now(), MIN = 1900; let shown = 0, w = 0, finished = false;
    const wordTimer = setInterval(() => { w = Math.min(w + 1, 3); words.style.transform = `translateY(-${w * 24}px)`; }, 650);
    const iv = setInterval(() => {
      const el = performance.now() - t0;
      const target = Math.min(got / total, el / MIN) * 100;
      shown += (target - shown) * 0.14;
      arc.style.strokeDashoffset = 440 * (1 - shown / 100);
      pct.textContent = Math.round(shown) + '%';
      if (!finished && ((got >= total && el > MIN && shown > 98) || el > 8000)) {
        finished = true; clearInterval(iv); clearInterval(wordTimer);
        arc.style.strokeDashoffset = 0; pct.textContent = '100%'; words.style.transform = 'translateY(-72px)';
        setTimeout(() => { loader.classList.add('open'); setTimeout(startSite, 450); setTimeout(() => loader.remove(), 1400); }, 380);
      }
    }, 30);
  })();

  /* ---------- HERO ARCHES: wipe-up photo change every 4s ---------- */
  function startArches() {
    const arches = $$('#arches .arch');
    arches.forEach((a, ai) => {
      const imgs = $$('img', a), tag = $('.tag', a), tags = (a.dataset.tags || '').split('|');
      let i = 0;
      const step = () => {
        const prev = imgs[i]; i = (i + 1) % imgs.length; const next = imgs[i];
        imgs.forEach(im => im.classList.remove('was'));
        prev.classList.remove('on'); prev.classList.add('was');
        next.classList.add('on');
        setTimeout(() => prev.classList.remove('was'), 1150);
        if (tag && tags[i]) { tag.classList.add('swap'); setTimeout(() => { tag.textContent = tags[i]; tag.classList.remove('swap'); }, 400); }
      };
      setTimeout(() => setInterval(step, 4000), ai * 380);
    });
  }

  /* ---------- reveal + counters ---------- */
  const countUp = el => {
    const to = +el.dataset.to, t0 = performance.now(), d = 1800;
    const f = t => { const p = clamp((t - t0) / d, 0, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(to * e).toLocaleString('en-IN'); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('seen');
    $$('.cnt', el).forEach(countUp);
    io.unobserve(el);
  }), { threshold: .14, rootMargin: '0px 0px -50px 0px' });
  $$('.rv,.rv-s,.title').forEach(el => io.observe(el));
  $$('#panels .panel').forEach((p, i) => p.style.transitionDelay = (i * .08) + 's');
  $$('#faqs .qa').forEach((q, i) => q.style.transitionDelay = (i * .07) + 's');

  /* ---------- PROGRAM PANELS: hover / tap / auto ---------- */
  const panels = $$('#panels .panel'); let pi = 0, pTimer, pHover = false;
  const setPanel = (n, user) => {
    pi = n;
    panels.forEach((p, k) => { p.classList.toggle('on', k === n); p.classList.remove('run'); });
    void panels[n].offsetWidth;
    if (!pHover) panels[n].classList.add('run');
    if (user) restartPanels();
  };
  const restartPanels = () => { clearInterval(pTimer); pTimer = setInterval(() => { if (!pHover) setPanel((pi + 1) % panels.length); }, 5500); };
  panels.forEach((p, k) => {
    p.addEventListener('mouseenter', () => { if (desk()) setPanel(k, true); });
    p.addEventListener('click', () => { if (k !== pi) setPanel(k, true); });
  });
  $('#panels').addEventListener('mouseenter', () => { pHover = true; panels[pi].classList.remove('run'); });
  $('#panels').addEventListener('mouseleave', () => { pHover = false; setPanel(pi); restartPanels(); });
  setPanel(0); restartPanels();

  /* ---------- WHY: tabs + morphing frame ---------- */
  const tabs = $$('#tabs .tab'), fw = $('#frameWrap'), fImgs = $$('.frame img', fw); let ti = 0, tTimer;
  const setTab = n => {
    ti = n;
    tabs.forEach((t, k) => { t.classList.toggle('on', k === n); t.classList.remove('run'); });
    void tabs[n].offsetWidth; tabs[n].classList.add('run');
    fw.dataset.s = n + 1;
    fImgs.forEach((im, k) => im.classList.toggle('on', k === n));
    clearInterval(tTimer); tTimer = setInterval(() => setTab((ti + 1) % tabs.length), 5000);
  };
  tabs.forEach((t, k) => t.addEventListener('click', () => setTab(k)));
  setTab(0);

  /* ---------- RESULTS: polaroid fly-in + filters ---------- */
  const pols = $$('#wall .pol');
  const wallIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    pols.forEach((p, i) => p.animate([
      { opacity: 0, transform: `translate(${(Math.random() - .5) * 160}px, ${120 + Math.random() * 80}px) rotate(${(Math.random() - .5) * 40}deg) scale(.7)` },
      { opacity: 1, transform: `rotate(${getComputedStyle(p).getPropertyValue('--r') || '0deg'})` }
    ], { duration: 1100, delay: i * 90, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    wallIO.disconnect();
  }), { threshold: .12 });
  wallIO.observe($('#wall'));
  $$('#filters .fbtn').forEach(b => b.addEventListener('click', () => {
    $$('#filters .fbtn').forEach(x => x.classList.remove('on')); b.classList.add('on');
    const f = b.dataset.f; let k = 0;
    pols.forEach(p => {
      const show = f === 'all' || p.dataset.f === f;
      p.classList.toggle('out', !show);
      if (show) p.animate([{ opacity: 0, transform: 'translateY(30px) scale(.9) rotate(0deg)' }, { opacity: 1, transform: `rotate(${getComputedStyle(p).getPropertyValue('--r')})` }], { duration: 600, delay: (k++) * 70, easing: 'cubic-bezier(.34,1.45,.64,1)', fill: 'backwards' });
    });
  }));

  /* ---------- FACULTY coverflow ---------- */
  const fcs = $$('#flow .fc'), dots = $('#fDots'); let fi = 0, fTimer;
  fcs.forEach((_, k) => { const d = document.createElement('button'); d.setAttribute('aria-label', 'Faculty ' + (k + 1)); d.addEventListener('click', () => goF(k)); dots.appendChild(d); });
  const layoutF = () => {
    const n = fcs.length, mob = innerWidth < 700;
    fcs.forEach((c, k) => {
      let o = k - fi; if (o > n / 2) o -= n; if (o < -n / 2) o += n;
      const x = o * (mob ? 46 : 64), s = o === 0 ? 1 : .8, ry = o === 0 ? 0 : (o > 0 ? -22 : 22);
      c.style.transform = `translateX(${x}%) scale(${s}) rotateY(${ry}deg)`;
      c.style.zIndex = 10 - Math.abs(o);
      c.style.opacity = Math.abs(o) > 1 ? 0 : (o === 0 ? 1 : .75);
      c.style.filter = o === 0 ? 'none' : 'saturate(.6) brightness(.9)';
      c.style.pointerEvents = Math.abs(o) > 1 ? 'none' : 'auto';
      c.classList.toggle('c', o === 0);
    });
    $$('button', dots).forEach((d, k) => d.classList.toggle('on', k === fi));
  };
  const goF = k => { fi = (k + fcs.length) % fcs.length; layoutF(); clearInterval(fTimer); fTimer = setInterval(() => goF(fi + 1), 4500); };
  fcs.forEach((c, k) => c.addEventListener('click', () => { if (k !== fi) goF(k); }));
  $('#fPrev').addEventListener('click', () => goF(fi - 1));
  $('#fNext').addEventListener('click', () => goF(fi + 1));
  let sx = null; const flow = $('#flow');
  flow.addEventListener('pointerdown', e => sx = e.clientX);
  flow.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 40) goF(fi + (dx < 0 ? 1 : -1)); sx = null; });
  goF(0); addEventListener('resize', layoutF);

  /* ---------- GALLERY zoom (FLIP) ---------- */
  const zoom = $('#zoom'), zCap = $('#zoomCap'); let zImg = null, zFrom = null;
  $$('#cols .gimg').forEach(g => g.addEventListener('click', () => {
    const src = $('img', g), r = src.getBoundingClientRect();
    zFrom = { el: src, r };
    zImg = document.createElement('img'); zImg.src = src.src; zImg.alt = src.alt;
    Object.assign(zImg.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    zoom.appendChild(zImg); zCap.textContent = $('span', g).textContent;
    src.style.visibility = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const ratio = (src.naturalWidth || r.width) / (src.naturalHeight || r.height);
      let w = Math.min(innerWidth * .86, 1100), h = w / ratio;
      if (h > innerHeight * .78) { h = innerHeight * .78; w = h * ratio; }
      Object.assign(zImg.style, { left: (innerWidth - w) / 2 + 'px', top: (innerHeight - h) / 2 - 20 + 'px', width: w + 'px', height: h + 'px' });
      zoom.classList.add('on');
    }));
  }));
  const closeZoom = () => {
    if (!zImg) return; const r = zFrom.el.getBoundingClientRect(), im = zImg;
    Object.assign(im.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    zoom.classList.remove('on');
    setTimeout(() => { zFrom.el.style.visibility = ''; im.remove(); }, 700);
    zImg = null;
  };
  zoom.addEventListener('click', closeZoom);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeZoom(); });

  /* ---------- CHAT testimonials ---------- */
  const thread = [
    { who: 'Mrs. Kulkarni', t: 'Ishita got her mentor\'s weekly plan today. Finally someone tracking her Physics properly 🙏' },
    { who: 'Mr. Deshpande', t: 'Same here. The Monday report showed exactly which chapters Aarav is weak in.' },
    { me: true, t: 'Reminder: D-SAT this Sunday 9 am at all campuses. Parents welcome for the mentor briefing ☕' },
    { who: 'Mrs. Shaikh', t: 'Zoya scored 92 in the mock, up from 61 in August! Thank you Meera ma\'am ❤️' },
    { who: 'Mr. Patil', t: 'The Saturday lab hour is her favourite part of the week now.' },
    { me: true, t: 'Proud of every one of them. Results 2026: 220 IIT qualifiers 🎉' }
  ];
  const box = $('#msgs'), status = $('#chatStatus'); let chatOn = false, chatRun = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const time = () => { const d = new Date(); return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); };
  const playChat = async (run) => {
    box.innerHTML = '';
    for (const m of thread) {
      if (run !== chatRun) return;
      status.textContent = (m.me ? 'Disha Academy' : m.who) + ' is typing…';
      const ty = document.createElement('div'); ty.className = 'msg typing' + (m.me ? ' me' : ''); ty.innerHTML = '<i></i><i></i><i></i>';
      box.appendChild(ty); await wait(1100);
      if (run !== chatRun) return;
      ty.remove();
      const el = document.createElement('div'); el.className = 'msg' + (m.me ? ' me' : '');
      el.innerHTML = (m.me ? '' : `<span class="who">${m.who}</span>`) + m.t + `<span class="t">${time()}${m.me ? ' ✓✓' : ''}</span>`;
      box.appendChild(el);
      while (box.scrollHeight > box.clientHeight + 2 && box.firstChild) box.firstChild.remove();
      status.textContent = '42 parents · 3 mentors';
      await wait(1500);
    }
    await wait(3500);
    if (run === chatRun && chatOn) playChat(run);
  };
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !chatOn) { chatOn = true; chatRun++; playChat(chatRun); }
    else if (!e.isIntersecting && chatOn) { chatOn = false; chatRun++; }
  }), { threshold: .3 }).observe($('.phone'));

  /* ---------- ADMISSIONS path (drawn on scroll) ---------- */
  const pw = $('#pathWrap'), svg = $('#pathSvg'), pBg = $('#pBg'), pFg = $('#pFg'), steps = $$('#pathWrap .step'); let pLen = 0;
  const buildPath = () => {
    const H = pw.offsetHeight, W = 120, m = W / 2; let d = `M ${m} 0`;
    const seg = H / 4;
    for (let k = 0; k < 4; k++) { const y0 = k * seg, sgn = k % 2 ? -1 : 1; d += ` C ${m + 50 * sgn} ${y0 + seg * .35}, ${m - 50 * sgn} ${y0 + seg * .65}, ${m} ${y0 + seg}`; }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.style.height = H + 'px';
    pBg.setAttribute('d', d); pFg.setAttribute('d', d);
    pLen = pFg.getTotalLength(); pFg.style.strokeDasharray = pLen; pFg.style.strokeDashoffset = pLen;
  };

  /* ---------- FAQ ---------- */
  $$('#faqs .qa').forEach(q => $('button', q).addEventListener('click', () => {
    const open = q.classList.contains('open');
    $$('#faqs .qa').forEach(x => x.classList.remove('open'));
    if (!open) q.classList.add('open');
  }));

  /* ---------- FORM + confetti ---------- */
  const form = $('#form'), cv = $('#confetti'), cx = cv.getContext('2d');
  const confetti = () => {
    const r = form.getBoundingClientRect(); cv.width = r.width; cv.height = r.height;
    const cols = ['#FF6A3D', '#FFC845', '#0F3D2E', '#D6EFE2', '#1E6B52'];
    const ps = Array.from({ length: 140 }, () => ({ x: r.width / 2, y: r.height * .38, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, s: Math.random() * 7 + 4, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
    let f = 0;
    const tick = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
      if (++f < 160) requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height);
    };
    tick();
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nm = $('#nm'), ph = $('#ph');
    const okN = nm.value.trim().length > 1, okP = /^[6-9]\d{9}$/.test(ph.value.replace(/[\s+-]/g, '').replace(/^91(?=\d{10}$)/, ''));
    $('#flN').classList.toggle('bad', !okN); $('#flP').classList.toggle('bad', !okP);
    if (!okN) { nm.focus(); return; } if (!okP) { ph.focus(); return; }
    const ex = $('input[name="ex"]:checked').value;
    $('#tyH').textContent = `See you soon, ${nm.value.trim().split(' ')[0]}!`;
    $('#tyP').textContent = `We'll call within 24 hours to book your free ${ex} demo at our ${$('#cp').value} campus.`;
    $('#thanks').classList.add('on'); confetti();
  });
  $('#again').addEventListener('click', () => { $('#thanks').classList.remove('on'); form.reset(); });
  $('#sub').addEventListener('submit', e => { e.preventDefault(); const i = $('input', e.target); if (!/\S+@\S+\.\S+/.test(i.value)) { i.focus(); return; } i.value = ''; i.placeholder = 'Subscribed — thank you!'; });

  /* ---------- button ripple origin ---------- */
  $$('.btn').forEach(b => b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--x', (e.clientX - r.left) + 'px'); b.style.setProperty('--y', (e.clientY - r.top) + 'px'); }));

  /* ---------- nav + drawer ---------- */
  const nav = $('#nav'), up = $('#up');
  $('#burger').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $$('#drawer a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

  /* ---------- scroll loop: nav, gallery parallax, path ---------- */
  const cols = $$('#cols .col'), gal = $('#campus'); let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('solid', y > 30);
    nav.classList.toggle('hide', y > lastY && y > 600 && !document.body.classList.contains('nav-open'));
    lastY = y;
    up.classList.toggle('on', y > 800);
    // gallery parallax
    const gr = gal.getBoundingClientRect();
    if (gr.bottom > 0 && gr.top < innerHeight) {
      const p = (innerHeight - gr.top) / (innerHeight + gr.height) - .5;
      cols.forEach(c => c.style.transform = `translateY(${p * (+c.dataset.speed) * 900}px)`);
    }
    // admissions path
    if (pLen) {
      const r = pw.getBoundingClientRect();
      const p = clamp((innerHeight * .62 - r.top) / r.height, 0, 1);
      pFg.style.strokeDashoffset = pLen * (1 - p);
      steps.forEach(s => { const sr = s.getBoundingClientRect(); s.classList.toggle('lit', sr.top + sr.height / 2 < innerHeight * .66); });
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { buildPath(); onScroll(); });
  addEventListener('load', () => { buildPath(); onScroll(); });
  buildPath(); onScroll();
})();
