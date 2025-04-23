// בסיס נתוני משתמשים
const users = [
    { username: 'may', password: 'levi1', scores: [] },
    { username: 'p', password: 'testuser', scores: [] }

  ];
  
  let currentUser = null;
  let shootKey = ' ';
  let gameDuration = 2;
  let flag=false;
  // ניהול מסכים
  function navigateTo(id) {
    if (flag===true){
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        clearInterval(gameInterval);
    }
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  
 /* function openAbout() {
    console.log("Opening about dialog"); // הוסף לוג זה לדיבוג
    const dialog = document.getElementById('aboutDialog');
    if (dialog) {
      dialog.showModal();
    } else {
      console.error("Dialog element not found");
    }
  }
  
  document.addEventListener('click', e => {
    const dialog = document.getElementById('aboutDialog');
    if (dialog.open && !dialog.contains(e.target)) dialog.close();
  });*/

  document.getElementById('contactIcon').addEventListener('click', function () {
    navigateTo('contactScreen');
  });

  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.getElementById('aboutDialog').close();
  });
  
  // מילוי תאריך לידה
  window.addEventListener('DOMContentLoaded', () => {
    const day = document.getElementById('day');
    const month = document.getElementById('month');
    const year = document.getElementById('year');
    for (let i = 1; i <= 31; i++) day.innerHTML += `<option>${i}</option>`;
    for (let i = 1; i <= 12; i++) month.innerHTML += `<option>${i}</option>`;
    for (let i = 1900; i <= new Date().getFullYear(); i++) year.innerHTML += `<option>${i}</option>`;
  });
  
  // ולידציה להרשמה
  const regForm = document.getElementById('registerForm');
  regForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = regForm.regUsername.value.trim();
    const password = regForm.regPassword.value;
    const confirm = regForm.regConfirm.value;
    const first = regForm.firstName.value;
    const last = regForm.lastName.value;
    const email = regForm.email.value;
  
    if (!username || !password || !confirm || !first || !last || !email) {
      alert('יש למלא את כל השדות'); return;
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
      alert('הסיסמה צריכה להכיל לפחות 8 תווים, כולל אות ומספר'); return;
    }
    if (password !== confirm) {
      alert('אימות הסיסמה לא תואם'); return;
    }
    if (/[0-9]/.test(first) || /[0-9]/.test(last)) {
      alert('שם פרטי/משפחה לא יכולים להכיל מספרים'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('כתובת אימייל לא תקינה'); return;
    }
  
    if (users.find(u => u.username === username)) {
      alert('שם משתמש כבר קיים'); return;
    }
  
    users.push({ username, password, scores: [] });
    alert('נרשמת בהצלחה!');
    navigateTo('login');
  });
  
  // התחברות
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = loginForm.loginUsername.value.trim();
    const password = loginForm.loginPassword.value;
    const user = users.find(u => u.username === username && u.password === password);
  
    if (!user) {
      alert('שם משתמש או סיסמה שגויים');
      return;
    }
    currentUser = user;
    navigateTo('config');
  });

  const backgroundMusic = new Audio("Daddy Yankee - Limbo BG.mp3");
  backgroundMusic.loop = true;
  
  // התחלת משחק
  function startGame() {
    shootKey = document.getElementById('shootKey').value || ' ';
    gameDuration = parseInt(document.getElementById('gameTime').value);
    const shipColor = document.getElementById('shipColor').value;
  
    if (gameDuration < 2) {
      alert('זמן משחק צריך להיות לפחות 2 דקות');
      return;
    }
  
    navigateTo('game');
    launchGame(shipColor);
  }
  
  // משחק
  let score = 0;
  let lives = 3;
  let timer = 0;
  let gameInterval;
  let enemyDirection = 1;
  let enemies = [], bullets = [], enemyBullets = [];
  let canvas, ctx;
  let player, shootCooldown = 0;
  let acceleration = 0;
  
  function launchGame(shipColor) {
    flag = true;
    backgroundMusic.play();
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    score = 0;
    lives = 3;
    timer = gameDuration * 60;
    acceleration = 0;
    shootCooldown = 0;
    updateHUD();
  
    player = { x: canvas.width / 2 - 25, y: canvas.height - 60, w: 50, h: 30, color: shipColor };
    bullets = [];
    enemyBullets = [];
    enemies = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        enemies.push({ x: 80 + col * 120, y: 40 + row * 60, w: 40, h: 30, row });
      }
    }
  
    document.addEventListener('keydown', handleKey);
    gameInterval = setInterval(gameLoop, 1000 / 60);
    setInterval(() => { if (acceleration < 4) acceleration++; }, 5000);
  }
  
  function updateHUD() {
    document.getElementById('score').textContent = `נקודות: ${score}`;
    document.getElementById('lives').textContent = `חיים: ${lives}`;
    const totalSeconds = Math.ceil(timer); // עיגול כלפי מעלה של השניות שנותרו
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `זמן: ${m}:${s}`;
  }

 function drawThanos(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // ראש סגול עם פינות מעוגלות
  ctx.fillStyle = '#6d5a99';
  ctx.beginPath();
  ctx.moveTo(w * 0.2, 0);
  ctx.lineTo(w * 0.8, 0);
  ctx.quadraticCurveTo(w, 0, w, h * 0.2);
  ctx.lineTo(w, h * 0.8);
  ctx.quadraticCurveTo(w, h, w * 0.8, h);
  ctx.lineTo(w * 0.2, h);
  ctx.quadraticCurveTo(0, h, 0, h * 0.8);
  ctx.lineTo(0, h * 0.2);
  ctx.quadraticCurveTo(0, 0, w * 0.2, 0);
  ctx.closePath();
  ctx.fill();

  // קסדה – עליון כחול
  ctx.fillStyle = '#5ca6d6';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.25, w * 0.4, Math.PI, 2 * Math.PI);
  ctx.fill();

  // פס קסדה זהוב
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.moveTo(w * 0.45, 0);
  ctx.lineTo(w * 0.55, 0);
  ctx.lineTo(w * 0.6, h * 0.4);
  ctx.lineTo(w * 0.4, h * 0.4);
  ctx.closePath();
  ctx.fill();

  // עיניים
  ctx.fillStyle = 'white';
  ctx.fillRect(w * 0.28, h * 0.45, w * 0.12, h * 0.08);
  ctx.fillRect(w * 0.60, h * 0.45, w * 0.12, h * 0.08);

  // פה
  ctx.strokeStyle = '#351d4c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.75);
  ctx.quadraticCurveTo(w * 0.5, h * 0.85, w * 0.65, h * 0.75);
  ctx.stroke();

  // חריצים בסנטר
  ctx.strokeStyle = '#4a2e70';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 5, h * 0.82);
    ctx.lineTo(w / 2 + i * 5, h * 0.95);
    ctx.stroke();
  }

  ctx.restore();
}


  function drawIronman(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.translate(x, y);
  
    // קסדה חיצונית אדומה (או כל צבע שניתן)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, 0);
    ctx.lineTo(w * 0.8, 0);
    ctx.quadraticCurveTo(w, 0, w, h * 0.2);
    ctx.lineTo(w, h * 0.8);
    ctx.quadraticCurveTo(w, h, w * 0.8, h);
    ctx.lineTo(w * 0.2, h);
    ctx.quadraticCurveTo(0, h, 0, h * 0.8);
    ctx.lineTo(0, h * 0.2);
    ctx.quadraticCurveTo(0, 0, w * 0.2, 0);
    ctx.closePath();
    ctx.fill();
  
    // מסכה פנימית זהובה
    ctx.fillStyle = '#f9c349';
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.2);
    ctx.lineTo(w * 0.7, h * 0.2);
    ctx.lineTo(w * 0.75, h * 0.5);
    ctx.lineTo(w * 0.7, h * 0.8);
    ctx.lineTo(w * 0.3, h * 0.8);
    ctx.lineTo(w * 0.25, h * 0.5);
    ctx.closePath();
    ctx.fill();
  
    // עיניים
    ctx.fillStyle = 'white';
    ctx.fillRect(w * 0.32, h * 0.38, w * 0.1, h * 0.05);
    ctx.fillRect(w * 0.58, h * 0.38, w * 0.1, h * 0.05);
  
    // פה
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h * 0.7);
    ctx.lineTo(w * 0.6, h * 0.7);
    ctx.stroke();
  
    ctx.restore();
  }
  
  
  const explosion = new Audio("Iron Man hit.mp3");
  explosion.volume = 0.6;
  const ironmanbeaten = new Audio("Avengers_ Infinity War (2018) - Endgame  Movie Clip.mp3");
  ironmanbeaten.volume = 0.6;
  
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    timer -= 1/60;
    if (timer <= 0 || lives <= 0 || enemies.length === 0) return endGame();
    updateHUD();
  
    // תנועה שחקן
    if (keys.ArrowLeft && player.x > 0) player.x -= 5;
    if (keys.ArrowRight && player.x + player.w < canvas.width) player.x += 5;
    if (keys.ArrowUp && player.y > canvas.height * 0.6) player.y -= 5;
    if (keys.ArrowDown && player.y + player.h < canvas.height) player.y += 5;
  
    // ציור שחקן
    // ctx.fillStyle = player.color;
    // ctx.fillRect(player.x, player.y, player.w, player.h);
    drawIronman(ctx, player.x, player.y, player.w, player.h, player.color);
  
    // יריות שחקן
    bullets.forEach((b, i) => {
      b.y -= 8;
      ctx.fillStyle = 'blue';
      ctx.fillRect(b.x, b.y, 4, 10);
      enemies.forEach((e, j) => {
        if (b.x > e.x && b.x < e.x + e.w && b.y < e.y + e.h && b.y + 10 > e.y) {
          bullets.splice(i, 1);
          enemies.splice(j, 1);
          score += (4 - e.row) * 5;
          explosion.currentTime = 0;
          explosion.play();

        }
      });
    });
  
    // תנועה אויבים
    let dx = (1 + acceleration * 0.5) * enemyDirection;
    let changeDir = enemies.some(e => e.x + dx < 0 || e.x + e.w + dx > canvas.width);
    if (changeDir) enemyDirection *= -1;
    enemies.forEach(e => {
      e.x += dx;
      drawThanos(ctx, e.x, e.y, e.w, e.h);
    //   ctx.fillStyle = ['red', 'orange', 'yellow', 'lime'][e.row];
    //   ctx.fillRect(e.x, e.y, e.w, e.h);
    });
  
    // יריות אויבים
    // יריות אויבים – רק אם אין יריות בכלל או שכולן עברו 3/4 מהמסך
    if (
        enemyBullets.length === 0 || 
        (enemyBullets.every(b => b.y > canvas.height * 0.75))
    ) {
        if (Math.random() < 0.01 + acceleration * 0.005) {
        const shooter = enemies[Math.floor(Math.random() * enemies.length)];
        enemyBullets.push({
            x: shooter.x + shooter.w / 2,
            y: shooter.y + shooter.h
        });
        }
    }
    
    // ציור והזזת יריות אויבים + בדיקת פגיעה בשחקן בלבד
    enemyBullets.forEach((b, i) => {
        b.y += 3 + acceleration; // תנועה למטה
        ctx.fillStyle = 'red';
        ctx.fillRect(b.x, b.y, 4, 10); // ציור הירייה
    
        // בדיקת פגיעה בשחקן (ולא באויבים)
        if (
        b.x > player.x && b.x < player.x + player.w &&
        b.y + 10 > player.y && b.y < player.y + player.h
        ) {
        ironmanbeaten.currentTime = 0;
        ironmanbeaten.play();
        lives--; // הורדת חיים
        enemyBullets.splice(i, 1); // הסרת הקליע
        player.x = canvas.width / 2 - 25;
        player.y = canvas.height - 60;
        }
    });
  
    shootCooldown--;
  }
  
  function handleKey(e) {
    // במסך המשחק, מנע גלילת דף בעת שימוש בחצים
  if (document.getElementById('game').classList.contains('active') && 
  (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    e.preventDefault(); // מונע את פעולת ברירת המחדל של הדפדפן
    }
    if (e.key === shootKey && shootCooldown <= 0) {
      bullets.push({ x: player.x + player.w / 2, y: player.y });
      shootCooldown = 15;
    }
    keys[e.key] = true;
  }
  
  document.addEventListener('keyup', e => keys[e.key] = false);
  const keys = {};
  
  function endGame() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    clearInterval(gameInterval);
    document.removeEventListener('keydown', handleKey);
    let msg = '';
    if (lives <= 0) msg = 'You Lost!';
    else if (score >= 100 & enemies.length > 0 ) msg = 'Winner!';
    else if (enemies.length === 0) msg = 'Champion!';
    else msg = `You can do better (${score})`;
  
    currentUser.scores.push(score);
    document.getElementById('resultMessage').textContent = msg;
    updateScoreTable();
    navigateTo('results');
  }
  
  function updateScoreTable() {
    const list = document.getElementById('scoreHistory');
    list.innerHTML = '';
    currentUser.scores.slice().reverse().forEach(s => {
      const li = document.createElement('li');
      li.textContent = `${s} נקודות`;
      list.appendChild(li);
    });
  }
  
  function newGame() {
    navigateTo('config');
  }