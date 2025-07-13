const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const usernameEl = document.getElementById('username');
const scoreEl = document.getElementById('score');
const multiplierEl = document.getElementById('multiplier');
const clickBtn = document.getElementById('click-btn');
const upgradeBtn = document.getElementById('upgrade-btn');

let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let multiplier = localStorage.getItem('multiplier') ? parseInt(localStorage.getItem('multiplier')) : 1;

// Показ имени из TG
usernameEl.textContent = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : 'Гость';

// Обновление UI
function updateUI() {
    scoreEl.textContent = score;
    multiplierEl.textContent = multiplier;
    upgradeBtn.disabled = score < multiplier * 10;
}

// Клик по кнопке
clickBtn.addEventListener('click', () => {
    score += multiplier;
    localStorage.setItem('score', score);
    updateUI();
});

// Покупка множителя
upgradeBtn.addEventListener('click', () => {
    const cost = multiplier * 10;
    if (score >= cost) {
        score -= cost;
        multiplier += 1;
        localStorage.setItem('score', score);
        localStorage.setItem('multiplier', multiplier);
        updateUI();
    }
});

// Инициализация
updateUI();