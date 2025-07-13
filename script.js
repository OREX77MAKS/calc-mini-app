const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const homeContainer = document.querySelector('.home');
const caseContainer = document.querySelector('.case');
const usernameEl = document.getElementById('username');
const balanceEl = document.getElementById('balance');
const caseUsernameEl = document.getElementById('case-username');
caseUsernameEl.textContent = usernameEl.textContent;
const caseBalanceEl = document.getElementById('case-balance');
const spinsEl = document.getElementById('spins');
const caseSpinsEl = document.getElementById('case-spins');
const timerEl = document.getElementById('timer');
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const buySpinBtn = document.getElementById('buy-spin-btn');
const resultEl = document.getElementById('result');
const historyList = document.getElementById('history-list');
const spinSound = document.getElementById('spin-sound');

let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
let spins = localStorage.getItem('spins') ? parseInt(localStorage.getItem('spins')) : 1;
let lastSpin = localStorage.getItem('lastSpin') ? new Date(localStorage.getItem('lastSpin')) : null;
let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];

const prizes = [
    { name: '100 очков', value: 100, chance: 30 },
    { name: 'Скин', value: 0, chance: 20 },
    { name: 'Бонус', value: 50, chance: 15 },
    { name: '500 очков', value: 500, chance: 10 },
    { name: 'Пусто', value: 0, chance: 15 },
    { name: '200 очков', value: 200, chance: 10 }
];

usernameEl.textContent = caseUsernameEl.textContent = tg.initDataUnsafe.user ? `${tg.initDataUnsafe.user.first_name}'s` : 'Гостевой';
balanceEl.textContent = caseBalanceEl.textContent = balance;
spinsEl.textContent = caseSpinsEl.textContent = spins;

function getRandomPrize() {
    const totalChance = prizes.reduce((sum, p) => sum + p.chance, 0);
    let random = Math.random() * totalChance;
    for (let prize of prizes) {
        random -= prize.chance;
        if (random <= 0) return prize;
    }
    return prizes[0];
}

function updateUI() {
    balanceEl.textContent = caseBalanceEl.textContent = balance;
    spinsEl.textContent = caseSpinsEl.textContent = spins;
    spinBtn.disabled = spins <= 0;
    buySpinBtn.disabled = balance < 50;

    if (!lastSpin || Date.now() - lastSpin > 24 * 60 * 60 * 1000) {
        spins = 1;
        lastSpin = new Date();
        localStorage.setItem('lastSpin', lastSpin);
    } else {
        const timeLeft = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000) - Date.now();
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);
        timerEl.textContent = `След. спин: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}

function openCase(caseName) {
    document.getElementById('case-title').textContent = `${caseName} кейс`;
    homeContainer.style.display = 'none';
    caseContainer.style.display = 'block';
    updateUI();
}

function goBack() {
    caseContainer.style.display = 'none';
    homeContainer.style.display = 'block';
}

spinBtn.addEventListener('click', () => {
    if (spins <= 0) return;
    spins--;
    spinSound.play();
    const randomRotation = Math.floor(Math.random() * 360) + 360 * 6;
    wheel.style.transition = 'transform 6s cubic-bezier(0.25, 0.1, 0.25, 1)';
    wheel.style.transform = `rotate(${randomRotation}deg)`;

    setTimeout(() => {
        const prize = getRandomPrize();
        resultEl.textContent = `Вы выиграли: ${prize.name}`;
        if (prize.value > 0) balance += prize.value;
        history.push(`${new Date().toLocaleTimeString()} - ${prize.name} (${document.getElementById('case-title').textContent})`);
        localStorage.setItem('balance', balance);
        localStorage.setItem('spins', spins);
        localStorage.setItem('history', JSON.stringify(history));
        updateUI();
        wheel.style.transition = 'none';
    }, 6000);
});

buySpinBtn.addEventListener('click', () => {
    if (balance >= 50) {
        balance -= 50;
        spins++;
        localStorage.setItem('balance', balance);
        localStorage.setItem('spins', spins);
        updateUI();
    }
});

setInterval(updateUI, 1000);
updateUI();