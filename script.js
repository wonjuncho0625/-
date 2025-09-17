const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const levelText = document.getElementById("levelText");

let level = 1;
let maze, rows, cols, tileSize;
let player, exit, key;
let hasKey = false;
let moving = false; // 이동 중인지 체크
let targetX, targetY; // 목표 위치

// 랜덤 빈 칸 위치
function randomEmptyCell() {
  let x, y;
  do {
    x = Math.floor(Math.random() * (cols - 2)) + 1;
    y = Math.floor(Math.random() * (rows - 2)) + 1;
  } while (maze[y][x] !== 0 || (x === 1 && y === 1) || (x === cols - 2 && y === rows - 2));
  return { x, y };
}

// 두 지점 사이 직선 경로 뚫기
function carvePath(x1, y1, x2, y2) {
  let x = x1, y = y1;
  while (x !== x2) {
    maze[y][x] = 0;
    x += x < x2 ? 1 : -1;
  }
  while (y !== y2) {
    maze[y][x] = 0;
    y += y < y2 ? 1 : -1;
  }
  maze[y][x] = 0;
}

// 길 보장 미로 생성
function generateMaze(level) {
  rows = 8 + Math.floor(level / 5);
  cols = rows;
  tileSize = Math.floor(canvas.width / cols);

  // 초기 전체 벽
  maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 1)
  );

  // 시작/열쇠/출구 위치
  player = { x: 1, y: 1, px: 1, py: 1 };
  exit = { x: cols - 2, y: rows - 2 };
  key = randomEmptyCell();
  hasKey = false;

  // 길 보장
  carvePath(player.x, player.y, key.x, key.y);
  carvePath(key.x, key.y, exit.x, exit.y);

  // 나머지 칸 랜덤 벽 생성
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      if (maze[y][x] !== 0) {
        maze[y][x] = Math.random() < 0.3 ? 1 : 0;
      }
    }
  }

  // 시작/열쇠/출구 위치 확실히 길로
  maze[player.y][player.x] = 0;
  maze[key.y][key.x] = 0;
  maze[exit.y][exit.x] = 2;
}

// 미로 그리기
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#444"; // 벽
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else if (maze[y][x] === 2) {
        ctx.fillStyle = hasKey ? "#27ae60" : "#555"; // 출구 잠김/열림
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  // 열쇠
  if (!hasKey) {
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(
      key.x * tileSize + tileSize / 2,
      key.y * tileSize + tileSize / 2,
      tileSize / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // 플레이어
  ctx.fillStyle = "#e74c3c";
  ctx.beginPath();
  ctx.arc(
    player.px * tileSize + tileSize / 2,
    player.py * tileSize + tileSize / 2,
    tileSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// 부드러운 애니메이션 이동
function animate() {
  if (moving) {
    const speed = 0.1;
    let dx = targetX - player.px;
    let dy = targetY - player.py;

    if (Math.abs(dx) < speed && Math.abs(dy) < speed) {
      player.px = targetX;
      player.py = targetY;
      moving = false;

      // 열쇠 획득
      if (!hasKey && player.x === key.x && player.y === key.y) {
        hasKey = true;
        alert("🔑 열쇠를 얻었다! 출구가 열린다!");
      }

      // 출구 도착
      if (player.x === exit.x && player.y === exit.y) {
        if (hasKey) {
          setTimeout(() => {
            if (level < 100) {
              alert(`🎉 ${level}단계 클리어!`);
              level++;
              levelText.textContent = `현재 단계: ${level}`;
              generateMaze(level);
            } else {
              alert("🏆 100단계 클리어! 전설의 탈출자!");
            }
          }, 100);
        } else {
          alert("🚪 출구가 잠겨 있습니다. 열쇠를 먼저 찾으세요!");
        }
      }
    } else {
      player.px += dx * speed;
      player.py += dy * speed;
    }
  }

  drawMaze();
  requestAnimationFrame(animate);
}

// 키 입력
document.addEventListener("keydown", (e) => {
  if (moving) return; // 이동 중이면 무시

  let newX = player.x;
  let newY = player.y;

  if (e.key === "ArrowUp") newY--;
  if (e.key === "ArrowDown") newY++;
  if (e.key === "ArrowLeft") newX--;
  if (e.key === "ArrowRight") newX++;

  if (maze[newY] && maze[newY][newX] !== 1) {
    player.x = newX;
    player.y = newY;
    targetX = newX;
    targetY = newY;
    moving = true;
  }
});

// 게임 시작
generateMaze(level);
animate();
