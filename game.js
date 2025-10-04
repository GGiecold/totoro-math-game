// Totoro Math Game v5
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;
window.addEventListener('resize', ()=>{ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

const assetsPath = 'assets/';
const totoroImg = new Image(); totoroImg.src = assetsPath + 'totoro.png';
const sootBlack = new Image(); sootBlack.src = assetsPath + 'soot_black.png';
const sootPurple = new Image(); sootPurple.src = assetsPath + 'soot_purple.png';
const heartImg = new Image(); heartImg.src = assetsPath + 'heart.png';
const birdImg = new Image(); birdImg.src = assetsPath + 'bird.png';

let sprites = [];
let score = 0, lives = 5;
let spawnInterval = 1800;
let baseSpeed = 0.7;
let spawnTimer = null;
let spawnCount = 0;
let equations = [];
let eqIndex = 0;
let currentTarget = null;
let nextTargetChange = null;
let forcedSpawnAt = null;

function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

function generateEquations(){
  const pool = [];
  const n = randInt(5,15);
  while(pool.length < n){
    const r = Math.random();
    let op;
    if(r < 0.25) op = 'x'; else op = (Math.random()<0.5?'+':'-');
    let a,b,result;
    if(op === '+'){
      a = randInt(10,99);
      b = randInt(0,89);
      if(b < 10 && Math.random() < 0.5) b = randInt(10,89);
      result = a + b;
      if(result > 99) continue;
      if(b === 0) continue;
    } else if(op === '-'){
      a = randInt(10,99);
      b = randInt(0,89);
      if(b < 10 && Math.random() < 0.5) b = randInt(10,89);
      if(b > a) [a,b] = [b,a];
      result = a - b;
      if(result < 0 || result > 99) continue;
      if(b === 0) continue;
    } else {
      a = randInt(2,99);
      b = randInt(1,99);
      if(!(a>=10 || b>=10)) continue;
      result = a * b;
      if(result > 999) continue;
    }
    pool.push({a,b,op,result,expr: `${a}${op}${b}`});
  }
  return pool;
}

function startRound(){
  equations = generateEquations();
  eqIndex = 0;
  sprites = [];
  score = 0; lives = 5;
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  const initial = equations[randInt(0, equations.length-1)];
  currentTarget = initial.result;
  document.getElementById('target').textContent = currentTarget;
  nextTargetChange = spawnCount + randInt(10,15);
  forcedSpawnAt = spawnCount + randInt(1,4);
  if(forcedSpawnAt % 9 === 0 || forcedSpawnAt % 20 === 0){
    while(forcedSpawnAt % 9 === 0 || forcedSpawnAt % 20 === 0) forcedSpawnAt++;
  }
  if(spawnTimer) clearInterval(spawnTimer);
  spawnTimer = setInterval(spawnOne, spawnInterval);
}

function spawnOne(){
  spawnCount++;
  if(spawnCount >= nextTargetChange){
    const pick = equations[randInt(0, equations.length-1)];
    currentTarget = pick.result;
    document.getElementById('target').textContent = currentTarget;
    nextTargetChange = spawnCount + randInt(10,15);
    forcedSpawnAt = spawnCount + randInt(4,8);
    if(forcedSpawnAt % 9 === 0 || forcedSpawnAt % 20 === 0){
      while(forcedSpawnAt % 9 === 0 || forcedSpawnAt % 20 === 0) forcedSpawnAt++;
    }
  }

  if(spawnCount % 20 === 0){
    sprites.push({type:'bird', x: randInt(60, W-60), y: H+60, img: birdImg, speed: baseSpeed*0.35});
    return;
  }
  if(spawnCount % 9 === 0){
    sprites.push({type:'heart', x: randInt(60, W-60), y: H+60, img: heartImg, speed: baseSpeed*0.35});
    return;
  }

  if(forcedSpawnAt && spawnCount === forcedSpawnAt){
    let candidate = equations.find(e => e.result === currentTarget);
    if(!candidate){
      let a = randInt(10, Math.min(99, currentTarget+10));
      let b = a - currentTarget;
      if(b<1 || b>99){
        candidate = {a:currentTarget-1, b:1, op:'+' , result: currentTarget, expr:`${currentTarget-1}+1`};
      } else {
        candidate = {a,b,op:'-',result:currentTarget,expr:`${a}-${b}`};
      }
    }
    const img = (candidate.op === 'x')? sootPurple: sootBlack;
    sprites.push({type:'eq', x: randInt(60,W-60), y: H+60, img: img, expr: candidate.expr, result: candidate.result, op:candidate.op, speed: baseSpeed + Math.random()*0.3});
    forcedSpawnAt = null;
    return;
  }

  if(equations.length === 0) equations = generateEquations();
  const e = equations[eqIndex % equations.length];
  eqIndex++;
  const img = (e.op === 'x')? sootPurple: sootBlack;
  sprites.push({type:'eq', x: randInt(60,W-60), y: H+60, img: img, expr: e.expr, result: e.result, op:e.op, speed: baseSpeed + Math.random()*0.3});
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#cfefff'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#87d17a'; ctx.fillRect(0,H-80,W,80);
  if(totoroImg.complete){
    let tw = Math.min(240, Math.floor(W*0.35));
    ctx.drawImage(totoroImg, W/2 - tw/2, H-140, tw, 140);
  }
  for(let i = sprites.length-1; i>=0; i--){
    const s = sprites[i];
    s.y -= s.speed;
    if(s.type === 'eq'){
      ctx.drawImage(s.img, s.x-36, s.y-36, 72, 72);
      ctx.fillStyle = 'white'; ctx.font = '18px sans-serif'; ctx.textAlign='center';
      ctx.fillText(s.expr, s.x, s.y+40);
    } else if(s.type === 'heart'){
      ctx.drawImage(s.img, s.x-32, s.y-32, 64, 64);
    } else if(s.type === 'bird'){
      ctx.drawImage(s.img, s.x-32, s.y-32, 64, 64);
    }
    if(s.y < -80) sprites.splice(i,1);
  }
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  requestAnimationFrame(draw);
}

canvas.addEventListener('pointerdown', (ev)=>{
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  for(let i=sprites.length-1;i>=0;i--){
    const s = sprites[i];
    if(s.type !== 'eq') continue;
    const dx = x - s.x, dy = y - s.y;
    if(dx*dx + dy*dy <= 36*36){
      if(s.result === currentTarget){
        score += 1;
        if(Math.random() < 0.3){
          nextTargetChange = spawnCount + randInt(10,15);
        }
      } else {
        lives -= 1;
        if(lives <= 0){
          if(spawnTimer) clearInterval(spawnTimer);
          spawnTimer = null;
          alert('Game Over! Score: '+score);
        }
      }
      sprites.splice(i,1);
      break;
    }
  }
});

document.getElementById('easy').addEventListener('click', ()=>{ spawnInterval = 2200; baseSpeed = 0.45; if(spawnTimer){ clearInterval(spawnTimer); spawnTimer = setInterval(spawnOne, spawnInterval);} });
document.getElementById('normal').addEventListener('click', ()=>{ spawnInterval = 1600; baseSpeed = 0.7; if(spawnTimer){ clearInterval(spawnTimer); spawnTimer = setInterval(spawnOne, spawnInterval);} });
document.getElementById('hard').addEventListener('click', ()=>{ spawnInterval = 1100; baseSpeed = 1.1; if(spawnTimer){ clearInterval(spawnTimer); spawnTimer = setInterval(spawnOne, spawnInterval);} });

document.getElementById('start').addEventListener('click', ()=>{ startRound(); });

draw();
