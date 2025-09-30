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

  const cycleLength = 6800; // ms (last offset 0.8s + 6s hold time)

  // Shuffle utility
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
      if (oldImg && oldImg.parentNode === box) {
        box.removeChild(oldImg);
      }
    }, 1000);
  }

  function initialize() {
    // pick 9 unique images for first cycle
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
    // select 9 unique new images for this cycle
    const images = shuffle([...imagePaths]).slice(0, collageBoxes.length);

    collageBoxes.forEach((box, i) => {
      const offset = offsets[i] * 1000;
      setTimeout(() => {
        crossfadeImage(box, images[i]);
      }, 6000 + offset); // all start fading after 6s + offset
    });

    // schedule next cycle
    setTimeout(runCycle, cycleLength);
  }

  // Initialize first set
  initialize();
  // Start loop
  runCycle();
});


// Animate horizontal lines when they come into view

const scrollLines = document.querySelectorAll('.animated-line');

function updateScrollLines() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;

  scrollLines.forEach(line => {
    const rect = line.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    
    // How far the element is from bottom of viewport
    const relativeScroll = (scrollY + windowHeight - elementTop) / windowHeight;

    // Clamp between 0 and 1
    const progress = Math.max(0, Math.min(1, relativeScroll));

    // Set width based on scroll position
    line.style.width = `${progress * 100}%`;
  });
}

window.addEventListener('scroll', updateScrollLines);
window.addEventListener('resize', updateScrollLines);
window.addEventListener('DOMContentLoaded', updateScrollLines);
