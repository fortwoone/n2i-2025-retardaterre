const searchBar = document.getElementById('search-bar'); // La barre de recherche
const letters = document.querySelectorAll('.letter'); // Les lettres draggable
let focus = false;
const container_clavier = document.getElementById('container-clavier');
const canva = document.getElementById('canva');
const button = document.getElementById('search-btn');

// Callback function that returns the search string on each modification
function onSearchChange(searchString) {
    console.log('Search string updated:', searchString);
    
    // Check if "snake" was typed (case-insensitive)
    if (searchString.toLowerCase().trim() === 'snake') {
        openSnakePopup();
    } 
    if (searchString.toLowerCase().trim() === 'demarche') {
        openNirdPopup();
    } 
    
    return searchString;
}

// Function to open the snake popup
function openSnakePopup() {
    const snakePopup = document.getElementById('snake-popup');
    if (snakePopup) {
        document.location.href = "../www/snake.html";
    }
}

// Function to open the evidence popup
function openNirdPopup() {
    const nirdPopup = document.getElementById('nird-popup');
    if (nirdPopup) {
        nirdPopup.style.display = 'flex';
    }
}

// Ajout de l'événement `dragstart` aux lettres
letters.forEach((letter) => {
  letter.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text', letter.id); // Transférer l'ID de la lettre
  });
});

// Empêcher le comportement par défaut pour permettre le drop
searchBar.addEventListener('dragover', (event) => {
  event.preventDefault();
});

// Gérer l'événement `drop` pour la barre de recherche
searchBar.addEventListener('drop', (event) => {
  event.preventDefault(); // Empêcher l'action par défaut

  // Obtenez l'ID de la lettre déposée
  const droppedLetterId = event.dataTransfer.getData('text');
    const Hletter = document.getElementById(droppedLetterId);
    if (!Hletter) return; // safety

    // If the dropped tile is the back-arrow (explicit id or displayed as '←'), remove last char
    if (droppedLetterId === 'my-back') {
        searchBar.value = searchBar.value.slice(0, -1);
        onSearchChange(searchBar.value);
        return;
    }
    const visible = (Hletter.textContent || Hletter.innerText || '').trim();
    if (visible === '←') {
        searchBar.value = searchBar.value.slice(0, -1);
        onSearchChange(searchBar.value);
        return;
    }

    // Otherwise process as before (underscore id means space)
    const letter = (droppedLetterId.split('-')[1] == "_") ? " " : droppedLetterId.split('-')[1];
    if (letter != ' ') {
        Hletter.style.display = 'none';
    }

    // Append the dropped letter to the search bar
    searchBar.value += letter;
    onSearchChange(searchBar.value);
});

// Make the back-arrow tile clickable: clicking it deletes the last character
const backTile = document.getElementById('my-back');
if (backTile) {
    backTile.addEventListener('click', (e) => {
        e.stopPropagation();
        searchBar.value = searchBar.value.slice(0, -1);
        onSearchChange(searchBar.value);
    });
}


searchBar.addEventListener('click',(event) => {
    if (!focus){
        searchBar.classList.add('vertical-text');
        focus=true;
        container_clavier.style.display='grid';
        canva.style.display='block';
    }
});



const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

// Enable drawing on the canvas
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Commence un nouveau chemin (évite les lignes entre deux points non connectés)
    ctx.beginPath();
    ctx.moveTo(x, y); // Définir le point de départ pour le nouveau tracé
});
canvas.addEventListener('mouseup', () => {
    drawing = false;

    // Terminer le chemin pour éviter de tracer des lignes après le relâchement
    ctx.beginPath();
});
canvas.addEventListener('mousemove', draw);

function draw(e) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineTo(x, y);
    ctx.stroke();

    // Préparer un nouveau point pour le prochain mouvement
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('result').innerText = '';
}

// Recognize letter using Tesseract.js
function recognizeLetter() {
    const imageDataUrl = canvas.toDataURL('image/png'); // Convert canvas content to data URL
    document.getElementById('result').innerText = 'Reconnaissance en cours...';

    // Use Tesseract.js to recognize text
    Tesseract.recognize(imageDataUrl, 'eng', {
        logger: (info) => console.log(info), // Log progress (optional)
    })
        .then(({ data: { text } }) => {
            document.getElementById('result').innerText = `Lettre reconnue : ${text.trim()}`;
            const Lresult = text.trim().toLowerCase();
            const Cletter = document.getElementById('my-'+Lresult);
            Cletter.style.display='block';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        })
        .catch((error) => {
            console.error(error);
            document.getElementById('result').innerText = 'Erreur lors de la reconnaissance.';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
}

// Récupérer les éléments des pop-ups
const schclosePopup1 = document.getElementById('reset');
const schclosePopup = document.getElementById('schclosePopup');
const schpopup = document.getElementById('schpopup');
let timer;
let datetime;
// Fonction pour effectuer la recherche dans le texte
function performSearch() {
    const searchTerm = document.getElementById('search-bar').value.trim();
    const content = document.getElementById('text');

    if (!searchTerm || !content) return;

    // Supprimer les surlignages précédents
    content.innerHTML = content.innerHTML.replace(/<mark class="highlight">(.*?)<\/mark>/g, '$1');

    // Créer une regex en échappant les caractères spéciaux
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const updatedHTML = content.innerHTML.replace(regex, '<mark class="highlight">$1<\/mark>');
    content.innerHTML = updatedHTML;

    // Scroller vers le premier résultat
    const firstMatch = document.querySelector('.highlight');
    if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Bouton de recherche - déclencher la recherche au clic
button.addEventListener('click', () => {
    // show popup if exists (optional)
    if (schpopup) {
        schpopup.style.display = 'flex';
        datetime = new Date().toString();
    }

    performSearch();
});

// Help modal handlers
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const helpClose = document.getElementById('help-close');

function openHelp() {
    if (!helpModal) return;
    helpModal.setAttribute('aria-hidden', 'false');
}

function closeHelp() {
    if (!helpModal) return;
    helpModal.setAttribute('aria-hidden', 'true');
}

if (helpBtn) {
    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openHelp();
    });
}

if (helpClose) {
    helpClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeHelp();
    });
}

// Close modal when clicking outside content
if (helpModal) {
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) closeHelp();
    });
}