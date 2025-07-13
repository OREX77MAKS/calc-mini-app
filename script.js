const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const usernameEl = document.getElementById('username');
const balanceEl = document.getElementById('balance');
const spinsEl = document.getElementById('spins');
const timerEl = document.getElementById('timer');
const cases = document.querySelectorAll('.case');
const modal = document.getElementById('modal');
const caseRoulette = document.getElementById('case-roulette');
const modalResult = document.getElementById('modal-result');
const closeModalBtn = document.getElementById('close-modal');
const historyList = document.getElementById('history-list');
const openSound = document.getElementById('open-sound');

let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
let spins = localStorage.getItem('spins') ? parseInt(localStorage.getItem('spins')) : 1;
let lastSpin = localStorage.getItem('lastSpin') ? new Date(localStorage.getItem('lastSpin')) : null;
let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];

const prizes = [
    { name: '100 очков', value: 100, chance: 30, img: 'https://img.icons8.com/color/48/000000/coin.png' },
    { name: 'Скин', value: 0, chance: 20, img: 'https://img.icons8.com/color/48/000000/knife.png' },
    { name: 'Бонус', value: 50, chance: 15, img: 'https://img.icons8.com/color/48/000000/star.png' },
    { name: '500 очков', value: 500, chance: 10, img: 'https://img.icons8.com/color/48/000000/money-bag.png' },
    { name: 'Пусто', value: 0, chance: 15, img: 'https://img.icons8.com/color/48/000000/empty-box.png' },
    { name: '200 очков', value: 200, chance: 10, img: 'https://img.icons8.com/color/48/000000/silver-coin.png' }
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

        // Заполняем рулетку изображениями
        caseRoulette.innerHTML = '';
        const items = [...prizes, ...prizes, ...prizes, ...prizes]; // Больше повторов для эффекта
        items.forEach(prize => {
            const item = document.createElement('div');
            item.className = 'roulette-item';
            const img = document.createElement('img');
            img.src = prize.img;
            img.alt = prize.name;
            item.appendChild(img);
            caseRoulette.appendChild(item);
        });

        // Анимация в стиле CS:GO
        const totalHeight = items.length * 100; // Высота с учётом 100px
        let speed = 10; // Начальная скорость
        let scrollPos = 0;
        const targetPrizeIndex = Math.floor(Math.random() * prizes.length);
        const targetScroll = targetPrizeIndex * 100 + (totalHeight / prizes.length) * 2; // Цель остановки

        function animateScroll() {
            scrollPos += speed;
            caseRoulette.scrollTop = scrollPos % totalHeight;

            // Ускорение в начале, затем замедление
            if (scrollPos < totalHeight / 2) {
                speed += 0.5;
            } else if (scrollPos < targetScroll - 200) {
                speed = Math.max(5, speed - 0.2); // Замедление
            } else {
                speed = Math.max(1, speed - 0.1); // Финальное замедление
            }

            if (scrollPos < targetScroll + 100) {
                requestAnimationFrame(animateScroll);
            } else {
                // Плавная остановка
                caseRoulette.scrollTo({ top: targetScroll, behavior: 'smooth' });
                setTimeout(() => {
                    const prize = prizes[targetPrizeIndex];
                    modalResult.textContent = `Вы выиграл: ${prize.name}`;
                    if (prize.value > 0) {
                        balance += prize.value;
                        localStorage.setItem('balance', balance);
                    }
                    history.push(`${new Date().toLocaleTimeString()} - ${prize.name}`);
                    localStorage.setItem('history', JSON.stringify(history));
                    localStorage.setItem('spins', spins);
                    updateUI();
                }, 500);
            }
        }

        requestAnimationFrame(animateScroll);
    });
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

const buySpinBtn = document.createElement('button');
buySpinBtn.textContent = 'Купить спин (50 очков)';
buySpinBtn.id = 'buy-spin-btn';
buySpinBtn.addEventListener('click', () => {
    if (balance >= 50) {
        balance -= 50;
        spins++;
        localStorage.setItem('balance', balance);
        localStorage.setItem('spins', spins);
        updateUI();
    }
});
document.querySelector('.profile').appendChild(buySpinBtn);

setInterval(updateUI, 1000);
updateUI();