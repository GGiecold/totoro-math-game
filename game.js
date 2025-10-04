// Totoro Math Game v6 with celebration sparkle and slower sprites
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
let spawnInterval = 1600; // ms default (normal)
let baseSpeed = 0.5; // slower default
let spawnTimer = null;
let spawnCount = 0;

let equations = [];
let eqIndex = 0;
let currentTarget = null;
let phaseSpawnCount = 0;
let phaseLength = 12;
let forcedSpawnAt = null;

let gamePaused = false;
let celebrationEnd = 0;
let sparkleParticles = [];

// util
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

// generate pool (5-15 eq) with 25% multiplication
function generateEquations(){
  const pool = [];
  const n = randInt(5,15);
  while(pool.length < n){
    const r = Math.random();
    let op = (r < 0.25) ? 'x' : (Math.random()<0.5?'+':'-');
    let a,b,result;
    if(op === '+'){
      a = randInt(10,99);
      b = randInt(1,89);
      if(b < 10 && Math.random() < 0.5) b = randInt(10,89);
      result = a + b;
      if(result > 99) continue;
    } else if(op === '-'){
      a = randInt(10,99);
      b = randInt(1,89);
      if(b < 10 && Math.random() < 0.5) b = randInt(10,89);
      if(b > a) [a,b] = [b,a];
      result = a - b;
      if(result < 0 || result > 99) continue;
    } else {
      // multiplication, cap result <= 999, ensure at least one operand >=10
      a = randInt(2,99);
      b = randInt(1,99);
      if(!(a>=10 || b>=10)) continue;
      result = a * b;
      if(result > 999) continue;
    }
    pool.push({a,b,op,result,expr: `${a}${op}${b}`});
  }
  // shuffle pool
  for(let i=pool.length-1;i>0;i--){ const j=randInt(0,i); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool;
}

function setupPhase(initial){
  equations = generateEquations();
  eqIndex = 0;
  phaseSpawnCount = 0;
  phaseLength = randInt(10,15);
  const pick = equations[randInt(0,equations.length-1)];
  currentTarget = pick.result;
  document.getElementById('target').textContent = currentTarget;
  forcedSpawnAt = spawnCount + randInt(4,8);
  while(forcedSpawnAt % 9 === 0 || forcedSpawnAt % 20 === 0) forcedSpawnAt++;
  if(initial){
    forcedSpawnAt = spawnCount + randInt(1,4);
    while(forcedSpawnAt % 9 === 0 || forcedSpawnAt % 20 === 0) forcedSpawnAt++;
  }
}

function startRound(){
  score = 0; lives = 5;
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  sprites = [];
  spawnCount = 0;
  setupPhase(true);
  if(spawnTimer) clearInterval(spawnTimer);
  spawnTimer = setInterval(spawnOne, spawnInterval);
}

function spawnOne(){
  spawnCount++; phaseSpawnCount++;
  if(phaseSpawnCount >= phaseLength){
    setupPhase(false);
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
      let a = Math.min(99, Math.max(10, currentTarget+randInt(1,10)));
      let b = a - currentTarget;
      if(b < 1 || b > 99) candidate = {a: currentTarget-1, b:1, op:'+' , result: currentTarget, expr:`${currentTarget-1}+1`};
      else candidate = {a,b,op:'-',result:currentTarget,expr:`${a}-${b}`};
    }
    const img = (candidate.op === 'x') ? sootPurple : sootBlack;
    sprites.push({type:'eq', x: randInt(60,W-60), y: H+60, img: img, expr: candidate.expr, result: candidate.result, op: candidate.op, speed: baseSpeed + Math.random()*0.2});
    forcedSpawnAt = null;
    return;
  }
  if(equations.length === 0) equations = generateEquations();
  const e = equations[eqIndex % equations.length];
  eqIndex++;
  const img = (e.op === 'x') ? sootPurple : sootBlack;
  sprites.push({type:'eq', x: randInt(60,W-60), y: H+60, img: img, expr: e.expr, result: e.result, op:e.op, speed: baseSpeed + Math.random()*0.2});
}

function spawnSparkles(centerX, centerY, count){
  sparkleParticles = [];
  for(let i=0;i<count;i++){
    sparkleParticles.push({
      x: centerX + randInt(-30,30),
      y: centerY + randInt(-10,10),
      vy: -0.2 + Math.random()*0.8,
      vx: -0.5 + Math.random()*1,
      life: 100 + Math.random()*200,
      alpha: 1,
      size: 2 + Math.random()*4
    });
  }
}

function showCelebration(centerX, centerY){
  if(spawnTimer){ clearInterval(spawnTimer); spawnTimer = null; }
  gamePaused = true;
  setupPhase(false);
  spawnSparkles(W/2, H/2 - 40, 36);
  celebrationEnd = Date.now() + 3000;
  setTimeout(()=>{
    gamePaused = false;
    if(!spawnTimer) spawnTimer = setInterval(spawnOne, spawnInterval);
  }, 3000);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#cfefff'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#87d17a'; ctx.fillRect(0,H-80,W,80);
  if(totoroImg.complete){
    let tw = Math.min(240, Math.floor(W*0.35));
    ctx.drawImage(totoroImg, W/2 - tw/2, H-140, tw, 140);
  }
  for(let i=sprites.length-1;i>=0;i--){
    const s = sprites[i];
    if(!gamePaused) s.y -= s.speed;
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
  if(gamePaused && Date.now() < celebrationEnd){
    ctx.fillStyle = 'rgba(255,240,200,0.6)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#333'; ctx.font = '48px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✅ Correct!', W/2, H/2 - 10);
    for(let p of sparkleParticles){
      ctx.globalAlpha = Math.max(0, p.alpha * (p.life/300));
      ctx.fillStyle = 'rgba(255,255,240,0.9)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      p.x += p.vx;
      p.y += p.vy + 0.2;
      p.vy *= 0.99;
      p.life -= 2;
      p.alpha = p.life/300;
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(draw);
}

canvas.addEventListener('pointerdown', (ev)=>{
  if(gamePaused) return;
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
        sprites.splice(i,1);
        showCelebration(s.x, s.y);
      } else {
        lives -= 1;
        if(lives <= 0){
          if(spawnTimer){ clearInterval(spawnTimer); spawnTimer=null; }
          alert('Game Over! Score: ' + score);
        }
        sprites.splice(i,1);
      }
      document.getElementById('score').textContent = score;
      document.getElementById('lives').textContent = lives;
      break;
    }
  }
});

document.getElementById('easy').addEventListener('click', ()=>{ spawnInterval = 2200; baseSpeed = 0.35; if(spawnTimer){ clearInterval(spawnTimer); spawnTimer = setInterval(spawnOne, spawnInterval); } });
document.getElementById('normal').addEventListener('click', ()=>{ spawnInterval = 1600; baseSpeed = 0.5; if(spawnTimer){ clearInterval(spawnTimer); spawnTimer = setInterval(spawnOne, spawnInterval); } });
document.getElementById('hard').addEventListener('click', ()=>{ spawnInterval = 1100; baseSpeed = 0.9; if(spawnTimer){ clearInterval(spawnTimer); spawnTimer = setInterval(spawnOne, spawnInterval); } });

document.getElementById('start').addEventListener('click', ()=>{ startRound(); });

draw();