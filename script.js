const MAX_ERRORES = 8;

const composer = document.getElementById('composer');
const tuit = document.getElementById('tuit');
const count = document.getElementById('count');
const clickProgressCount = document.getElementById('click-progress-count');
const clickProgress = document.getElementById('click-progress-steps');
const btn = document.getElementById('publicar');
const errores = document.getElementById('errores');
const flashError = document.getElementById('flash-error');
const modal = document.getElementById('modal');
const reiniciar = document.getElementById('reiniciar');
const textoModal = document.getElementById('modal-texto-1');

let clicks = 0;
const audioError = new Audio('img/sonidoError.mp3');
audioError.preload = 'auto';

function actualizarProgreso() {
  const progreso = Math.min(clicks, MAX_ERRORES + 1);
  clickProgressCount.textContent = ``;
  clickProgress.setAttribute('aria-valuenow', String(progreso));
  [...clickProgress.children].forEach((segmento, indice) => {
    segmento.classList.toggle('complete', indice < progreso);
  });
}

const mensajes = [
  'Como cazadores de información, nos volvemos ciegos para las cosas silenciosas y discretas, incluidas las habituales, las menudas o las comunes, que no nos estimulan, pero nos anclan en el ser',
  'Corremos detrás de la información sin alcanzar un saber. Tomamos nota de todo sin obtener un conocimiento. Viajamos a todas partes sin adquirir una experiencia. Nos comunicamos continuamente sin participar en una comunidad. Acumulamos amigos y seguidores sin encontrarnos con el otro.',
  'La libertad de usar la yema de los dedos es una ilusión. La libre elección es en realidad una selección consumista... No vivimos en un reino de violencia, sino en un reino de información que se hace pasar por libertad',
];

function sonidoError() {
  audioError.currentTime = 0;
  const reproduccion = audioError.play();
  if (reproduccion) reproduccion.catch(() => {});
}

function destelloError() {
  flashError.classList.remove('activo');
  void flashError.offsetWidth;
  flashError.classList.add('activo');
}

const FOTOS = [
  'img/publi1.png',
  'img/publi2.png',
  'img/publi3.png',
  'img/publi4.png',
  'img/publi5.png',
  'img/publi6.png',
  'img/publi7.png',
  'img/publi8.png',
];

function acomodarImagenesError() {
  const imagenesCargadas = [...errores.querySelectorAll('img')]
    .filter((img) => img.complete && img.naturalWidth > 0);
  imagenesCargadas.forEach((img) => { img.style.visibility = 'hidden'; });
  imagenesCargadas.forEach((img) => posicionarImagenError(img, Number(img.dataset.numero)));
}

function crearImagenError(src, numero) {
  const img = document.createElement('img');
  img.alt = '';
  img.dataset.numero = String(numero);
  img.style.visibility = 'hidden';
  img.addEventListener('load', acomodarImagenesError, { once: true });
  img.src = src;
  return img;
}

