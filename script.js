/* ===================== Collage (sequential batches) ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const imageCount = 15;
  const collageBoxes = Array.from(document.querySelectorAll('.collage-box'));
  const imagePaths = Array.from({ length: imageCount }, (_, i) => `${i + 1}.png`);

  // Offsets in seconds for each box (relative to cycle start)
  const offsets = {
    0: 0.0,
    1: 0.2, 3: 0.2,
    2: 0.4, 4: 0.4, 6: 0.4,
    5: 0.6, 7: 0.6,
    8: 0.8
  };

  const cycleLength = 6800; // ms
  const STEP = collageBoxes.length;        // 6 with your current markup
  let seqStart = 0;                        // where the next 6-image batch begins

  // --- optional: keep this handy if you ever want 'random' again ---
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Return the next batch of images in a fixed rotating sequence
  function nextBatch() {
    const n = collageBoxes.length;
    const batch = [];
    for (let i = 0; i < n; i++) {
      batch.push(imagePaths[(seqStart + i) % imageCount]);
    }
    // advance by N each cycle: 1–6, 7–12, 13–15+1–3, 4–9, 10–15, …
    seqStart = (seqStart + n) % imageCount;
    return batch;
  }

// Crossfade so the OLD image visibly fades out every time
function crossfadeImage(box, newSrc) {
  const oldImg = box.querySelector("img");

  const newImg = document.createElement("img");
  newImg.src = newSrc;
  Object.assign(newImg.style, {
    opacity: 0, transition: "opacity 1s ease-in-out",
    position: "absolute", inset: "0",
    width: "100%", height: "100%", objectFit: "cover"
  });

  // Put the new image UNDER the old one so we can see the old fade out
  if (oldImg) { box.insertBefore(newImg, oldImg); } else { box.appendChild(newImg); }

  const start = () => {
    requestAnimationFrame(() => {
      newImg.style.opacity = 1;
      if (oldImg) { oldImg.style.transition = "opacity 1s ease-in-out"; oldImg.style.opacity = 0; }
    });
    setTimeout(() => { if (oldImg && oldImg.parentNode === box) oldImg.remove(); }, 1100);
  };

  if (newImg.decode) newImg.decode().then(start).catch(start);
  else if (newImg.complete) start();
  else newImg.onload = start;
}


  function initialize() {
    const images = nextBatch(); // first 6 (1–6)
    collageBoxes.forEach((box, i) => {
      const img = document.createElement('img');
      Object.assign(img.style, {
        opacity: 1,
        transition: 'opacity 1000ms ease-in-out',
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        objectFit: 'cover'
      });
      img.src = images[i];
      box.appendChild(img);
    });
  }

  function runCycle() {
    const images = nextBatch(); // next 6 every cycle
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
  const body = document.body;
  const inferredInsights =
    /key insights/i.test(document.title || '') ||
    /key insights/i.test((document.querySelector('h1.main-title')?.textContent || ''));

  const isInsightsPage = body.classList.contains('is-insights-page') || inferredInsights;
  const isLeadershipPage = body.classList.contains('is-leadership-page');

  if (!(isInsightsPage || isLeadershipPage)) return;

  if (isInsightsPage) body.classList.add('is-insights-page');

  const container = document.querySelector('.content-container');
  if (!container) return;

  if (isLeadershipPage) {
    const markers = Array.from(container.querySelectorAll('p.paragraph > span.leadership-section'));
    markers.forEach((marker) => {
      const host = marker.parentElement;
      if (!host) return;
      const heading = document.createElement('h2');
      heading.className = 'secondary-title compressed';
      heading.textContent = marker.textContent;
      host.parentNode.replaceChild(heading, host);
    });
  }

  const titles = Array.from(container.querySelectorAll('.secondary-title'));

  titles.forEach((title) => {
    const blocks = [];
    let ptr = title.nextElementSibling;
    while (ptr && !ptr.classList.contains('secondary-title')) {
      blocks.push(ptr);
      ptr = ptr.nextElementSibling;
    }
    if (!blocks.length) return;

    let bodyEl = title.nextElementSibling;
    if (!(bodyEl && bodyEl.classList && bodyEl.classList.contains('insight-body'))) {
      bodyEl = document.createElement('div');
      bodyEl.className = 'insight-body';
      title.parentNode.insertBefore(bodyEl, blocks[0]);
      blocks.forEach(n => bodyEl.appendChild(n));
    }

    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-expanded', 'false');

    const expandLabel = isLeadershipPage ? 'Expand section' : 'Expand key insight';
    const collapseLabel = isLeadershipPage ? 'Collapse section' : 'Collapse key insight';

    let downBtn = title.querySelector('.insight-caret');
    if (!downBtn) {
      downBtn = document.createElement('button');
      downBtn.className = 'insight-caret';
      downBtn.type = 'button';
      downBtn.setAttribute('aria-label', expandLabel);
      title.appendChild(downBtn);
    }

    let upBtn = bodyEl.querySelector('.insight-collapse');
    if (!upBtn) {
      upBtn = document.createElement('button');
      upBtn.className = 'insight-collapse';
      upBtn.type = 'button';
      upBtn.setAttribute('aria-label', collapseLabel);
      bodyEl.appendChild(upBtn);
    }

    const open = () => {
      if (bodyEl.classList.contains('revealed')) return;
      bodyEl.classList.add('revealed');
      bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
      title.setAttribute('aria-expanded', 'true');
      title.classList.add('is-open');
      downBtn.setAttribute('aria-hidden', 'true');
    };

    const close = () => {
      if (!bodyEl.classList.contains('revealed')) return;
      if (bodyEl.style.maxHeight === '' || bodyEl.style.maxHeight === 'none') {
        bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
      }
      void bodyEl.offsetHeight;
      bodyEl.classList.remove('revealed');
      bodyEl.style.maxHeight = '0px';
      title.setAttribute('aria-expanded', 'false');
      title.classList.remove('is-open');
      downBtn.removeAttribute('aria-hidden');
    };

    const toggle = () => (bodyEl.classList.contains('revealed') ? close() : open());

    title.addEventListener('click', toggle);
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    downBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    upBtn.addEventListener('click', (e) => { e.stopPropagation(); if (bodyEl.classList.contains('revealed')) close(); });

    bodyEl.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'max-height' && bodyEl.classList.contains('revealed')) {
        bodyEl.style.maxHeight = 'none';
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
