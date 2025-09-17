const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("scoreText");

let score = 0;

// 플레이어
const player = { x: canvas.width / 2, y: canvas.height - 30, width: 40, height: 20 };

// 총알
let bullets = [];

// 적
let enemies = [];
const enemySize = 30;
const enemySpeed = 1.5;

// 마우스 좌표
let mouseX = player.x;

// 적 생성
function spawnEnemy() {
  const x = Math.random() * (canvas.width - enemySize);
  enemies.push({ x, y: -enemySize, width: enemySize, height: enemySize });
}

// 마우스로 이동
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
});

// 발사
canvas.addEventListener("click", e => {
  bullets.push({ x: player.x, y: player.y - 10, radius: 5, dy: -7 });
});

// 게임 루프
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 플레이어 위치
  player.x += (mouseX - player.x) * 0.2;

  // 총알 이동
  bullets.forEach((b, i) => {
    b.y += b.dy;
    if (b.y < 0) bullets.splice(i, 1);
  });

  // 적 이동
  enemies.forEach((e, i) => {
    e.y += enemySpeed;
    // 화면 아래로 내려가면 제거
    if (e.y > canvas.height) enemies.splice(i, 1);
  });

  // 충돌 체크
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x > e.x && b.x < e.x + e.width &&
          b.y > e.y && b.y < e.y + e.height) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score++;
        scoreText.textContent = `점수: ${score}`;
      }
    });
  });

  draw();
  requestAnimationFrame(update);
}

// 그리기
function draw() {
  // 플레이어
  ctx.fillStyle = "white";
  ctx.fillRect(player.x - player.width/2, player.y, player.width, player.height);

  // 총알
  ctx.fillStyle = "yellow";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
    ctx.fill();
  });

  // 적
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });
}

// 적 생성 주기
setInterval(spawnEnemy, 1500);

update();
