/* =========================================
   TYPING RUSH
   COMPLETE TYPING SYSTEM
   ========================================= */

// -----------------------------------------
// ELEMENTS
// -----------------------------------------

const playButton = document.getElementById("play-button");
const restartButton = document.getElementById("restart-button");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const wordArea = document.getElementById("word-area");
const typingInput = document.getElementById("typing-input");

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const heartsElement = document.getElementById("hearts");

const heartBreakAnimation = document.getElementById("heart-break-animation");

const levelCompleteAnimation = document.getElementById(
  "level-complete-animation",
);

const completedLevelElement = document.getElementById("completed-level");

const levelCompleteScoreElement = document.getElementById(
  "level-complete-score",
);

const finalScoreElement = document.getElementById("final-score");

const finalWordsElement = document.getElementById("final-words");

const finalAccuracyElement = document.getElementById("final-accuracy");
const bestScoreElement = document.getElementById("best-score");
const BEST_SCORE_KEY = "ilovefasttools_typing_rush_best_score";
let bestScore = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);

// -----------------------------------------
// WORD LISTS
// -----------------------------------------

// -----------------------------------------
// LEVEL SETTINGS
// -----------------------------------------

const levelSettings = {
  1: {
    totalWords: 10,
    simultaneousWords: 1,
    words: WORD_BANK.easy,
    speed: 0.6,
  },

  2: {
    totalWords: 15,
    simultaneousWords: 1,
    words: WORD_BANK.normal,
    speed: 0.68,
  },

  3: {
    totalWords: 15,
    simultaneousWords: 1,
    words: WORD_BANK.medium,
    speed: 0.76,
  },

  4: {
    totalWords: 15,
    simultaneousWords: 2,
    words: WORD_BANK.hard,
    speed: 0.84,
  },
};

// -----------------------------------------
// UNLIMITED LEVEL SETTINGS
// -----------------------------------------

function ensureLevelSettings(targetLevel) {
  if (levelSettings[targetLevel]) {
    return levelSettings[targetLevel];
  }

  const extraLevel = targetLevel - 4;

  levelSettings[targetLevel] = {
    totalWords: 15,

    simultaneousWords: Math.min(3, 2 + Math.floor(extraLevel / 3)),

    words: WORD_BANK.tough,

    speed: Math.min(1.8, 0.84 + extraLevel * 0.06),
  };

  return levelSettings[targetLevel];
}
// -----------------------------------------
// GAME STATE
// -----------------------------------------
// -----------------------------------------
// RANDOM WORD BAGS
// -----------------------------------------

const wordBags = {};
// -----------------------------------------
// USED WORD HISTORY
// -----------------------------------------

const USED_WORDS_KEY = "ilovefasttools_typing_rush_used_words";

let usedWords = JSON.parse(localStorage.getItem(USED_WORDS_KEY) || "[]");

// Maximum old words to remember
const MAX_USED_WORDS = 1000;

// -----------------------------------------
// SAVE USED WORD
// -----------------------------------------

function saveUsedWord(word) {
  if (!word) {
    return;
  }

  if (!usedWords.includes(word)) {
    usedWords.push(word);
  }

  // Keep history limited
  if (usedWords.length > MAX_USED_WORDS) {
    usedWords = usedWords.slice(-MAX_USED_WORDS);
  }

  localStorage.setItem(USED_WORDS_KEY, JSON.stringify(usedWords));
}

