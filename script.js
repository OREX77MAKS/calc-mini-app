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
const finalPrize = document.getElementById('final-prize');
const modalResult = document.getElementById('modal-result');
const closeModalBtn = document.getElementById('close-modal');
const historyList = document.getElementById('history-list');
const openSound = document.getElementById('open-sound');

let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
let spins = localStorage.getItem('spins') ? parseInt(localStorage.getItem('spins')) : 1;
let lastSpin = localStorage.getItem('lastSpin') ? new Date(localStorage.getItem('lastSpin')) : null;
let history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];

const prizes = [
    { name: '100 очков', value: 100, chance: 30, img: 'https://img.icons8.com/color/96/000000/coin.png' },
    { name: 'Скин', value: 0, chance: 20, img: 'https://img.icons8.com/color/96/000000/knife.png' },
    { name: 'Бонус', value: 50, chance: 15, img: 'https://img.icons8.com/color/96/000000/star.png' },
    { name: '500 очков', value: 500, chance: 10, img: 'https://img.icons8.com/color/96/000000/money-bag.png' },
    { name: 'Пусто', value: 0, chance: 15, img: 'https://img.icons8.com/color/96/000000/empty-box.png' },
    { name: '200 очков', value: 200, chance: 10, img: 'https://img.icons8.com/color/96/000000/silver-coin.png' }
];

// Предзагрузка изображений с проверкой
prizes.forEach(prize => {
    const img = new Image();
    img.src = prize.img;
    img.onload = () => console.log('Preloaded:', prize.img);
    img.onerror = () => {
        console.error('Failed to preload:', prize.img);
        // Замена на запасной URL, если ошибка
        switch (prize.name) {
            case '100 очков': prize.img = 'https://img.icons8.com/color/48/000000/coin.png'; break;
            case 'Скин': prize.img = 'https://img.icons8.com/color/48/000000/knife.png'; break;
            case 'Бонус': prize.img = 'https://img.icons8.com/color/48/000000/star.png'; break;
            case '500 очков': prize.img = 'https://img.icons8.com/color/48/000000/money-bag.png'; break;
            case 'Пусто': prize.img = 'https://img.icons8.com/color/48/000000/empty-box.png'; break;
            case '200 очков': prize.img = 'https://img.icons8.com/color/48/000000/silver-coin.png'; break;
        }
    };
});

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

        // Предзагрузка и заполнение рулетки
        caseRoulette.innerHTML = '';
        const items = [...prizes, ...prizes, ...prizes, ...prizes, ...prizes];
        items.forEach(prize => {
            const item = document.createElement('div');
            item.className = 'roulette-item';
            const img = document.createElement('img');
            img.src = prize.img;
            img.alt = prize.name;
            img.style.opacity = '0'; // Скрываем до загрузки
            img.onload = () => {
                img.style.opacity = '1'; // Показываем после загрузки
                console.log('Item loaded in roulette:', prize.img);
            };
            img.onerror = () => console.error('Item failed to load in roulette:', prize.img);
            item.appendChild(img);
            caseRoulette.appendChild(item);
        });

        // Анимация слева направо
        const totalWidth = items.length * 100;
        let speed = 5;
        let scrollPos = 0;
        const targetPrizeIndex = Math.floor(Math.random() * prizes.length);
        const targetScroll = targetPrizeIndex * 100 + (totalWidth / prizes.length) * 3;

        function animateScroll(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            scrollPos += speed;

            // Ускорение в начале
            if (progress < 1500) {
                speed += 0.5;
            } else if (progress < 3000) {
                speed = Math.max(10, speed);
            } else {
                speed = Math.max(1, speed - 0.2);
            }

            caseRoulette.scrollLeft = scrollPos % totalWidth;

            if (scrollPos < targetScroll) {
                requestAnimationFrame(animateScroll);
            } else {
                caseRoulette.scrollTo({ left: targetScroll, behavior: 'smooth' });
                setTimeout(() => {
                    const prize = prizes[targetPrizeIndex];
                    finalPrize.innerHTML = '';
                    const imgElement = document.createElement('img');
                    imgElement.src = prize.img;
                    imgElement.alt = prize.name;
                    imgElement.onload = () => {
                        console.log('Final prize loaded:', prize.img);
                        finalPrize.appendChild(imgElement);
                        finalPrize.style.display = 'flex';
                        modalResult.textContent = `Вы выиграл: ${prize.name}`;
                        if (prize.value > 0) {
                            balance += prize.value;
                            localStorage.setItem('balance', balance);
                        }
                        history.push(`${new Date().toLocaleTimeString()} - ${prize.name}`);
                        localStorage.setItem('history', JSON.stringify(history));
                        localStorage.setItem('spins', spins);
                        updateUI();
                    };
                    imgElement.onerror = () => {
                        console.error('Final prize failed to load:', prize.img);
                        finalPrize.innerHTML = '<p>Ошибка загрузки</p>';
                        modalResult.textContent = `Ошибка: ${prize.name}`;
                    };
                    if (!imgElement.complete) {
                        finalPrize.style.display = 'none';
                    }
                }, 500);
            }
        }

        let start;
        // Задержка перед стартом для предзагрузки
        setTimeout(() => requestAnimationFrame(animateScroll), 500);
    });
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    finalPrize.style.display = 'none';
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