// Lista de palabras actualizada (sin "AL INFINITO Y MAS ALLA")
const palabras = [
  "FRANIA",
  "KENIA",
  "AMOR",
  "CUCHA",
  "TE AMO",
  "ERES TODO PARA MI",
  "KENICHI",
  "CUCHO",
  "FRANCHO",
  "VIDA",
  "AMOR DE LA VIDA"
];

const TAMANO = 14;
let matriz = [];
let seleccion = [];
let celdaInicio = null;
let palabrasEncontradas = [];

const tableroEl = document.getElementById('tablero');
const listaPalabrasEl = document.getElementById('listaPalabras');
const modalVictoria = document.getElementById('modalVictoria');
const cerrarModal = document.getElementById('cerrarModal');
const btnReiniciar = document.getElementById('btnReiniciar');
const btnMusica = document.getElementById('btnMusica');
const musicaFondo = document.getElementById('musicaFondo');

let musicaSonando = false;

// Control de Música MP3
btnMusica.addEventListener('click', () => {
  if (musicaSonando) {
    musicaFondo.pause();
    btnMusica.textContent = '🎵 Reproducir Música';
  } else {
    musicaFondo.play();
    btnMusica.textContent = '⏸️ Pausar Música';
  }
  musicaSonando = !musicaSonando;
});

function renderizarListaPalabras() {
  listaPalabrasEl.innerHTML = '';
  palabras.forEach(palabra => {
    const li = document.createElement('li');
    li.textContent = palabra;
    li.id = `palabra-${palabra.replace(/\s+/g, '')}`;
    if (palabrasEncontradas.includes(palabra)) {
      li.classList.add('encontrada');
    }
    listaPalabrasEl.appendChild(li);
  });
}

function crearMatrizVacia() {
  matriz = Array(TAMANO).fill(null).map(() => Array(TAMANO).fill(''));
}

const direcciones = [
  { r: 0, c: 1 },   // Horizontal
  { r: 1, c: 0 },   // Vertical
  { r: 1, c: 1 },   // Diagonal abajo-derecha
  { r: -1, c: 1 }   // Diagonal arriba-derecha
];

function colocarPalabra(palabraOriginal) {
  const palabra = palabraOriginal.replace(/\s+/g, '');
  let colocada = false;
  let intentos = 0;

  while (!colocada && intentos < 300) {
    intentos++;
    const dir = direcciones[Math.floor(Math.random() * direcciones.length)];
    const filaInicio = Math.floor(Math.random() * TAMANO);
    const colInicio = Math.floor(Math.random() * TAMANO);

    const filaFin = filaInicio + dir.r * (palabra.length - 1);
    const colFin = colInicio + dir.c * (palabra.length - 1);

    if (filaFin >= 0 && filaFin < TAMANO && colFin >= 0 && colFin < TAMANO) {
      let sePuede = true;
      for (let i = 0; i < palabra.length; i++) {
        const r = filaInicio + dir.r * i;
        const c = colInicio + dir.c * i;
        if (matriz[r][c] !== '' && matriz[r][c] !== palabra[i]) {
          sePuede = false;
          break;
        }
      }

      if (sePuede) {
        for (let i = 0; i < palabra.length; i++) {
          const r = filaInicio + dir.r * i;
          const c = colInicio + dir.c * i;
          matriz[r][c] = palabra[i];
        }
        colocada = true;
      }
    }
  }
}

function llenarEspaciosVacios() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < TAMANO; r++) {
    for (let c = 0; c < TAMANO; c++) {
      if (matriz[r][c] === '') {
        matriz[r][c] = letras[Math.floor(Math.random() * letras.length)];
      }
    }
  }
}

function renderizarTablero() {
  tableroEl.innerHTML = '';
  for (let r = 0; r < TAMANO; r++) {
    for (let c = 0; c < TAMANO; c++) {
      const celda = document.createElement('div');
      celda.className = 'celda';
      celda.dataset.fila = r;
      celda.dataset.col = c;
      celda.textContent = matriz[r][c];

      // Eventos Táctiles y de Ratón
      celda.addEventListener('pointerdown', manejarInicioTocando);
      celda.addEventListener('pointerenter', manejarMoverTocando);

      tableroEl.appendChild(celda);
    }
  }

  document.addEventListener('pointerup', manejarFinTocando);
}