function shuffleWords(words) {
  const shuffled = [...words];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

let score = 0;
let lives = 5;

let level = 1;

let wordsCompleted = 0;
// -----------------------------------------
// TOTAL WORDS COMPLETED — ENTIRE GAME
// -----------------------------------------

let totalWordsCompleted = 0;

let activeWords = [];

let typingWord = null;

let wordSpeed = 0.6;

let animationFrame = null;

let gameRunning = false;

let levelTransitioning = false;
// -----------------------------------------
// MOBILE KEYBOARD / VIEWPORT HANDLER
// -----------------------------------------

function syncTypingGameViewport() {
  if (!wordArea) {
    return;
  }

  const gameContainer = wordArea.closest(".game-container");

  if (!gameContainer) {
    return;
  }

  // Desktop ko bilkul touch nahi karna
  if (window.innerWidth > 600) {
    gameContainer.style.removeProperty("--typing-game-height");
    return;
  }

  const viewport = window.visualViewport;

  if (!viewport) {
    return;
  }

  const gameRect = gameContainer.getBoundingClientRect();

  // Keyboard open hone par visible viewport ka bottom
  const visibleBottom = viewport.height + viewport.offsetTop;

  // Game ke top se visible bottom tak available space
  let availableHeight = visibleBottom - gameRect.top - 10;

  // Input + danger line + word ke liye minimum usable height
  availableHeight = Math.max(360, availableHeight);

  // Normal mobile game height se bada nahi hone dena
  availableHeight = Math.min(570, availableHeight);

  gameContainer.style.setProperty(
    "--typing-game-height",
    `${availableHeight}px`,
  );
}

// -----------------------------------------
// MOBILE-SAFE INPUT FOCUS
// -----------------------------------------

function focusTypingInput() {
  if (!typingInput) {
    return;
  }

  // Mobile
  if (window.innerWidth <= 600) {
    const currentScrollY = window.scrollY;

    try {
      typingInput.focus({
        preventScroll: true,
      });
    } catch {
      typingInput.focus();
    }

    syncTypingGameViewport();

    // Browser ke automatic scroll ko prevent karo
    requestAnimationFrame(() => {
      window.scrollTo(0, currentScrollY);
      syncTypingGameViewport();
    });

    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
      syncTypingGameViewport();
    }, 120);

    setTimeout(() => {
      syncTypingGameViewport();
    }, 350);

    return;
  }

  // Desktop
  typingInput.focus();
}

// -----------------------------------------
// LISTEN FOR MOBILE KEYBOARD RESIZE
// -----------------------------------------

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", syncTypingGameViewport);

  window.visualViewport.addEventListener("scroll", syncTypingGameViewport);
}

window.addEventListener("resize", syncTypingGameViewport);

window.addEventListener("orientationchange", () => {
  setTimeout(syncTypingGameViewport, 250);
});

// -----------------------------------------
// GAME STATISTICS
// -----------------------------------------

let totalTypedCharacters = 0;
let correctTypedCharacters = 0;

// -----------------------------------------
// PERSISTENT BEST SCORE
// -----------------------------------------

function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;

    localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
  }
}
// -----------------------------------------
// RANDOM WORD
// -----------------------------------------

function getRandomWord() {
  const settings = ensureLevelSettings(level);

  const poolKey = String(level);

  // Create shuffled bag if needed
  if (!wordBags[poolKey] || wordBags[poolKey].length === 0) {
    wordBags[poolKey] = shuffleWords(settings.words);
  }

  // ---------------------------------------
  // FIND A NEW WORD
  // ---------------------------------------

  let selectedWord = null;

  while (wordBags[poolKey].length > 0) {
    const candidate = wordBags[poolKey].pop();

    // Skip words already shown to this user
    if (!usedWords.includes(candidate)) {
      selectedWord = candidate;
      break;
    }
  }

  // ---------------------------------------
  // IF ALL WORDS WERE ALREADY USED
  // ---------------------------------------

  if (!selectedWord) {
    // Create a fresh shuffled pool
    const availableWords = settings.words.filter(
      (word) => !usedWords.includes(word),
    );

    // If there are still unused words
    if (availableWords.length > 0) {
      wordBags[poolKey] = shuffleWords(availableWords);

      selectedWord = wordBags[poolKey].pop();
    }

    // If entire word bank has been used
    // allow the pool to start again
    if (!selectedWord) {
      wordBags[poolKey] = shuffleWords(settings.words);

      selectedWord = wordBags[poolKey].pop();
    }
  }

  // ---------------------------------------
  // REMEMBER THIS WORD
  // ---------------------------------------

  saveUsedWord(selectedWord);

  return selectedWord;
}

