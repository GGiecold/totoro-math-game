
// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let score = 0;
let lives = 5;
let target = "?";
let sprites = [];
let gameInterval;
let spawnRate = 2000; // ms
let totoroImg = new Image();
totoroImg.src = "assets/totoro.png";
let sootBlack = new Image();
sootBlack.src = "assets/soot_black.png";
let sootPurple = new Image();
sootPurple.src = "assets/soot_purple.png";
let heartImg = new Image();
heartImg.src = "assets/heart.png";
let birdImg = new Image();
birdImg.src = "assets/bird.png";

function setDifficulty(level) {
  if (level === "easy") spawnRate = 2500;
  if (level === "normal") spawnRate = 1500;
  if (level === "hard") spawnRate = 1000;
}

function generateEquations() {
  const equations = [];
  const numEquations = Math.floor(Math.random() * 11) + 5;
  for (let i=0; i<numEquations; i++) {
    let op;
    if (Math.random() < 0.25) {
      op = 'x';
    } else {
      op = Math.random() < 0.5 ? '+' : '-';
    }
    let a, b, result;
    if (op === '+') {
      a = Math.floor(Math.random()*90)+10;
      b = Math.floor(Math.random()*90);
      result = a + b;
      if (result > 99) { i--; continue; }
    } else if (op === '-') {
      a = Math.floor(Math.random()*90)+10;
      b = Math.floor(Math.random()*90);
      result = a - b;
      if (result < 0 || result > 99) { i--; continue; }
    } else {
      a = Math.floor(Math.random()*40)+10;
      b = Math.floor(Math.random()*20)+1;
      result = a * b;
      if (result > 999) { i--; continue; }
    }
    equations.push({expr:`${a}${op}${b}`, result, op});
  }
  return equations;
}

function startGame() {
  score = 0;
  lives = 5;
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
  sprites = [];
  if (gameInterval) clearInterval(gameInterval);
  const equations = generateEquations();
  const chosen = equations[Math.floor(Math.random()*equations.length)];
  target = chosen.result;
  document.getElementById("target").textContent = target;
  let i=0;
  gameInterval = setInterval(()=>{
    let eq = equations[i % equations.length];
    let img = eq.op === 'x' ? sootPurple : sootBlack;
    if ((i+1) % 9 === 0) {
      sprites.push({x:Math.random()*300+50, y:600, img:heartImg, expr:"Chloe", type:"heart"});
    } else if ((i+1) % 20 === 0) {
      sprites.push({x:Math.random()*300+50, y:600, img:birdImg, expr:"", type:"bird"});
    } else {
      sprites.push({x:Math.random()*300+50, y:600, img:img, expr:eq.expr, result:eq.result, type:"eq"});
    }
    i++;
  }, spawnRate);
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", (e)=>{
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let j=0;j<sprites.length;j++) {
    let s = sprites[j];
    if (x > s.x-30 && x < s.x+30 && y > s.y-30 && y < s.y+30) {
      if (s.type === "eq" && s.result === target) {
        score++;
        document.getElementById("score").textContent = score;
        sprites.splice(j,1);
        return;
      } else if (s.type==="eq") {
        lives--;
        document.getElementById("lives").textContent = lives;
        sprites.splice(j,1);
        if (lives <= 0) { clearInterval(gameInterval); alert("Game Over!"); }
        return;
      }
    }
  }
});

function gameLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(totoroImg, 150, 500, 100, 100);
  sprites.forEach((s)=>{
    s.y -= 1.2;
    ctx.drawImage(s.img, s.x-30, s.y-30, 60, 60);
    if (s.type==="eq") {
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(s.expr, s.x, s.y+5);
    } else if (s.type==="heart") {
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Chloe", s.x, s.y+5);
    }
  });
  requestAnimationFrame(gameLoop);
}
