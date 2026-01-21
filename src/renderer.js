/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

// --- Select DOM Elements ---
const pet = document.querySelector('.pet');
const gift = document.getElementById('gift');
const giftModal = document.getElementById('gift-modal');
const closeGiftBtn = document.getElementById('close-gift');
const giftText = document.getElementById('gift-text');
const giftSign = document.getElementById('gift-sign');
const bubble = document.getElementById('bubble');
const bubbleContent = document.getElementById('bubble-content');
const funfactBtn = document.getElementById('info-button');
const petBtn = document.getElementById('petting');
const chatBtn = document.getElementById('chatting');
const chatForm = document.getElementById('chat-form');
const calendar = document.getElementById('calendar');
const modal = document.getElementById('birthday-modal');
const saveBtn = document.getElementById('save-birthday');
const cancelBtn = document.getElementById('cancel-birthday');
const dayInput = document.getElementById('birthday-day');
const monthSelect = document.getElementById('birthday-month');
const audioToggleBtn = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');

// --- Audio Setup ---
const petSound = new Audio('asset/pet-sfx.mp3');
const bgm = new Audio('asset/bgm.mp3');
bgm.loop = true;
bgm.volume = 0.4;
let isMuted = false;

// --- State Variables ---
let chatState = 'idle'; //idle, chatting, chat-result, funfact
let currentAnimation = null;
let autoResetTimer = null;

// --- Birthday Functions ---

const DEFAULT_BIRTHDAY = {
  day: 25,
  month: 1 
};

const data = getSavedBirthday();
dayInput.value = data.day;
monthSelect.value = data.month;

const GIFT_MESSAGE = {
  text: `Hi there,
        If you're reading this, I just want to say thank you for still being here (and for opening this app today).
        Life isn't always easy, and the fact that you're still here deserves more credit than you probably give yourself.
        I know this isn't much, but I hope it manages to bring at least a small smile to your face.
        I wish everything goes well for you in the future.

        Happy Birthday!`,
  sign: '- Dims'
};


function isBirthdayToday() {
  const today = new Date();
  const birthday = getSavedBirthday();
  if (!birthday) return false;
  return (
    today.getMonth() === birthday.month &&
    today.getDate() === birthday.day
  );
}

// Update Visual
function refreshBirthdayState(updateText = true) {
  pet.classList.remove('normal', 'birthday');

  if (isBirthdayToday()) {
    pet.classList.add('birthday');
    gift.classList.remove('hidden');

    if (updateText && chatState === 'idle') {
      bubbleContent.textContent = ' Hi, Today is your special day! Ginger wishes you have a purr-fect day!';
    }

     if (!giftText.textContent) {
      giftText.textContent = GIFT_MESSAGE.text;
      giftSign.textContent = GIFT_MESSAGE.sign;
    }
    
  } else {
    pet.classList.add('normal');
    gift.classList.add('hidden');

    if (updateText && chatState === 'idle') {
      bubbleContent.textContent = "Hi! I'm Ginger, your virtual cat companion!";
    }
  }
}

// -- Birtday letter ---
gift.addEventListener('click', () => {
  if (chatState !== 'idle') return;
  giftModal.classList.remove('hidden');
});

closeGiftBtn.addEventListener('click', () => {
  giftModal.classList.add('hidden');
});

function getSavedBirthday() {
  const data = localStorage.getItem('birthday');
  return data ? JSON.parse(data) : DEFAULT_BIRTHDAY;
}

function saveBirthday(day, month) {
  localStorage.setItem('birthday', JSON.stringify({ day, month }));
}

function resetAnimations() {
  pet.classList.remove(
    'petting-normal', 'petting-birthday',
    'chatting-normal', 'chatting-birthday'
  );
  void pet.offsetWidth; 
}

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  setupCalendarDate();

  // Update Calendar
  setInterval(() => {
    setupCalendarDate();

    if (chatState === 'idle'){
        refreshBirthdayState(true);
    } else {
        refreshBirthdayState(false);
    }
  }, 1000);
  
  refreshBirthdayState(true);
  bgm.play().catch(() => console.log("Audio autoplay blocked"));
});

// --- Audio Controls ---
audioToggleBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  if (isMuted) {
    bgm.volume = 0;
    audioIcon.src = 'asset/music-off-button.png';
  } else {
    bgm.volume = 0.4;
    audioIcon.src = 'asset/music-on-button.png';
    if (bgm.paused) bgm.play();
  }
});

// --- Calendar & Modal Logic ---

function setupCalendarDate() {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const today = new Date();
  document.getElementById('date-today').textContent = today.getDate();
  document.getElementById('month-today').textContent = monthNames[today.getMonth()];
}

const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function updateMaxDay() {
  const monthIndex = parseInt(monthSelect.value);
  const maxDays = daysInMonth[monthIndex];
  dayInput.max = maxDays;
  if (parseInt(dayInput.value) > maxDays) dayInput.value = maxDays;
}

monthSelect.addEventListener('change', updateMaxDay);