// -----------------------------------------
// UPDATE HEARTS
// -----------------------------------------

function updateHearts() {
  heartsElement.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const heart = document.createElement("span");

    heart.textContent = i < lives ? "❤️" : "🖤";

    heartsElement.appendChild(heart);
  }
}

// -----------------------------------------
// HEART BREAK ANIMATION
// -----------------------------------------

function showHeartBreak() {
  heartBreakAnimation.classList.remove("hidden");

  heartBreakAnimation.style.animation = "none";

  void heartBreakAnimation.offsetWidth;

  heartBreakAnimation.style.animation = "";

  setTimeout(() => {
    heartBreakAnimation.classList.add("hidden");
  }, 1500);
}

// -----------------------------------------
// CREATE WORD
// -----------------------------------------

function createWord() {
  const word = getRandomWord();

  const wordElement = document.createElement("div");

  wordElement.className = "word-card falling-word";

  // ---------------------------------------
  // RANDOM POSITION
  // ---------------------------------------

  const gameWidth = wordArea.clientWidth;

  const wordWidth = 150;

  const minX = 25;

  const maxX = Math.max(minX, gameWidth - wordWidth - 25);

  const randomX = Math.random() * (maxX - minX) + minX;

  // ---------------------------------------
  // WORD OBJECT
  // ---------------------------------------

  const wordObject = {
    text: word,

    element: wordElement,

    x: randomX,

    y: 35,

    speed: wordSpeed,

    typedText: "",

    completed: false,
  };

  // ---------------------------------------
  // POSITION
  // ---------------------------------------

  wordElement.style.left = `${randomX}px`;

  wordElement.style.top = `${wordObject.y}px`;

  // ---------------------------------------
  // ADD TO GAME
  // ---------------------------------------

  wordArea.appendChild(wordElement);

  activeWords.push(wordObject);

  // ---------------------------------------
  // DRAW WORD
  // ---------------------------------------

  renderWord(wordObject);

  return wordObject;
}

// -----------------------------------------
// RENDER WORD
// -----------------------------------------

function renderWord(wordObject) {
  if (!wordObject.element) {
    return;
  }

  wordObject.element.innerHTML = "";

  const targetWord = wordObject.text;

  const typedText = wordObject.typedText || "";

  // ---------------------------------------
  // RENDER TARGET CHARACTERS
  // ---------------------------------------

  for (let i = 0; i < targetWord.length; i++) {
    const character = document.createElement("span");

    character.textContent = targetWord[i];

    // -------------------------------------
    // CHARACTER WAS TYPED
    // -------------------------------------

    if (i < typedText.length) {
      if (typedText[i] === targetWord[i]) {
        // CORRECT
        character.className = "char-correct";
      } else {
        // WRONG
        character.className = "char-wrong";
      }
    }

    // -------------------------------------
    // CHARACTER NOT TYPED
    // -------------------------------------
    else {
      character.className = "char-remaining";
    }

    wordObject.element.appendChild(character);
  }

  // ---------------------------------------
  // EXTRA WRONG CHARACTERS
  // ---------------------------------------

  if (typedText.length > targetWord.length) {
    const extraCharacters = typedText.slice(targetWord.length);

    for (const extraCharacter of extraCharacters) {
      const character = document.createElement("span");

      character.textContent = extraCharacter;

      character.className = "char-wrong";

      wordObject.element.appendChild(character);
    }
  }
}

// -----------------------------------------
// REMOVE WORD
// -----------------------------------------