function manejarInicioTocando(e) {
  e.preventDefault();
  if (!musicaSonando) {
    musicaFondo.play().then(() => {
      musicaSonando = true;
      btnMusica.textContent = '⏸️ Pausar Música';
    }).catch(() => {});
  }

  const celda = e.target.closest('.celda');
  if (!celda) return;

  // Selección fácil para móviles (Tocar inicio y fin)
  if (!celdaInicio) {
    limpiarSeleccion();
    celdaInicio = celda;
    marcarLinea(celdaInicio, celdaInicio);
  } else {
    marcarLinea(celdaInicio, celda);
    verificarPalabra();
    celdaInicio = null;
  }
}

function manejarMoverTocando(e) {
  if (e.buttons === 1 && celdaInicio) {
    const celda = document.elementFromPoint(e.clientX, e.clientY)?.closest('.celda');
    if (celda) {
      marcarLinea(celdaInicio, celda);
    }
  }
}

function manejarFinTocando() {
  if (seleccion.length > 1 && celdaInicio) {
    verificarPalabra();
    celdaInicio = null;
  }
}

function marcarLinea(inicio, fin) {
  limpiarSeleccion();

  const r1 = parseInt(inicio.dataset.fila);
  const c1 = parseInt(inicio.dataset.col);
  const r2 = parseInt(fin.dataset.fila);
  const c2 = parseInt(fin.dataset.col);

  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);

  if (r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1)) {
    let currR = r1;
    let currC = c1;

    while (true) {
      const celdaEl = document.querySelector(`.celda[data-fila="${currR}"][data-col="${currC}"]`);
      if (celdaEl) {
        celdaEl.classList.add('seleccionada');
        seleccion.push(celdaEl);
      }
      if (currR === r2 && currC === c2) break;
      currR += dr;
      currC += dc;
    }
  }
}

function limpiarSeleccion() {
  document.querySelectorAll('.celda.seleccionada').forEach(el => el.classList.remove('seleccionada'));
  seleccion = [];
}

function verificarPalabra() {
  const textoSeleccionado = seleccion.map(el => el.textContent).join('');
  const textoInvertido = textoSeleccionado.split('').reverse().join('');

  let palabraEncontrada = null;

  palabras.forEach(pal => {
    const limpia = pal.replace(/\s+/g, '');
    if ((limpia === textoSeleccionado || limpia === textoInvertido) && !palabrasEncontradas.includes(pal)) {
      palabraEncontrada = pal;
    }
  });

  if (palabraEncontrada) {
    palabrasEncontradas.push(palabraEncontrada);
    seleccion.forEach(el => el.classList.add('encontrada'));
    document.getElementById(`palabra-${palabraEncontrada.replace(/\s+/g, '')}`).classList.add('encontrada');

    if (palabrasEncontradas.length === palabras.length) {
      lanzarLluviaCorazones();
      setTimeout(() => {
        modalVictoria.classList.remove('oculto');
      }, 500);
    }
  }

  limpiarSeleccion();
}

function lanzarLluviaCorazones() {
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const corazon = document.createElement('div');
      corazon.className = 'corazon-flotante';
      corazon.textContent = ['❤️', '💖', '💕', '💗', '🌸'][Math.floor(Math.random() * 5)];
      corazon.style.left = `${Math.random() * 100}vw`;
      document.body.appendChild(corazon);

      setTimeout(() => corazon.remove(), 3000);
    }, i * 80);
  }
}

function iniciarJuego() {
  palabrasEncontradas = [];
  celdaInicio = null;
  crearMatrizVacia();
  palabras.forEach(p => colocarPalabra(p));
  llenarEspaciosVacios();
  renderizarListaPalabras();
  renderizarTablero();
}

cerrarModal.addEventListener('click', () => modalVictoria.classList.add('oculto'));
btnReiniciar.addEventListener('click', iniciarJuego);

iniciarJuego();
