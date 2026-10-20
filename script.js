// Palabras personalizadas
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

const TAMANO = 14; // Matriz 14x14
let matriz = [];
let seleccion = [];
let seleccionando = false;
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

// Crear lista de palabras en HTML
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

// Inicializar matriz vacía
function crearMatrizVacia() {
  matriz = Array(TAMANO).fill(null).map(() => Array(TAMANO).fill(''));
}

// Direcciones posibles: Horizontal, Vertical y Diagonal
const direcciones = [
  { r: 0, c: 1 },   // Horizontal derecha
  { r: 1, c: 0 },   // Vertical abajo
  { r: 1, c: 1 },   // Diagonal abajo-derecha
  { r: -1, c: 1 }   // Diagonal arriba-derecha
];

// Colocar palabra limpia (sin espacios) en el tablero
function colocarPalabra(palabraOriginal) {
  const palabra = palabraOriginal.replace(/\s+/g, '');
  let colocada = false;
  let intentos = 0;

  while (!colocada && intentos < 200) {
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

// Llenar espacios vacíos con letras aleatorias
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

// Dibujar tablero en HTML
function renderizarTablero() {
  tableroEl.innerHTML = '';
  for (let r = 0; r < TAMANO; r++) {
    for (let c = 0; c < TAMANO; c++) {
      const celda = document.createElement('div');
      celda.className = 'celda';
      celda.dataset.fila = r;
      celda.dataset.col = c;
      celda.textContent = matriz[r][c];

      // Eventos Touch y Mouse
      celda.addEventListener('mousedown', iniciarSeleccion);
      celda.addEventListener('mouseenter', moverSeleccion);
      celda.addEventListener('touchstart', (e) => {
        e.preventDefault();
        iniciarSeleccion(e);
      });
      
      tableroEl.appendChild(celda);
    }
  }

  document.addEventListener('mouseup', finalizarSeleccion);
  document.addEventListener('touchend', finalizarSeleccion);
}

function iniciarSeleccion(e) {
  if (!musicaSonando) {
    musicaFondo.play().then(() => {
      musicaSonando = true;
      btnMusica.textContent = '⏸️ Pausar Música';
    }).catch(() => {});
  }

  seleccionando = true;
  limpiarSeleccionActual();
  const target = e.target.closest('.celda') || document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
  if (target && target.classList.contains('celda')) {
    agregarACeldaSeleccionada(target);
  }
}

function moverSeleccion(e) {
  if (!seleccionando) return;
  const target = e.target.closest('.celda');
  if (target && !seleccion.includes(target)) {
    agregarACeldaSeleccionada(target);
  }
}

function agregarACeldaSeleccionada(celdaEl) {
  seleccion.push(celdaEl);
  celdaEl.classList.add('seleccionada');
}

function limpiarSeleccionActual() {
  seleccion.forEach(el => el.classList.remove('seleccionada'));
  seleccion = [];
}

function finalizarSeleccion() {
  if (!seleccionando) return;
  seleccionando = false;

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

  limpiarSeleccionActual();
}

// Lluvia de corazones al ganar
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

// Iniciar Juego
function iniciarJuego() {
  palabrasEncontradas = [];
  crearMatrizVacia();
  palabras.forEach(p => colocarPalabra(p));
  llenarEspaciosVacios();
  renderizarListaPalabras();
  renderizarTablero();
}

// Eventos de Modal
cerrarModal.addEventListener('click', () => modalVictoria.classList.add('oculto'));
btnReiniciar.addEventListener('click', iniciarJuego);

// Cargar la primera vez
iniciarJuego();