function removeWord(wordObject) {
  if (!wordObject) {
    return;
  }

  // Remove from array

  const index = activeWords.indexOf(wordObject);

  if (index !== -1) {
    activeWords.splice(index, 1);
  }

  // Remove from screen

  if (wordObject.element) {
    wordObject.element.remove();

    wordObject.element = null;
  }

  // Reset typing target

  if (typingWord === wordObject) {
    typingWord = null;
  }
}

// -----------------------------------------
// REMOVE ALL WORDS
// -----------------------------------------

function removeAllWords() {
  activeWords.forEach((word) => {
    if (word.element) {
      word.element.remove();
    }
  });

  activeWords = [];

  typingWord = null;
}

// -----------------------------------------
// SPAWN WORDS
// -----------------------------------------

function spawnInitialWords() {
  removeAllWords();

  const settings = levelSettings[level];

  for (let i = 0; i < settings.simultaneousWords; i++) {
    createWord();
  }
}

// -----------------------------------------
// SPAWN REPLACEMENT WORD
// -----------------------------------------

function spawnReplacementWord() {
  if (!gameRunning) {
    return;
  }

  const settings = levelSettings[level];

  if (wordsCompleted >= settings.totalWords) {
    return;
  }

  if (activeWords.length < settings.simultaneousWords) {
    createWord();
  }
}

// -----------------------------------------
// MOVE WORDS
// -----------------------------------------

function moveWords() {
  if (!gameRunning) {
    return;
  }

  const dangerLine = document.querySelector(".danger-line");

  if (!dangerLine) {
    return;
  }

  const wordAreaRect = wordArea.getBoundingClientRect();
  const dangerLineRect = dangerLine.getBoundingClientRect();

  // Actual danger line ki TOP position
  const dangerY = dangerLineRect.top - wordAreaRect.top;
  for (let i = activeWords.length - 1; i >= 0; i--) {
    const word = activeWords[i];

    if (!word || word.completed) {
      continue;
    }

    // -------------------------------------
    // MOVE
    // -------------------------------------

    word.y += word.speed;

    word.element.style.top = `${word.y}px`;

    // -------------------------------------
    // DANGER LINE
    // -------------------------------------

    const wordRect = word.element.getBoundingClientRect();
    const dangerRect = dangerLine.getBoundingClientRect();

    const wordBottom = wordRect.bottom;
    const dangerTop = dangerRect.top;

    if (wordBottom >= dangerTop) {
      const wordAreaRect = wordArea.getBoundingClientRect();

      word.y = dangerRect.top - wordAreaRect.top - word.element.offsetHeight;

      word.element.style.top = `${word.y}px`;

      // -----------------------------------
      // LOSE LIFE
      // -----------------------------------

      lives--;

      updateHearts();

      showHeartBreak();

      // -----------------------------------
      // CLEAR INPUT
      // -----------------------------------

      typingInput.value = "";

      typingInput.classList.remove("typing-error");

      // -----------------------------------
      // RESET TYPING
      // -----------------------------------

      if (typingWord) {
        typingWord.typedText = "";

        renderWord(typingWord);
      }

      typingWord = null;

      // -----------------------------------
      // REMOVE MISSED WORD
      // -----------------------------------

      removeWord(word);

      // -----------------------------------
      // GAME OVER
      // -----------------------------------

      if (lives <= 0) {
        gameRunning = false;

        cancelAnimationFrame(animationFrame);

        setTimeout(() => {
          endGame();
        }, 2500);

        return;
      }

      // -----------------------------------
      // SPAWN NEW WORD
      // -----------------------------------

      setTimeout(() => {
        if (!gameRunning) {
          return;
        }

        spawnReplacementWord();

        focusTypingInput();
      }, 250);
    }
  }

  animationFrame = requestAnimationFrame(moveWords);
}

// -----------------------------------------
// START MOVEMENT
// -----------------------------------------

function startMovement() {
  cancelAnimationFrame(animationFrame);

  animationFrame = requestAnimationFrame(moveWords);
}

// -----------------------------------------
// START GAME
// -----------------------------------------

