/* ===================== Collage (robust crossfade) ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const imageCount = 15;
  const collageBoxes = Array.from(document.querySelectorAll('.collage-box'));
  const imagePaths  = Array.from({ length: imageCount }, (_, i) => `${i + 1}.png`);

  // staggered offsets (seconds)
  const offsets = { 0:0.0, 1:0.2, 3:0.2, 2:0.4, 4:0.4, 6:0.4, 5:0.6, 7:0.6, 8:0.8 };
  const cycleLength = 6800; // ms

  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

  function crossfadeImage(box, newSrc){
    const oldImg = box.querySelector('img');

    const newImg = document.createElement('img');
    newImg.src = newSrc;
    Object.assign(newImg.style, {
      position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover',
      opacity:0, transition:'opacity 1s ease-in-out', zIndex:'1', willChange:'opacity', pointerEvents:'none'
    });
    box.appendChild(newImg);

    // keep the outgoing image above so its fade-out is visible
    if (oldImg) {
      oldImg.style.zIndex = '2';
      oldImg.style.transition = 'opacity 1s ease-in-out';
    }

    const startFade = () => {
      requestAnimationFrame(() => {
        newImg.style.opacity = '1';
        if (oldImg) oldImg.style.opacity = '0';
      });
      setTimeout(() => { if (oldImg && oldImg.parentNode === box) box.removeChild(oldImg); }, 1100);
      // allow the new image to become the next "old" image cleanly
      setTimeout(() => { newImg.style.zIndex = ''; }, 1200);
    };

    if (newImg.decode) newImg.decode().then(startFade).catch(startFade);
    else if (newImg.complete) startFade();
    else newImg.onload = startFade;
  }

  function initialize(){
    const images = shuffle([...imagePaths]).slice(0, collageBoxes.length);
    collageBoxes.forEach((box, i) => {
      const img = document.createElement('img');
      Object.assign(img.style, {
        position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover',
        opacity:1, transition:'opacity 1s ease-in-out'
      });
      img.src = images[i];
      box.appendChild(img);
    });
  }

  function runCycle(){
    const images = shuffle([...imagePaths]).slice(0, collageBoxes.length);
    collageBoxes.forEach((box, i) => {
      const offset = (offsets[i] || 0) * 1000;
      setTimeout(() => crossfadeImage(box, images[i]), 6000 + offset);
    });
    setTimeout(runCycle, cycleLength);
  }

  initialize();
  runCycle();
});


/* ===================== Animated lines (middle of index only) ===================== */
const scrollLines = document.querySelectorAll('.animated-line');
function updateScrollLines() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;

  scrollLines.forEach(line => {
    const rect = line.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const relativeScroll = (scrollY + windowHeight - elementTop) / windowHeight;
    const progress = Math.max(0, Math.min(1, relativeScroll));
    line.style.width = `${progress * 100}%`;
  });
}

/* ===================== Key Insights: Click-to-Reveal + Arrows (scoped) ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const isInsightsPage =
    /key insights/i.test(document.title || '') ||
    /key insights/i.test((document.querySelector('h1.main-title')?.textContent || ''));

  if (!isInsightsPage) return;

  document.body.classList.add('is-insights-page');

  const container = document.querySelector('.content-container');
  if (!container) return;

  const titles = Array.from(container.querySelectorAll('.secondary-title'));

  titles.forEach((title) => {
    const blocks = [];
    let ptr = title.nextElementSibling;
    while (ptr && !ptr.classList.contains('secondary-title')) {
      blocks.push(ptr);
      ptr = ptr.nextElementSibling;
    }
    if (!blocks.length) return;

    let body = title.nextElementSibling;
    if (!(body && body.classList && body.classList.contains('insight-body'))) {
      body = document.createElement('div');
      body.className = 'insight-body';
      title.parentNode.insertBefore(body, blocks[0]);
      blocks.forEach(n => body.appendChild(n));
    }

    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-expanded', 'false');

    let downBtn = title.querySelector('.insight-caret');
    if (!downBtn) {
      downBtn = document.createElement('button');
      downBtn.className = 'insight-caret';
      downBtn.type = 'button';
      downBtn.setAttribute('aria-label', 'Expand key insight');
      title.appendChild(downBtn);
    }

    let upBtn = body.querySelector('.insight-collapse');
    if (!upBtn) {
      upBtn = document.createElement('button');
      upBtn.className = 'insight-collapse';
      upBtn.type = 'button';
      upBtn.setAttribute('aria-label', 'Collapse key insight');
      body.appendChild(upBtn);
    }

    const open = () => {
      if (body.classList.contains('revealed')) return;
      body.classList.add('revealed');
      body.style.maxHeight = body.scrollHeight + 'px';
      title.setAttribute('aria-expanded', 'true');
      title.classList.add('is-open');
      downBtn.setAttribute('aria-hidden', 'true');
    };

    const close = () => {
      if (!body.classList.contains('revealed')) return;
      if (body.style.maxHeight === '' || body.style.maxHeight === 'none') {
        body.style.maxHeight = body.scrollHeight + 'px';
      }
      void body.offsetHeight;
      body.classList.remove('revealed');
      body.style.maxHeight = '0px';
      title.setAttribute('aria-expanded', 'false');
      title.classList.remove('is-open');
      downBtn.removeAttribute('aria-hidden');
    };

    const toggle = () => (body.classList.contains('revealed') ? close() : open());

    title.addEventListener('click', toggle);
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    downBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    upBtn.addEventListener('click', (e) => { e.stopPropagation(); if (body.classList.contains('revealed')) close(); });

    body.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'max-height' && body.classList.contains('revealed')) {
        body.style.maxHeight = 'none';
      }
    });
  });
});

/* PDF “View” buttons: open in new tab + pressed animation (single, de‑duplicated block) */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a.pdf-pill').forEach(a => {
    const href = (a.getAttribute('href') || '').trim();
    if (href) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      if (a.hasAttribute('aria-disabled')) a.removeAttribute('aria-disabled');
    }
    a.addEventListener('click', () => {
      a.classList.add('pressed');
      setTimeout(() => a.classList.remove('pressed'), 180);
    });
  });
});

/* Global “pressed” animation for any dynamically-added pdf-pill (optional) */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('a.pdf-pill:not([aria-disabled="true"])');
  if (!btn) return;
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 180);
});

window.addEventListener('scroll', updateScrollLines);
window.addEventListener('resize', updateScrollLines);
window.addEventListener('DOMContentLoaded', updateScrollLines);

/* ===================== Sheen: reverted to simple hover (no cursor-follow) ===================== */
/* No JS needed. Pure CSS in style.css controls the effect. */
