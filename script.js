const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const usernameEl = document.getElementById('username');
const balanceEl = document.getElementById('balance');
let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;

usernameEl.textContent = tg.initDataUnsafe.user ? `${tg.initDataUnsafe.user.first_name}'s` : 'Гостевой';
balanceEl.textContent = balance;

function openCase(caseName) {
    // Заглушка — позже переключим на страницу кейса
    alert(`Открыт ${caseName} кейс! Логика рулетки будет здесь.`);
}

function goBack() {
    // Заглушка для возврата
    alert('Вернуться на главную!');
}