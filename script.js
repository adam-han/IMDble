const API_KEY = API_CONFIG.API_KEY

// my favorite movies
const MOVIE_POOL = [
    'Inception', 'La La Land', 'Marty Supreme', 'Interstellar', 'Yi Yi', 'Everything Everywhere All At Once', 'Spirited Away', 'Conclave', 'Past Lives', 'Dune: Part One', 'The Big Short', 'Get Out', 'Inside Out', 'The Secret Life of Walter Mitty', 'Good Will Hunting', 'Soul'
];

const CLUE_ORDER = ['Year', 'Genre', 'Director', 'Actors', 'imdbRating', 'Plot'];

let targetMovie = null;
let guessesUsed = 0;
const maxGuesses = 7;

const guessInput = document.getElementById('guess-input');
const dataList = document.getElementById('movie-options');
const guessBtn = document.getElementById('guess-btn');
const message = document.getElementById('message');
const statsLine = document.getElementById('stats-line');
const restartBtn = document.getElementById('restart-btn');


function updateAutocomplete(query) {
    dataList.innerHTML = ''; // Clear suggestions
    
    if (query.length < 2) return; // Exit if typing is too short

    const matches = MOVIE_POOL.filter(title => 
        title.toLowerCase().includes(query.toLowerCase())
    );

    matches.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        dataList.appendChild(option);
    });
}

async function startNewGame() {
    // reset game variables
    guessesUsed = 0;
    targetMovie = null;
    
    // reset text and colours
    message.innerText = "Loading movie...";
    message.style.color = "white";
    statsLine.innerText = `Guess the movie! ${maxGuesses} tries remaining.`;
    statsLine.style.color = "white";
    
    // reset input and buttons
    guessInput.disabled = false;
    guessInput.value = "";
    guessBtn.disabled = false;
    restartBtn.classList.add('hidden');
    dataList.innerHTML = ''; 

    // reset clue boxes visually
    document.querySelectorAll('.clue-box').forEach(box => {
        box.classList.remove('revealed');
        const id = box.id.replace('clue-', '');
        const label = id === 'imdbrating' ? 'IMDb Rating' : id.charAt(0).toUpperCase() + id.slice(1);
        box.innerText = `${label}: ???`;
    });

    // pick random movie
    const randomTitle = MOVIE_POOL[Math.floor(Math.random() * MOVIE_POOL.length)];
    console.log("Picking new movie:", randomTitle);

    try {
        const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(randomTitle)}&apikey=${API_KEY}`);
        const data = await res.json();
        
        if (data.Response === "True") {
            targetMovie = data;
            message.innerText = "";
        } else {
            console.error("OMDB Error:", data.Error);
            message.innerText = `API Error: ${data.Error} (${randomTitle})`;
        }
    } catch (err) {
        message.innerText = "Connection Error.";
    }
}

function handleGuess() {
    const userGuess = guessInput.value.trim();
    if (!userGuess || !targetMovie || guessesUsed >= maxGuesses) return;

    if (userGuess.toLowerCase() === targetMovie.Title.toLowerCase()) {
        message.innerHTML = `🎉 Correct! It was <span style="color:var(--accent)">${targetMovie.Title}</span>`;
        statsLine.innerText = ""; 
        revealAll();
        endGame();
    } else {
        guessesUsed++;
        if (guessesUsed <= CLUE_ORDER.length) revealNextClue();
        triggerShake();
        
        if (guessesUsed >= maxGuesses) {
            message.innerHTML = `Game Over! It was <span style="color:var(--accent)">${targetMovie.Title}</span>`;
            statsLine.innerText = ""; 
            revealAll();
            endGame();
        } else {
            const remaining = maxGuesses - guessesUsed;
            statsLine.innerText = `Guess the movie! ${remaining} ${remaining === 1 ? 'try' : 'tries'} remaining.`;
            if (remaining === 1) {
                statsLine.style.color = "#ff4d4d";
                statsLine.innerHTML = "<strong>Final Chance! All clues revealed.</strong>";
            }
        }
    }
    guessInput.value = "";
    dataList.innerHTML = ''; // clear suggestions after a guess
}

function revealNextClue() {
    const type = CLUE_ORDER[guessesUsed - 1];
    const el = document.getElementById(`clue-${type.toLowerCase()}`);
    if (el) {
        const label = type === 'imdbRating' ? 'IMDb Rating' : type;
        el.innerText = `${label}: ${targetMovie[type]}`;
        el.classList.add('revealed');
    }
}

function revealAll() {
    CLUE_ORDER.forEach(type => {
        const el = document.getElementById(`clue-${type.toLowerCase()}`);
        const label = type === 'imdbRating' ? 'IMDb Rating' : type;
        el.innerText = `${label}: ${targetMovie[type]}`;
        el.classList.add('revealed');
    });
}

function triggerShake() {
    guessInput.classList.add('shake');
    setTimeout(() => guessInput.classList.remove('shake'), 400);
}

function endGame() {
    guessInput.disabled = true;
    guessBtn.disabled = true;
    restartBtn.classList.remove('hidden');
}

// --- EVENT LISTENERS ---

// Triggered every time the user types
guessInput.addEventListener('input', (e) => {
    updateAutocomplete(e.target.value);
});

guessBtn.addEventListener('click', handleGuess);

guessInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') handleGuess(); 
});

restartBtn.addEventListener('click', startNewGame);

startNewGame();