function startGame() {
  Object.keys(wordBags).forEach((key) => delete wordBags[key]);
  cancelAnimationFrame(animationFrame);

  // ---------------------------------------
  // RESET GAME
  // ---------------------------------------

  score = 0;

  lives = 5;

  level = 1;

  wordsCompleted = 0;
  totalWordsCompleted = 0;

  wordSpeed = levelSettings[1].speed;

  typingWord = null;

  levelTransitioning = false;

  totalTypedCharacters = 0;

  correctTypedCharacters = 0;

  gameRunning = true;

  // ---------------------------------------
  // RESET UI
  // ---------------------------------------

  updateHearts();

  bestScoreElement.textContent = bestScore;
  scoreElement.textContent = score;

  levelElement.textContent = level;

  // ---------------------------------------
  // SCREENS
  // ---------------------------------------

  startScreen.classList.add("hidden");

  gameOverScreen.classList.add("hidden");

  levelCompleteAnimation.classList.add("hidden");

  gameScreen.classList.remove("hidden");

  // ---------------------------------------
  // RESET INPUT
  // ---------------------------------------

  typingInput.value = "";

  typingInput.classList.remove("typing-error");

  // ---------------------------------------
  // SPAWN
  // ---------------------------------------

  spawnInitialWords();

  // ---------------------------------------
  // FOCUS
  // ---------------------------------------

  setTimeout(() => {
    focusTypingInput();
    syncTypingGameViewport();
  }, 100);

  // ---------------------------------------
  // START LOOP
  // ---------------------------------------

  startMovement();
}

// -----------------------------------------
// COMPLETE WORD
// -----------------------------------------
// -----------------------------------------
// WORD BLAST EFFECT
// -----------------------------------------

function showWordBlast(wordObject) {
  if (!wordObject || !wordObject.element) {
    return;
  }

  const blastContainer = document.getElementById("word-blast-effects");

  if (!blastContainer) {
    return;
  }

  // ---------------------------------------
  // WORD POSITION
  // ---------------------------------------

  const wordRect = wordObject.element.getBoundingClientRect();

  const containerRect = blastContainer.getBoundingClientRect();

  const centerX = wordRect.left + wordRect.width / 2 - containerRect.left;

  const centerY = wordRect.top + wordRect.height / 2 - containerRect.top;

  // ---------------------------------------
  // FLASH
  // ---------------------------------------

  const flash = document.createElement("div");

  flash.className = "word-blast-flash";

  flash.style.left = `${centerX}px`;

  flash.style.top = `${centerY}px`;

  blastContainer.appendChild(flash);

  // ---------------------------------------
  // RING
  // ---------------------------------------

  const ring = document.createElement("div");

  ring.className = "word-blast-ring";

  ring.style.left = `${centerX}px`;

  ring.style.top = `${centerY}px`;

  blastContainer.appendChild(ring);

  // ---------------------------------------
  // PARTICLES
  // ---------------------------------------

  const particleCount = 14;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");

    const shape = Math.random();

    if (shape < 0.33) {
      particle.className = "blast-particle square";
    } else if (shape < 0.66) {
      particle.className = "blast-particle star";
    } else {
      particle.className = "blast-particle";
    }

    // Random direction

    const angle = Math.random() * Math.PI * 2;

    const distance = 55 + Math.random() * 65;

    const x = Math.cos(angle) * distance;

    const y = Math.sin(angle) * distance;

    particle.style.left = `${centerX}px`;

    particle.style.top = `${centerY}px`;

    particle.style.setProperty("--particle-x", `${x}px`);

    particle.style.setProperty("--particle-y", `${y}px`);

    // Slight random size

    const size = 4 + Math.random() * 5;

    particle.style.width = `${size}px`;

    particle.style.height = `${size}px`;

    blastContainer.appendChild(particle);
  }

  // ---------------------------------------
  // CLEANUP
  // ---------------------------------------

  setTimeout(() => {
    flash.remove();

    ring.remove();

    blastContainer.querySelectorAll(".blast-particle").forEach((particle) => {
      particle.remove();
    });
  }, 650);
}

