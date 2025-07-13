const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const usernameEl = document.getElementById('username');
const balanceEl = document.getElementById('balance');
const spinsEl = document.getElementById('spins');
const timerEl = document.getElementById('timer');
const cases = document.querySelectorAll('.case');
const modal = document.getElementById('modal');
const slotMachine = document.getElementById('slot-machine');
const modalResult = document.getElementById('modal-result');
const closeModalBtn = document.getElementById('close-modal');
const historyList = document.getElementById('history-list');
const openSound = document.getElementById('open-sound');

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

usernameEl.textContent = tg.initDataUnsafe.user ? `${tg.initDataUnsafe.user.first_name}'s` : 'Гостевой';

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
    balanceEl.textContent = balance;
    spinsEl.textContent = spins;
    cases.forEach(c => c.style.opacity = spins > 0 ? '1' : '0.5');

    if (!lastSpin || Date.now() - lastSpin > 24 * 60 * 60 * 1000) {
        spins = 1;
        lastSpin = new Date();
        localStorage.setItem('lastSpin', lastSpin);
    } else {
        const timeLeft = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000) - Date.now();
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);
        timerEl.textContent = `Следующий спин: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}

cases.forEach(caseEl => {
    caseEl.addEventListener('click', () => {
        if (spins <= 0) return;
        spins--;
        openSound.play();
        modal.style.display = 'flex';

        const slotItems = prizes.map(p => `<div class="slot-item">${p.name}</div>`).join('');
        slotMachine.innerHTML = slotItems;
        const slotHeight = slotMachine.scrollHeight / prizes.length;
        let scrollPos = 0;

        const interval = setInterval(() => {
            scrollPos += 10;
            slotMachine.scrollTop = scrollPos;
            if (scrollPos >= slotMachine.scrollHeight) scrollPos = 0;
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
            const prize = getRandomPrize();
            modalResult.textContent = `Вы выиграл: ${prize.name}`;
            if (prize.value > 0) {
                balance += prize.value;
                localStorage.setItem('balance', balance);
            }
            history.push(`${new Date().toLocaleTimeString()} - ${prize.name}`);
            localStorage.setItem('history', JSON.stringify(history));
            localStorage.setItem('spins', spins);
            updateUI();
        }, 2000);
    });
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

function buySpin() {
    if (balance >= 50) {
        balance -= 50;
        spins++;
        localStorage.setItem('balance', balance);
        localStorage.setItem('spins', spins);
        updateUI();
    }
}

// Добавим кнопку покупки спина
const buySpinBtn = document.createElement('button');
buySpinBtn.textContent = 'Купить спин (50 очков)';
buySpinBtn.id = 'buy-spin-btn';
buySpinBtn.addEventListener('click', buySpin);
document.querySelector('.profile').appendChild(buySpinBtn);

setInterval(updateUI, 1000);
updateUI();