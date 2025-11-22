/* ===================== Collage ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const imageCount = 15;
  const collageBoxes = Array.from(document.querySelectorAll(".collage-box"));
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

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function crossfadeImage(box, newSrc) {
    const oldImg = box.querySelector("img");
    const newImg = document.createElement("img");
    newImg.src = newSrc;
    newImg.style.opacity = 0;
    newImg.style.transition = "opacity 1s ease-in-out";
    newImg.style.position = "absolute";
    newImg.style.top = 0;
    newImg.style.left = 0;
    newImg.style.width = "100%";
    newImg.style.height = "100%";
    newImg.style.objectFit = "cover";
    box.appendChild(newImg);

    requestAnimationFrame(() => {
      newImg.style.opacity = 1;
      if (oldImg) oldImg.style.opacity = 0;
    });

    setTimeout(() => {
      if (oldImg && oldImg.parentNode === box) box.removeChild(oldImg);
    }, 1000);
  }

  function initialize() {
    const images = shuffle([...imagePaths]).slice(0, collageBoxes.length);
    collageBoxes.forEach((box, i) => {
      const img = document.createElement("img");
      img.src = images[i];
      img.style.opacity = 1;
      img.style.transition = "opacity 1s ease-in-out";
      img.style.position = "absolute";
      img.style.top = 0;
      img.style.left = 0;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      box.appendChild(img);
    });
  }

  function runCycle() {
    const images = shuffle([...imagePaths]).slice(0, collageBoxes.length);
    collageBoxes.forEach((box, i) => {
      const offset = (offsets[i] || 0) * 1000;
      setTimeout(() => { crossfadeImage(box, images[i]); }, 6000 + offset);
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

/* PDF “View” buttons: add a brief pressed animation on click */
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