function completeWord(wordObject) {
  if (!gameRunning || !wordObject || wordObject.completed) {
    return;
  }

  // ---------------------------------------
  // MARK COMPLETE
  // ---------------------------------------

  wordObject.completed = true;

  // ---------------------------------------
  // SCORE
  // ---------------------------------------

  score += 100;

  wordsCompleted++;
  totalWordsCompleted++;
  if (score > bestScore) {
    bestScore = score;

    localStorage.setItem(BEST_SCORE_KEY, String(bestScore));

    bestScoreElement.textContent = bestScore;
  }

  scoreElement.textContent = score;

  // ---------------------------------------
  // SHOW EVERYTHING GREEN
  // ---------------------------------------

  wordObject.typedText = wordObject.text;

  renderWord(wordObject);

  wordObject.element.classList.add("word-success");
  showWordBlast(wordObject);

  // ---------------------------------------
  // REMOVE FROM ACTIVE WORDS NOW
  // ---------------------------------------

  const index = activeWords.indexOf(wordObject);

  if (index !== -1) {
    activeWords.splice(index, 1);
  }

  if (typingWord === wordObject) {
    typingWord = null;
  }

  // ---------------------------------------
  // CLEAR INPUT
  // ---------------------------------------

  typingInput.value = "";

  typingInput.classList.remove("typing-error");

  // ---------------------------------------
  // REMOVE VISUAL AFTER ANIMATION
  // ---------------------------------------

  setTimeout(() => {
    if (wordObject.element) {
      wordObject.element.remove();

      wordObject.element = null;
    }
  }, 250);

  // ---------------------------------------
  // CHECK LEVEL COMPLETE
  // ---------------------------------------

  const settings = levelSettings[level];

  if (wordsCompleted >= settings.totalWords) {
    setTimeout(() => {
      completeLevel();
    }, 300);

    return;
  }

  // ---------------------------------------
  // SPAWN NEXT WORD
  // ---------------------------------------

  setTimeout(() => {
    if (!gameRunning) {
      return;
    }

    if (activeWords.length < settings.simultaneousWords) {
      createWord();
    }

    focusTypingInput();
  }, 250);
}

// -----------------------------------------
// FIND WORD FOR TYPING
// -----------------------------------------

function findWordForTyping(firstCharacter) {
  // First preference:
  // word beginning with typed character

  const matchingWord = activeWords.find(
    (word) => !word.completed && word.text[0] === firstCharacter,
  );

  if (matchingWord) {
    return matchingWord;
  }

  // If first character is wrong,
  // use first available word.
  // This allows RED feedback
  // even on the first character.

  return activeWords.find((word) => !word.completed) || null;
}

// -----------------------------------------
// TYPING INPUT
// -----------------------------------------

typingInput.addEventListener("input", () => {
  if (!gameRunning) {
    return;
  }

  const typedText = typingInput.value.toLowerCase();

  // -------------------------------------
  // INPUT EMPTY
  // -------------------------------------

  if (!typedText) {
    typingInput.classList.remove("typing-error");

    if (typingWord) {
      typingWord.typedText = "";

      renderWord(typingWord);
    }

    typingWord = null;

    return;
  }

  // -------------------------------------
  // SELECT WORD
  // -------------------------------------

  if (!typingWord) {
    typingWord = findWordForTyping(typedText[0]);
  }

  if (!typingWord) {
    return;
  }

  // -------------------------------------
  // SAVE INPUT
  // -------------------------------------

  typingWord.typedText = typedText;

  // -------------------------------------
  // STATISTICS
  // -------------------------------------

  totalTypedCharacters++;

  // -------------------------------------
  // CHECK CHARACTERS
  // -------------------------------------

  let hasWrongCharacter = false;

  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] !== typingWord.text[i]) {
      hasWrongCharacter = true;

      break;
    }
  }

  // -------------------------------------
  // COUNT CORRECT CHARACTERS
  // -------------------------------------

  if (!hasWrongCharacter) {
    correctTypedCharacters++;
  }

  // -------------------------------------
  // WRONG TYPING
  // -------------------------------------

  if (hasWrongCharacter) {
    typingInput.classList.add("typing-error");
  } else {
    typingInput.classList.remove("typing-error");
  }

  // -------------------------------------
  // UPDATE WORD COLORS
  // -------------------------------------

  renderWord(typingWord);

  // -------------------------------------
  // COMPLETE WORD
  // -------------------------------------

  if (typedText === typingWord.text) {
    const completedWord = typingWord;

    typingWord = null;

    completeWord(completedWord);
  }
});

