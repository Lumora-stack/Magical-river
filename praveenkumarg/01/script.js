
/* ============================================================
   COMPLETE JAVASCRIPT WITH ALL FUNCTIONALITY
============================================================ */

/* ============================================================
   0. PRELOADER - Sketch Animation with Canvas
============================================================ */
(function(){
  const canvas = document.getElementById('preloaderCanvas');
  const ctx = canvas.getContext('2d');
  const pre = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  const status = document.getElementById('preloaderStatus');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, t = 0, lines = [], progress = 0, target = 5;
  let pageLoaded = false, minTimeElapsed = false, mi = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Generate sketch lines
  function generateLines() {
    lines = [];
    const count = Math.min(80, Math.floor((w * h) / 8000));
    for (let i = 0; i < count; i++) {
      lines.push({
        x1: Math.random() * w,
        y1: Math.random() * h,
        x2: Math.random() * w,
        y2: Math.random() * h,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        len: 0.2 + Math.random() * 0.6,
        width: 0.5 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.3
      });
    }
  }
  generateLines();

  function drawPreloader(now) {
    t += 0.008;
    ctx.clearRect(0, 0, w, h);
    
    // Background gradient
    const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
    grad.addColorStop(0, '#1a1628');
    grad.addColorStop(1, '#0a0a12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw sketch lines
    lines.forEach((line, i) => {
      const progress = (Math.sin(t * line.speed + line.phase) + 1) / 2;
      const currentLen = line.len * progress;
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const ex = line.x1 + dx * currentLen;
      const ey = line.y1 + dy * currentLen;
      
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(201, 168, 124, ${line.alpha * (0.5 + 0.5 * progress)})`;
      ctx.lineWidth = line.width * (0.5 + 0.5 * progress);
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Draw some sparkle dots
    for (let i = 0; i < 30; i++) {
      const x = (Math.sin(t * 0.5 + i * 1.7) * 0.5 + 0.5) * w;
      const y = (Math.cos(t * 0.7 + i * 2.3) * 0.5 + 0.5) * h;
      const r = 1 + Math.sin(t * 0.8 + i) * 0.5;
      const alpha = 0.3 + Math.sin(t * 1.2 + i * 0.7) * 0.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 124, ${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(drawPreloader);
  }

  // Start animation only if not reduced motion
  if (!reduced) {
    requestAnimationFrame(drawPreloader);
  }

  // Progress bar logic
  const messages = ['sketching the lines', 'adding the details', 'finding the light', 'shading the edges', 'ready to inspire'];
  
  function setProgress(p) {
    progress = Math.min(100, p);
    fill.style.width = progress + '%';
    const pct = status.querySelector('.pct');
    if (pct) pct.textContent = ' ' + Math.round(progress) + '%';
  }
  
  function cycleMessage() {
    if (progress >= 99) return;
    const label = status.firstChild;
    if (label && label.nodeType === 3) {
      label.textContent = messages[mi % messages.length] + ' ';
    }
    mi++;
  }

  function finish() {
    setProgress(100);
    const label = status.firstChild;
    if (label && label.nodeType === 3) label.textContent = 'ready to inspire ';
    setTimeout(function() {
      pre.classList.add('hidden');
      setTimeout(function() { pre.remove(); }, 800);
    }, reduced ? 100 : 400);
  }

  if (reduced) { setProgress(100); finish(); return; }

  const msgTimer = setInterval(cycleMessage, 900);
  const rampTimer = setInterval(function() {
    target = Math.min(target + Math.random() * 4, 95);
    setProgress(progress + (target - progress) * 0.15);
    if (progress >= 95) { clearInterval(rampTimer); }
  }, 200);

  function tryFinish() {
    if (pageLoaded && minTimeElapsed) {
      clearInterval(msgTimer);
      clearInterval(rampTimer);
      finish();
    }
  }

  window.addEventListener('load', function() { pageLoaded = true; tryFinish(); });
  const minTime = 4500 + Math.random() * 500;
  setTimeout(function() { minTimeElapsed = true; tryFinish(); }, minTime);
  setTimeout(function() { pageLoaded = true; minTimeElapsed = true; tryFinish(); }, 5500);

  // Handle resize for canvas
  window.addEventListener('resize', function() {
    resize();
    generateLines();
  });
})();

/* ============================================================
   1. READING PROGRESS BAR
============================================================ */
(function(){
  const progressBar = document.getElementById('progress-bar');
  let ticking = false;
  function updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() { updateProgress(); ticking = false; });
      ticking = true;
    }
  });
  updateProgress();
})();

/* ============================================================
   2. IMAGE LOADING ANIMATION (Blur-up effect)
============================================================ */
(function(){
  const images = document.querySelectorAll('.gallery-img-wrap img, .diy-img-wrap img');
  function handleImageLoad(img) {
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() { this.classList.add('loaded'); });
      img.addEventListener('error', function() {
        this.classList.add('loaded');
        this.style.filter = 'blur(0) brightness(1)';
        this.style.opacity = '0.5';
      });
    }
  }
  images.forEach(handleImageLoad);
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          const imgs = node.querySelectorAll('.gallery-img-wrap img, .diy-img-wrap img');
          imgs.forEach(handleImageLoad);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

/* ============================================================
   3. CUSTOM CURSOR
============================================================ */
(function(){
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursorTrail');
  if(!dot || !ring) return;
  let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
  addEventListener('mousemove', e=>{ mx = e.clientX; my = e.clientY; dot.style.left = mx+'px'; dot.style.top = my+'px'; });
  (function loop(){ rx += (mx-rx)*0.18; ry += (my-ry)*0.18; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(loop); })();
  const hoverSel = 'a, button, .gallery-card, .diy-card, .play-card, .app-card, input, textarea, select';
  document.addEventListener('mouseover', e=>{ if(e.target.closest(hoverSel)){ dot.classList.add('cursor--active'); ring.classList.add('cursor--active'); }});
  document.addEventListener('mouseout', e=>{ if(e.target.closest(hoverSel)){ dot.classList.remove('cursor--active'); ring.classList.remove('cursor--active'); }});
})();

/* ============================================================
   4. GALAXY BACKGROUND
============================================================ */
(function(){
  const canvas = document.getElementById('galaxy-bg');
  const ctx = canvas.getContext('2d');
  let w,h,stars=[], dpr = Math.min(window.devicePixelRatio||1, 1.5);
  const STAR_COUNT = window.innerWidth < 700 ? 70 : 130;
  function resize(){ w = innerWidth; h = innerHeight; canvas.width = w*dpr; canvas.height = h*dpr; canvas.style.width = w+'px'; canvas.style.height = h+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); }
  function makeStars(){ stars = []; for(let i=0;i<STAR_COUNT;i++){ stars.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.3+0.3, hue: Math.random()>0.5 ? 40 : 260, tw: Math.random()*Math.PI*2, speed: 0.15+Math.random()*0.3 }); } }
  resize(); makeStars();
  let resizeTimer; window.addEventListener('resize', ()=>{ clearTimeout(resizeTimer); resizeTimer = setTimeout(()=>{ resize(); makeStars(); }, 200); });
  let last = 0;
  function draw(now){ if(now - last < 33){ requestAnimationFrame(draw); return; } last = now; ctx.clearRect(0,0,w,h); for(const s of stars){ s.tw += 0.05*s.speed; const alpha = 0.35 + Math.sin(s.tw)*0.35; ctx.beginPath(); ctx.fillStyle = `hsla(${s.hue}, 70%, 78%, ${Math.max(0,alpha)})`; ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill(); } requestAnimationFrame(draw); }
  requestAnimationFrame(draw);
})();

/* ============================================================
   5. STRANDS FOOTER
============================================================ */
(function(){
  const canvas = document.getElementById('strands-canvas');
  const ctx = canvas.getContext('2d');
  let w,h; const colors = ['#c9a87c','#7c6cff','#5fd9d0'];
  function resize(){ const rect = canvas.parentElement.getBoundingClientRect(); w = canvas.width = rect.width; h = canvas.height = rect.height; }
  resize(); window.addEventListener('resize', resize);
  let t=0;
  function draw(){ t += 0.006; ctx.clearRect(0,0,w,h); colors.forEach((color, i)=>{ ctx.beginPath(); ctx.strokeStyle = color; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.6; for(let x=0;x<=w;x+=6){ const y = h/2 + Math.sin(x*0.01 + t*3 + i*2)*h*0.18 + Math.sin(x*0.02 - t*2 + i)*h*0.08; if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke(); }); ctx.globalAlpha = 1; requestAnimationFrame(draw); }
  draw();
})();

/* ============================================================
   6. ELECTRIC BORDER
============================================================ */
(function(){
  const wrap = document.getElementById('electricBorder');
  const canvas = document.getElementById('ebCanvas');
  const ctx = canvas.getContext('2d');
  const color = '#7df9ff';
  const borderOffset = 22, borderRadius = 22, chaos = 0.45, speed = 0.9;
  let w = 0, h = 0, t = 0, lastTime = 0;
  function random(x){ return (Math.sin(x*12.9898)*43758.5453) % 1; }
  function noise2D(x,y){ const i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j; const a=random(i+j*57), b=random(i+1+j*57), c=random(i+(j+1)*57), d=random(i+1+(j+1)*57); const ux=fx*fx*(3-2*fx), uy=fy*fy*(3-2*fy); return a*(1-ux)*(1-uy)+b*ux*(1-uy)+c*(1-ux)*uy+d*ux*uy; }
  function octavedNoise(x,time,seed){ let y=0, amp=chaos, freq=6; for(let i=0;i<4;i++){ y += amp*noise2D(freq*x+seed*100, time*freq*0.3); freq*=1.7; amp*=0.65; } return y; }
  function getCornerPoint(cx,cy,r,startAngle,arcLength,progress){ const angle = startAngle + progress*arcLength; return { x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle) }; }
  function getRoundedRectPoint(t,left,top,width,height,radius){ const sw = width-2*radius, sh = height-2*radius, arc = (Math.PI*radius)/2; const perim = 2*sw + 2*sh + 4*arc; const d = t*perim; let acc = 0; if(d <= acc+sw){ const p=(d-acc)/sw; return {x:left+radius+p*sw, y:top}; } acc+=sw; if(d <= acc+arc){ const p=(d-acc)/arc; return getCornerPoint(left+width-radius, top+radius, radius, -Math.PI/2, Math.PI/2, p); } acc+=arc; if(d <= acc+sh){ const p=(d-acc)/sh; return {x:left+width, y:top+radius+p*sh}; } acc+=sh; if(d <= acc+arc){ const p=(d-acc)/arc; return getCornerPoint(left+width-radius, top+height-radius, radius, 0, Math.PI/2, p); } acc+=arc; if(d <= acc+sw){ const p=(d-acc)/sw; return {x:left+width-radius-p*sw, y:top+height}; } acc+=sw; if(d <= acc+arc){ const p=(d-acc)/arc; return getCornerPoint(left+radius, top+height-radius, radius, Math.PI/2, Math.PI/2, p); } acc+=arc; if(d <= acc+sh){ const p=(d-acc)/sh; return {x:left, y:top+height-radius-p*sh}; } acc+=sh; const p=(d-acc)/arc; return getCornerPoint(left+radius, top+radius, radius, Math.PI, Math.PI/2, p); }
  function updateSize(){ const rect = wrap.getBoundingClientRect(); const width = rect.width + borderOffset*2; const height = rect.height + borderOffset*2; const dpr = Math.min(window.devicePixelRatio || 1, 1.5); canvas.width = width*dpr; canvas.height = height*dpr; canvas.style.width = width+'px'; canvas.style.height = height+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); w = width; h = height; }
  updateSize(); const ro = new ResizeObserver(()=>updateSize()); ro.observe(wrap);
  function draw(now){ const dt = Math.min((now - lastTime)/1000, 0.05); lastTime = now; t += dt*speed; ctx.clearRect(0,0,w,h); ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.lineCap='round'; ctx.lineJoin='round'; const left = borderOffset, top = borderOffset; const bw = w - borderOffset*2, bh = h - borderOffset*2; const radius = Math.min(borderRadius, Math.min(bw,bh)/2); const perim = 2*(bw+bh) + 2*Math.PI*radius; const steps = Math.max(40, Math.floor(perim/6)); ctx.beginPath(); for(let i=0;i<=steps;i++){ const p = i/steps; const pt = getRoundedRectPoint(p,left,top,bw,bh,radius); const xn = octavedNoise(p*8, t, 0); const yn = octavedNoise(p*8, t, 1); const x = pt.x + xn*18, y = pt.y + yn*18; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.closePath(); ctx.stroke(); requestAnimationFrame(draw); }
  requestAnimationFrame(draw);
})();

/* ============================================================
   7. BUBBLE MENU & SETTINGS
============================================================ */
(function(){
  const toggle = document.getElementById('bubbleToggle');
  const sidebar = document.getElementById('bubbleSidebar');
  toggle.addEventListener('click', ()=>{ const open = sidebar.classList.toggle('active'); toggle.classList.toggle('open', open); });
  sidebar.querySelectorAll('a').forEach(a=>{ a.addEventListener('click', ()=>{ sidebar.classList.remove('active'); toggle.classList.remove('open'); }); });
})();

/* ============================================================
   8. SETTINGS PANEL with THEME CHANGER
============================================================ */
(function(){
  const settingsTrigger = document.getElementById('settingsTrigger');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsClose = document.getElementById('settingsClose');
  const themeOptions = document.querySelectorAll('.theme-option');
  const resetThemeBtn = document.getElementById('resetThemeBtn');
  const body = document.body;
  const galaxyBg = document.getElementById('galaxy-bg');

  const themes = {
    'default': '', 'light': 'theme-light', 'forest': 'theme-forest', 'ocean': 'theme-ocean',
    'sunset': 'theme-sunset', 'rose': 'theme-rose', 'galaxy': 'theme-galaxy',
    'cyberpunk': 'theme-cyberpunk', 'amoled': 'theme-amoled'
  };

  function loadSavedTheme(){
    const saved = localStorage.getItem('selectedTheme') || 'default';
    applyTheme(saved);
  }

  function applyTheme(themeName){
    const themeClass = themes[themeName];
    Object.values(themes).forEach(cls => { if(cls) body.classList.remove(cls); });
    if(themeClass) body.classList.add(themeClass);
    localStorage.setItem('selectedTheme', themeName);
    themeOptions.forEach(opt => { opt.classList.toggle('active', opt.dataset.theme === themeName); });
    if(galaxyBg) {
      Object.keys(themes).forEach(key => { if(key !== 'default') galaxyBg.classList.remove('theme-' + key); });
      if(themeName !== 'default') galaxyBg.classList.add('theme-' + themeName);
    }
  }

  settingsTrigger.addEventListener('click', function(e){ e.preventDefault(); settingsPanel.classList.add('active'); document.getElementById('bubbleSidebar').classList.remove('active'); document.getElementById('bubbleToggle').classList.remove('open'); });
  function closeSettings(){ settingsPanel.classList.remove('active'); }
  settingsClose.addEventListener('click', closeSettings);
  settingsPanel.addEventListener('click', function(e){ if(e.target === this) closeSettings(); });
  themeOptions.forEach(opt => { opt.addEventListener('click', function(){ applyTheme(this.dataset.theme); }); });
  resetThemeBtn.addEventListener('click', function(){ applyTheme('default'); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && settingsPanel.classList.contains('active')){ closeSettings(); } });
  loadSavedTheme();
})();

(function(){
  const quickBtn = document.getElementById('quickUploadBtn');
  const uploadModal = document.getElementById('uploadModal');
  const uploadBackdrop = document.getElementById('uploadBackdrop');
  const uploadClose = document.getElementById('uploadClose');
  const sectionButtons = document.querySelectorAll('#uploadSectionList button');
  const selectStep = document.getElementById('uploadStepSelect');
  const detailsStep = document.getElementById('uploadStepDetails');
  const selectedSectionLabel = document.getElementById('uploadSelectedSection');
  const uploadTitle = document.getElementById('uploadTitle');
  const uploadDescription = document.getElementById('uploadDescription');
  const uploadPassword = document.getElementById('uploadPassword');
  const uploadBackBtn = document.getElementById('uploadBackBtn');
  const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
  const uploadError = document.getElementById('uploadError');
  const uploadSuccess = document.getElementById('uploadSuccess');
  let chosenSection = '';

  if(!quickBtn || !uploadModal) return;

  function openUpload(){
    uploadModal.classList.add('active');
    uploadModal.setAttribute('aria-hidden','false');
    selectStep.hidden = false;
    detailsStep.hidden = true;
    uploadError.textContent = '';
    uploadSuccess.hidden = true;
    uploadTitle.value = '';
    uploadDescription.value = '';
    uploadPassword.value = '';
    chosenSection = '';
    selectedSectionLabel.textContent = '...';
  }

  function closeUpload(){
    uploadModal.classList.remove('active');
    uploadModal.setAttribute('aria-hidden','true');
  }

  function setActiveSection(section){
    chosenSection = section;
    selectedSectionLabel.textContent = section;
    selectStep.hidden = true;
    detailsStep.hidden = false;
    uploadError.textContent = '';
    uploadSuccess.hidden = true;
    uploadTitle.focus();
  }

  const scrollBtn = document.getElementById('backToTop');
  const homeSection = document.getElementById('about');
  const arrowUp = '<i class="fas fa-chevron-up"></i>';
  const arrowDown = '<i class="fas fa-chevron-down"></i>';

  function updateScrollButton(){
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const isScrolled = currentScroll > window.innerHeight * 0.3;
    if(isScrolled){
      scrollBtn.innerHTML = arrowUp;
      scrollBtn.setAttribute('aria-label','Scroll to top');
    } else {
      scrollBtn.innerHTML = arrowDown;
      scrollBtn.setAttribute('aria-label','Scroll down');
    }
  }

  function handleScrollClick(){
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if(currentScroll > window.innerHeight * 0.3){
      window.scrollTo({top:0, behavior:'smooth'});
    } else if(homeSection){
      homeSection.scrollIntoView({behavior:'smooth'});
    }
  }

  quickBtn.addEventListener('click', openUpload);
  uploadClose.addEventListener('click', closeUpload);
  uploadBackdrop.addEventListener('click', closeUpload);
  scrollBtn.addEventListener('click', handleScrollClick);
  window.addEventListener('scroll', updateScrollButton);
  updateScrollButton();

  sectionButtons.forEach(btn => {
    btn.addEventListener('click', () => setActiveSection(btn.dataset.section));
  });

  uploadBackBtn.addEventListener('click', () => {
    selectStep.hidden = false;
    detailsStep.hidden = true;
    uploadError.textContent = '';
    uploadSuccess.hidden = true;
  });

  // Chunked upload preserves original quality and supports large files.
  async function uploadFileInChunks(file, uploadUrl, onProgress) {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);

    for (let index = 0; index < totalChunks; index++) {
      const start = index * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const form = new FormData();
      form.append('chunk', chunk);
      form.append('uploadId', uploadId);
      form.append('fileName', file.name);
      form.append('chunkIndex', index);
      form.append('totalChunks', totalChunks);

      // Attach metadata for server assembly
      form.append('section', chosenSection);
      form.append('title', uploadTitle.value.trim());
      form.append('description', uploadDescription.value.trim());

      const res = await fetch(uploadUrl, { method: 'POST', body: form });
      if(!res.ok) {
        throw new Error('Chunk upload failed at index ' + index + ' (status ' + res.status + ')');
      }
      onProgress && onProgress(((index + 1) / totalChunks) * 100, index, totalChunks);
    }

    return { uploadId };
  }

  uploadSubmitBtn.addEventListener('click', async () => {
    const title = uploadTitle.value.trim();
    const message = uploadDescription.value.trim();
    const password = uploadPassword.value;
    if(!chosenSection){ uploadError.textContent = 'Please select a section first.'; return; }
    if(!title){ uploadError.textContent = 'Please add a title for your upload.'; return; }
    if(!message){ uploadError.textContent = 'Please enter a description.'; return; }
    if(password !== 'Stepha@Elena'){
      uploadError.textContent = 'Incorrect upload password.';
      uploadSuccess.hidden = true;
      return;
    }

    uploadError.textContent = '';

    const fileInput = document.getElementById('uploadFile');
    const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    if(file) {
      try {
        uploadSuccess.hidden = true;
        uploadError.textContent = 'Starting upload...';
        const UPLOAD_URL = '/upload'; // Replace with your server upload endpoint

        const progressEl = uploadError; // reuse error element to show progress
        const onProgress = (percent, idx, total) => {
          progressEl.textContent = `Uploading chunk ${idx+1}/${total} — ${percent.toFixed(0)}%`;
        };

        await uploadFileInChunks(file, UPLOAD_URL, onProgress);
        uploadError.textContent = '';
        uploadSuccess.hidden = false;
        uploadSuccess.textContent = '✔ File uploaded (all chunks sent). Server must assemble chunks.';
      } catch(err) {
        uploadError.textContent = 'Upload failed: ' + (err && err.message ? err.message : String(err));
        uploadSuccess.hidden = true;
        return;
      }
    } else {
      uploadSuccess.hidden = false;
      uploadSuccess.textContent = '✔ Upload details saved. No file selected.';
    }
  });

  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && uploadModal.classList.contains('active')){ closeUpload(); } });
})();

/* ============================================================
   9. LOGO LOOP MARQUEE
============================================================ */
(function(){
  const items = ['Pencil Sketches','DIY Arts','Pixel Arts','Games','Apps'];
  const track = document.getElementById('logoloopTrack');
  const build = () => items.map(label=>`<span class="logoloop-item"><span class="dot"></span>${label}</span>`).join('');
  track.innerHTML = build() + build();
})();

/* ============================================================
   10. GALLERY FILTERS (drawings section)
============================================================ */
(function(){
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
  const galleryCards = document.querySelectorAll('#drawingsGrid .gallery-card');
  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryCards.forEach(card=>{
        const show = filter==='all' || card.dataset.category===filter;
        card.style.display = show ? '' : 'none';
      });
      const container = document.getElementById('drawingsGrid').closest('.expandable');
      if(container) { const btn = container.querySelector('.expand-toggle'); if(btn) btn.remove(); setupExpandable(container); }
    });
  });
})();

/* ============================================================
   11. GAMES FILTERS
============================================================ */
(function(){
  const filterBtns = document.querySelectorAll('.games-filters .filter-btn');
  const gameCards = document.querySelectorAll('#gamesGrid .play-card');
  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      gameCards.forEach(card=>{
        const show = filter==='all' || card.dataset.type===filter;
        card.style.display = show ? '' : 'none';
      });
      const container = document.getElementById('gamesGrid').closest('.expandable');
      if(container) { const btn = container.querySelector('.expand-toggle'); if(btn) btn.remove(); setupExpandable(container); }
    });
  });
})();

/* ============================================================
   12. EXPANDABLE SECTIONS
============================================================ */
function setupExpandable(container){
  if(!container) return;
  const initial = parseInt(container.dataset.initial || '6', 10);
  const grid = container.querySelector('.gallery-grid, .diy-grid, .play-grid, .apps-grid');
  if(!grid) return;
  
  let items = Array.from(grid.children).filter(el => { return el.style.display !== 'none'; });
  
  const existingToggle = container.querySelector('.expand-toggle');
  if(existingToggle) existingToggle.remove();
  
  if(items.length <= initial) { 
    Array.from(grid.children).forEach(el => el.classList.remove('grid-item-hidden')); 
    return; 
  }
  
  let open = false;
  function render(){ 
    items = Array.from(grid.children).filter(el => el.style.display !== 'none');
    items.forEach((el,i) => { el.classList.toggle('grid-item-hidden', !open && i >= initial); });
  }
  render();
  
  const btn = document.createElement('button');
  btn.className = 'expand-toggle';
  const totalItems = items.length;
  btn.innerHTML = `<span class="btn-label">show more</span><span class="chev">▼</span>`;
  btn.addEventListener('click', ()=>{
    open = !open;
    btn.classList.toggle('is-open', open);
    btn.querySelector('.btn-label').textContent = open ? 'show less' : 'show more';
    render();
  });
  grid.after(btn);
}

document.querySelectorAll('.expandable').forEach(setupExpandable);

/* ============================================================
   13. ARTWORK DETAIL MODAL
============================================================ */
function openArtworkModal(element) {
  const title = element.dataset.title || element.querySelector('.gallery-title, .diy-info h3')?.textContent || 'Untitled';
  const desc = element.dataset.desc || element.querySelector('.gallery-desc, .diy-info p')?.textContent || '';
  const tags = element.dataset.tags ? element.dataset.tags.split(',') : [];
  
  const img = element.querySelector('img');
  const imgSrc = img ? img.src : '';
  
  document.getElementById('modalImage').src = imgSrc;
  document.getElementById('modalImage').alt = title;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDescription').textContent = desc || 'No description available.';
  
  const tagsContainer = document.getElementById('modalTags');
  tagsContainer.innerHTML = '';
  if(tags.length > 0) {
    tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'modal-tag';
      span.textContent = tag.trim();
      tagsContainer.appendChild(span);
    });
  } else {
    tagsContainer.innerHTML = '<span class="modal-tag">art</span><span class="modal-tag">creative</span>';
  }
  
  document.getElementById('artworkModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeArtworkModal() {
  document.getElementById('artworkModal').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeArtworkModal);
document.getElementById('artworkModal').addEventListener('click', function(e) {
  if(e.target === this) closeArtworkModal();
});
document.addEventListener('keydown', function(e) {
  if(e.key === 'Escape') closeArtworkModal();
});

document.addEventListener('click', function(e) {
  const card = e.target.closest('.gallery-card, .diy-card');
  if(card) {
    if(card.closest('.play-card, .app-card')) return;
    if(e.target.closest('.gallery-overlay')) return;
    openArtworkModal(card);
  }
});

const modalDownloadBtn = document.getElementById('modalDownloadBtn');
const modalShareBtn = document.getElementById('modalShareBtn');
const modalPrintBtn = document.getElementById('modalPrintBtn');
if (modalDownloadBtn) modalDownloadBtn.addEventListener('click', downloadArtwork);
if (modalShareBtn) modalShareBtn.addEventListener('click', shareArtwork);
if (modalPrintBtn) modalPrintBtn.addEventListener('click', printArtwork);

/* ============================================================
   14. DOWNLOAD, SHARE, PRINT FUNCTIONS
============================================================ */
function downloadArtwork() {
  const img = document.getElementById('modalImage');
  const title = document.getElementById('modalTitle').textContent;
  const link = document.createElement('a');
  link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
  link.href = img.src;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function shareArtwork() {
  const title = document.getElementById('modalTitle').textContent;
  const desc = document.getElementById('modalDescription').textContent;
  const url = window.location.href;
  
  if(navigator.share) {
    navigator.share({ title: title, text: `${title} - ${desc}`, url: url }).catch(() => {});
  } else {
    const shareText = `${title} - ${desc}\nView more at ${url}`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Link copied to clipboard! Share it with your friends.');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Link copied to clipboard!');
    });
  }
}

function printArtwork() {
  const img = document.getElementById('modalImage');
  const title = document.getElementById('modalTitle').textContent;
  const printWindow = window.open('', '_blank', 'width=600,height=600');
  if(printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>${title}</title></head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#000;">
          <img src="${img.src}" style="max-width:90%;max-height:90%;object-fit:contain;" />
          <p style="color:#fff;font-family:sans-serif;text-align:center;margin-top:1rem;">${title}</p>
          <script>
            setTimeout(function() { window.print(); window.close(); }, 500);
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

/* ============================================================
   15. CONTACT FORM
============================================================ */
(function(){
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{ e.preventDefault(); const data = new FormData(form); try{ await fetch(form.action, { method:'POST', body:data, headers:{ 'Accept':'application/json' } }); success.classList.add('show'); form.reset(); }catch(err){ success.textContent = "Something went wrong — please email me directly."; success.classList.add('show'); } });
})();

/* ============================================================
   16. TIMELINE SCROLL ANIMATION
============================================================ */
(function(){
  const items = document.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('visible'); } }); }, { threshold: 0.2 });
  items.forEach(item => observer.observe(item));
  items.forEach(item => { item.addEventListener('click', function() { this.classList.toggle('active'); }); });
})();