calendar.addEventListener('click', () => {
  if (chatState !== 'idle') return;

  modal.classList.remove('hidden');
  const savedData = getSavedBirthday();
  if (savedData) {
    monthSelect.value = savedData.month;
    dayInput.value = savedData.day;
  }
  updateMaxDay();
  setTimeout(() => { dayInput.focus(); dayInput.select(); }, 100);
});

dayInput.addEventListener('input', () => {
  const maxDays = daysInMonth[parseInt(monthSelect.value)];
  if (parseInt(dayInput.value) > maxDays) dayInput.value = maxDays;
  if (parseInt(dayInput.value) < 1) dayInput.value = 1;
});

cancelBtn.onclick = () => modal.classList.add('hidden');

saveBtn.onclick = () => {
  const day = Number(dayInput.value);
  const month = Number(monthSelect.value);
  const maxDays = daysInMonth[month];

  if (!day || isNaN(day) || day < 1 || day > maxDays) {
    alert('Please enter a valid date!');
    return;
  }

  saveBirthday(day, month);
  modal.classList.add('hidden');

  setupCalendarDate();

  if (chatState === 'idle'){
    refreshBirthdayState(true);
  } else {
    refreshBirthdayState(false);
  }
};

// --- Chat Feature ---
function setChatState(state) {
  chatState = state;
  bubbleHint();
}

function resetToIdle() {
  setChatState('idle');

  chatForm.reset(); 
  refreshBirthdayState(true); 
  bubble.removeEventListener('click', resetToIdle);
  bubble.style.cursor = "default";
  bubbleHint();
  if (autoResetTimer) {
    clearTimeout(autoResetTimer);
    autoResetTimer = null;
  }
}

function bubbleHint() {
  const hint = document.getElementById('bubble-hint');

  if (chatState === 'funfact' || chatState === 'chat-result') {
    hint.classList.remove('hidden');
  } else {
    hint.classList.add('hidden');
  }
}

chatBtn.addEventListener('click', () => {
  if (chatState !== 'idle') return;

  setChatState('chatting');
  chatForm.classList.remove('hidden');
  bubbleContent.textContent = isBirthdayToday() ? 'How do you feel on your special day?' : 'How are you feeling today?';
  playChattingAnimation();
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const selectedMood = new FormData(chatForm).get('mood');
  if (!selectedMood) return;

  chatForm.classList.add('hidden');
  bubbleContent.textContent = (selectedMood === 'happy') ? "Glad to hear that! *purr*" : "*Meow..* it's okayy, Ginger is here with you.";
  
  setChatState('chat-result');

  playChattingAnimation();
  bubbleHint();
  
  setTimeout(() => {
    bubble.addEventListener('click', resetToIdle);
    bubble.style.cursor = "pointer"; 
  }, 500);

  autoResetTimer = setTimeout(() => {
    if (chatState === 'chat-result') resetToIdle();
  }, 15000);
});

// --- Petting Feature ---

petBtn.addEventListener('click', () => {
  if (chatState !== 'idle') return;
  if (currentAnimation !== null) return;

  currentAnimation = 'petting';

  petSound.currentTime = 0;
  petSound.play().catch(() => {});

  const isBday = isBirthdayToday();
  const idleClass = isBday ? 'birthday' : 'normal';
  const pettingClass = isBday ? 'petting-birthday' : 'petting-normal';

  pet.classList.remove('normal', 'birthday');
  pet.classList.add(pettingClass);

  const handler = (e) => {
    if (!e.animationName.includes('petting')) return;

      pet.classList.remove(pettingClass);
      pet.classList.add(idleClass);
      currentAnimation = null;
      pet.removeEventListener('animationend', handler);
    
  };
  pet.addEventListener('animationend', handler);
});

// --- Info function ---
function funfact() {
  if (chatState === 'chatting' || chatState === 'chat-result') return;
  const funFacts = [
    "Ginger was inspired by a real cat named Jahe.", 
    "Ginger Cat Appreciation Day is celebrated annually on September 1st", 
    "Ginger is a cat with orange fur due to the pigment pheomelanin.",
    "About 80 percent of ginger cats are male"];
  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
  
  bubbleContent.textContent = randomFact;
  setChatState('funfact');

  playChattingAnimation();

  bubble.removeEventListener('click', resetToIdle);
  bubbleHint();

   setTimeout(() => {
    bubble.addEventListener('click', resetToIdle);
    bubble.style.cursor = "pointer"; 
  }, 500);  
  }
funfactBtn.addEventListener('click', funfact);

function playChattingAnimation() {
  if (currentAnimation !== null) return;
  currentAnimation = 'chatting';

  resetAnimations();
  const isBday = isBirthdayToday();
  const chattingClass = isBday ? 'chatting-birthday' : 'chatting-normal';
  pet.classList.add(chattingClass);

  const handler = (e) => {
    if (!e.animationName.includes('chatting')) return;
      pet.classList.remove(chattingClass);
      refreshBirthdayState(false);
      currentAnimation = null;
      pet.removeEventListener('animationend', handler);
  };
  petSound.currentTime = 0;
  petSound.play().catch(() => {});
  pet.addEventListener('animationend', handler);
}

// --- Window Controls ---
document.getElementById('min-btn').onclick = () => window.windowAPI.minimize();
document.getElementById('close-btn').onclick = () => window.windowAPI.close();