function posicionarImagenError(img, numero) {
    const inputBounds = tuit.getBoundingClientRect();
    const maxHeight = Math.min(260, window.innerHeight * 0.42);
    let imageWidth = Math.min(300, window.innerWidth * 0.38, maxHeight * img.naturalWidth / img.naturalHeight);
    let imageHeight = imageWidth * img.naturalHeight / img.naturalWidth;
    const protectedZones = [
      { bounds: btn.getBoundingClientRect(), padding: 24 },
      { bounds: document.querySelector('.click-progress').getBoundingClientRect(), padding: 12 },
    ];
    const inputArea = inputBounds.width * inputBounds.height;
    const footprintFor = (left, top, width, height) => ({
      left: left - width * 0.06,
      right: left + width * 1.06,
      top: top - height * 0.06,
      bottom: top + height * 1.06,
    });
    const overlapArea = (first, second) => {
      const width = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
      const height = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
      return width * height;
    };
    const existingImages = [...errores.querySelectorAll('img')]
      .filter((other) => other !== img && other.style.visibility === 'visible')
      .map((other) => {
        const width = parseFloat(other.style.width);
        const height = width * other.naturalHeight / other.naturalWidth;
        const left = parseFloat(other.style.left);
        const top = parseFloat(other.style.top);
        return { left, top, width, height, footprint: footprintFor(left, top, width, height) };
      });
    let chosen = null;
    while (!chosen && imageWidth > 24) {
      const maxLeft = window.innerWidth - imageWidth;
      const maxTop = window.innerHeight - imageHeight;
      const targets = [
        [0, 0],
        [maxLeft, 0],
        [0, maxTop * 0.35],
        [maxLeft, maxTop * 0.35],
        [0, maxTop],
        [maxLeft, maxTop],
        [maxLeft * 0.38, 0],
        [maxLeft * 0.62, maxTop],
      ];
      const [targetLeft, targetTop] = targets[(numero - 1) % targets.length];
      const xPositions = [];
      const yPositions = [];
      for (let x = 0; x < maxLeft; x += 16) xPositions.push(x);
      for (let y = 0; y < maxTop; y += 16) yPositions.push(y);
      xPositions.push(maxLeft);
      yPositions.push(maxTop);
      let bestScore = Infinity;
      const imageFootprintArea = imageWidth * imageHeight * 1.12 * 1.12;
      yPositions.forEach((top) => xPositions.forEach((left) => {
        const footprint = footprintFor(left, top, imageWidth, imageHeight);
        if (protectedZones.some(({ bounds, padding }) => footprint.left < bounds.right + padding
          && footprint.right > bounds.left - padding
          && footprint.top < bounds.bottom + padding
          && footprint.bottom > bounds.top - padding)) return;
        if (overlapArea(footprint, inputBounds) > inputArea * 0.02) return;
        let imageOverlap = 0;
        for (const existing of existingImages) {
          const overlap = overlapArea(footprint, existing.footprint);
          const existingFootprintArea = (existing.footprint.right - existing.footprint.left)
            * (existing.footprint.bottom - existing.footprint.top);
          if (overlap > Math.min(imageFootprintArea, existingFootprintArea) * 0.05) return;
          const centerX = left + imageWidth / 2;
          const centerY = top + imageHeight / 2;
          const existingCenterX = existing.left + existing.width / 2;
          const existingCenterY = existing.top + existing.height / 2;
          const horizontalOffset = Math.max(12, Math.min(imageWidth, existing.width) * 0.06);
          const verticalOffset = Math.max(12, Math.min(imageHeight, existing.height) * 0.06);
          if (Math.abs(centerX - existingCenterX) < horizontalOffset
            || Math.abs(centerY - existingCenterY) < verticalOffset) return;
          imageOverlap += overlap;
        }
        const score = Math.hypot(left - targetLeft, top - targetTop) + imageOverlap / imageFootprintArea * 1000;
        if (score < bestScore) {
          bestScore = score;
          chosen = [left, top];
        }
      }));
      if (!chosen) {
        imageWidth *= 0.9;
        imageHeight *= 0.9;
      }
    }
    img.style.width = `${imageWidth}px`;
    img.style.left = `${chosen[0]}px`;
    img.style.top = `${chosen[1]}px`;
    img.style.visibility = 'visible';
}

function mostrarError(n) {
  errores.appendChild(crearImagenError(FOTOS[n - 1], n));
}

function sacarErrores() {
  errores.querySelectorAll('img').forEach((img) => img.classList.add('sale'));
  setTimeout(() => { errores.innerHTML = ''; }, 180);
}

function abrirModal() {
  const elegido = mensajes[Math.floor(Math.random() * mensajes.length)];
  textoModal.textContent = elegido;
  modal.hidden = false;
  reiniciar.focus();
}

function reiniciarTodo() {
  clicks = 0;
  document.documentElement.classList.remove('modo-dia');
  actualizarProgreso();
  tuit.value = '';
  count.textContent = '0 / 140';
  errores.innerHTML = '';
  modal.hidden = true;
  tuit.focus();
}

btn.addEventListener('click', () => {
  clicks++;
  actualizarProgreso();

  if (clicks <= MAX_ERRORES) {
    sonidoError();
    destelloError();
    mostrarError(clicks);
    composer.classList.remove('shake');
    void composer.offsetWidth;
    composer.classList.add('shake');
  } else if (clicks === MAX_ERRORES + 1) {
    sacarErrores();
    document.documentElement.classList.add('modo-dia');
  } else {
    abrirModal();
  }
});

tuit.addEventListener('input', () => {
  count.textContent = `${tuit.value.length} / 140`;
});

reiniciar.addEventListener('click', reiniciarTodo);