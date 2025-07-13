const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const usernameEl = document.getElementById('username');
const balanceEl = document.getElementById('balance');
const spinsEl = document.getElementById('spins');
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const resultEl = document.getElementById('result');
const historyList = document.getElementById('history-list');

let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
let spins = localStorage.getItem('spins') ? parseInt(localStorage.getItem('spins')) : 1;
let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];

// Подарки (сектора рулетки)
const prizes = ['100 очков', 'Скин', 'Бонус', '500 очков', 'Ничего', '200 очков'];

// Профиль из TG
usernameEl.textContent = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.first_name : 'Гость';

// Обновление UI
function updateUI() {
    balanceEl.textContent = balance;
    spinsEl.textContent = spins;
    spinBtn.disabled = spins <= 0;
    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}

// Анимация и спин
spinBtn.addEventListener('click', () => {
    if (spins <= 0) return;
    spins--;
    localStorage.setItem('spins', spins);

    // Анимация вращения
    const randomRotation = Math.floor(Math.random() * 360) + 360 * 5; // 5 полных оборотов + случайный
    wheel.style.transform = `rotate(${randomRotation}deg)`;

    setTimeout(() => {
        const prizeIndex = Math.floor(Math.random() * prizes.length);
        const prize = prizes[prizeIndex];
        resultEl.textContent = `Вы выиграли: ${prize}`;

        if (prize.includes('очков')) {
            const points = parseInt(prize.split(' ')[0]);
            balance += points;
            localStorage.setItem('balance', balance);
        }

        history.push(prize);
        localStorage.setItem('history', JSON.stringify(history));
        updateUI();
    }, 3000); // После анимации
});

// Инициализация
updateUI();