// -----------------------------------------
// COMPLETE LEVEL
// -----------------------------------------

function completeLevel() {
  if (levelTransitioning || !gameRunning) {
    return;
  }

  levelTransitioning = true;

  gameRunning = false;

  cancelAnimationFrame(animationFrame);

  // ---------------------------------------
  // REMOVE WORDS
  // ---------------------------------------

  removeAllWords();

  // ---------------------------------------
  // CLEAR INPUT
  // ---------------------------------------

  typingInput.value = "";

  typingInput.classList.remove("typing-error");

  // ---------------------------------------
  // LEVEL COMPLETE UI
  // ---------------------------------------

  completedLevelElement.textContent = `LEVEL ${level}`;

  levelCompleteScoreElement.textContent = score;

  levelCompleteAnimation.classList.remove("hidden");

  // ---------------------------------------
  // NEXT LEVEL
  // ---------------------------------------

  setTimeout(() => {
    level++;
    ensureLevelSettings(level);

    // -------------------------------------
    // GAME FINISHED AFTER LEVEL 4
    // -------------------------------------

    // -------------------------------------
    // START NEXT LEVEL
    // -------------------------------------

    wordsCompleted = 0;

    wordSpeed = levelSettings[level].speed;

    levelElement.textContent = level;

    typingWord = null;

    levelCompleteAnimation.classList.add("hidden");

    levelTransitioning = false;

    gameRunning = true;

    spawnInitialWords();

    startMovement();

    focusTypingInput();
  }, 2500);
}

// -----------------------------------------
// END GAME
// -----------------------------------------

function endGame() {
  gameRunning = false;

  levelTransitioning = false;

  cancelAnimationFrame(animationFrame);

  // ---------------------------------------
  // FINAL STATISTICS
  // ---------------------------------------

  const completedWords = wordsCompleted + (level > 4 ? 0 : 0);
  saveBestScore();

  if (finalScoreElement) {
    finalScoreElement.textContent = score;
  }
  if (finalWordsElement) {
    finalWordsElement.textContent = totalWordsCompleted;
  }

  // Accuracy

  let accuracy = 100;

  if (totalTypedCharacters > 0) {
    accuracy = Math.round(
      (correctTypedCharacters / totalTypedCharacters) * 100,
    );
  }

  if (finalAccuracyElement) {
    finalAccuracyElement.textContent = `${accuracy}%`;
  }

  // ---------------------------------------
  // CLEAR INPUT
  // ---------------------------------------

  typingInput.value = "";

  typingInput.classList.remove("typing-error");

  // ---------------------------------------
  // REMOVE WORDS
  // ---------------------------------------

  removeAllWords();

  // ---------------------------------------
  // SCREENS
  // ---------------------------------------

  gameScreen.classList.add("hidden");

  gameOverScreen.classList.remove("hidden");
}

// -----------------------------------------
// PLAY
// -----------------------------------------

playButton.addEventListener("click", startGame);

// -----------------------------------------
// RESTART
// -----------------------------------------

restartButton.addEventListener("click", startGame);
