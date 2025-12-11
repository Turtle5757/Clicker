// Game Variables
let coins = 0;
let coinsPerClick = 1;
let coinsPerSecond = 0;
let prestigePoints = 0;
let lastSaved = Date.now();

// Multipliers
let clickMultiplier = 1;
let idleMultiplier = 1;

// Generators (10)
let generators = [
  { name: "Coin Golem", cost: 50, cps: 1, owned: 0 },
  { name: "Cash Printer", cost: 200, cps: 5, owned: 0 },
  { name: "Golden Robot", cost: 1000, cps: 25, owned: 0 },
  { name: "Quantum Farm", cost: 5000, cps: 100, owned: 0 },
  { name: "Dragon Vault", cost: 20000, cps: 500, owned: 0 },
  { name: "Lucky Leprechaun", cost: 50000, cps: 1000, owned: 0 },
  { name: "Robot Accountant", cost: 200000, cps: 5000, owned: 0 },
  { name: "Coin Mining Laser", cost: 500000, cps: 10000, owned: 0 },
  { name: "Time-Warp Factory", cost: 1000000, cps: 25000, owned: 0 },
  { name: "Cosmic Bank", cost: 5000000, cps: 100000, owned: 0 },
];

// Upgrades (20 quirky)
let upgrades = [
  { name: "Hire a Butler", cost: 50, effect: () => coinsPerClick += 2, purchased: false },
  { name: "Buy a Vending Machine", cost: 200, effect: () => generators[0].cps += 2, purchased: false },
  { name: "Magic Hat", cost: 500, effect: () => { clickMultiplier += 0.5; setTimeout(() => clickMultiplier -= 0.5, 10000); }, purchased: false },
  { name: "Time-Travel Experiment", cost: 1000, effect: () => { coins += Math.floor(Math.random() * 500); }, purchased: false },
  { name: "Pet Dragon", cost: 5000, effect: () => generators[4].cps += 50, purchased: false },
  { name: "Hire Minions", cost: 10000, effect: () => document.getElementById('auto-buy').checked = true, purchased: false },
  { name: "Lucky Penny", cost: 12000, effect: () => { if(Math.random()<0.1) coins += coinsPerClick*3; }, purchased: false },
  { name: "Coin Magnet", cost: 15000, effect: () => { idleMultiplier *= 2; setTimeout(()=>idleMultiplier=1,15000); }, purchased: false },
  { name: "Buy a Tiny Island", cost: 20000, effect: () => generators.forEach(g => g.cps += 5), purchased: false },
  { name: "Upgrade Your Shoes", cost: 25000, effect: () => coinsPerClick *= 2, purchased: false },
  { name: "Golden Calculator", cost: 30000, effect: () => upgrades.forEach(u => u.cost *= 0.9), purchased: false },
  { name: "Rocket-Powered Wallet", cost: 50000, effect: () => coinsPerClick += 10, purchased: false },
  { name: "Robot Butler", cost: 75000, effect: () => generators.forEach(g => g.cps += 5), purchased: false },
  { name: "Potion of Wealth", cost: 100000, effect: () => { idleMultiplier *= 2; setTimeout(()=>idleMultiplier=1,20000); }, purchased: false },
  { name: "Quantum Calculator", cost: 150000, effect: () => generators[3].cps += 25, purchased: false },
  { name: "Hire Wizards", cost: 200000, effect: () => generators[4].cps += 10, purchased: false },
  { name: "Upgrade Coffee Machine", cost: 250000, effect: () => coinsPerClick += 5, purchased: false },
  { name: "Mini Black Hole", cost: 500000, effect: () => coins += 100, purchased: false },
  { name: "Hyper Click Gloves", cost: 1000000, effect: () => coinsPerClick *= 2, purchased: false },
  { name: "Prestige Bank", cost: 2000000, effect: () => prestigePoints += 1, purchased: false },
];

// Achievements (simple)
let achievements = [
  { name: "First Click", condition: () => coins >= 1, unlocked: false },
  { name: "100 Coins", condition: () => coins >= 100, unlocked: false },
  { name: "First Generator", condition: () => generators[0].owned >= 1, unlocked: false },
  { name: "Prestige Starter", condition: () => prestigePoints >= 1, unlocked: false },
];

// Elements
const coinsEl = document.getElementById('coins');
const cpsEl = document.getElementById('cps');
const clickBtn = document.getElementById('click-btn');
const upgradesContainer = document.getElementById('upgrades-container');
const generatorsContainer = document.getElementById('generators-container');
const prestigeBtn = document.getElementById('prestige-btn');
const prestigeInfo = document.getElementById('prestige-info');
const achievementsContainer = document.getElementById('achievements-container');
const autoBuyCheckbox = document.getElementById('auto-buy');

// Load game & offline
loadGame();
applyOfflineProgress();
renderUpgrades();
renderGenerators();
renderAchievements();
updateDisplay();

// Click
clickBtn.addEventListener('click', () => {
  coins += coinsPerClick * clickMultiplier;
  showFloatingEffect(`+${coinsPerClick * clickMultiplier}`, 'gold', clickBtn);
  checkAchievements();
  updateDisplay();
});

// Prestige
prestigeBtn.addEventListener('click', () => {
  if(coins>=1000){
    prestigePoints += Math.floor(coins/1000);
    coins=0;
    coinsPerClick=1;
    coinsPerSecond=0;
    generators.forEach(g=>g.owned=0);
    upgrades.forEach(u=>u.purchased=false);
    upgrades.forEach(u=>u.cost=Math.floor(u.cost/2));
    showFloatingEffect(`Prestige! +${prestigePoints} Points`,'purple',prestigeBtn);
    checkAchievements();
    renderUpgrades();
    renderGenerators();
    updateDisplay();
  }
});

// Buy Upgrade
function buyUpgrade(i){
  let up = upgrades[i];
  if(coins>=up.cost && !up.purchased){
    coins -= up.cost;
    up.effect();
    up.purchased=true;
    up.cost = Math.floor(up.cost*1.5);
    renderUpgrades();
    updateDisplay();
  }
}

// Buy Generator
function buyGenerator(i){
  let gen = generators[i];
  if(coins>=gen.cost){
    coins -= gen.cost;
    gen.owned++;
    gen.cost = Math.floor(gen.cost*1.5);
    renderGenerators();
    checkAchievements();
    updateDisplay();
  }
}

// Render
function renderUpgrades(){
  upgradesContainer.innerHTML="";
  upgrades.forEach((up,i)=>{
    let btn = document.createElement('button');
    btn.textContent=`${up.name} - ${up.cost} Coins`;
    btn.disabled = up.purchased;
    btn.addEventListener('click',()=>buyUpgrade(i));
    upgradesContainer.appendChild(btn);
  });
}

function renderGenerators(){
  generatorsContainer.innerHTML="";
  generators.forEach((gen,i)=>{
    let btn = document.createElement('button');
    btn.textContent=`${gen.name} (${gen.owned}) - ${gen.cost} Coins`;
    btn.addEventListener('click',()=>buyGenerator(i));
    generatorsContainer.appendChild(btn);
  });
}

function renderAchievements(){
  achievementsContainer.innerHTML="";
  achievements.forEach(a=>{
    const div=document.createElement('div');
    div.textContent = a.unlocked ? `✔ ${a.name}`:`❌ ${a.name}`;
    div.className='achievement';
    achievementsContainer.appendChild(div);
  });
}

// Auto Buy
setInterval(()=>{
  if(autoBuyCheckbox.checked){
    upgrades.forEach((u,i)=>{if(!u.purchased && coins>=u.cost) buyUpgrade(i);});
    generators.forEach((g,i)=>{if(coins>=g.cost) buyGenerator(i);});
  }
},1000);

// Auto CPS
setInterval(()=>{
  coinsPerSecond = generators.reduce((sum,g)=>sum+g.cps*g.owned,0);
  coins += coinsPerSecond * idleMultiplier;
  checkAchievements();
  updateDisplay();
},1000);

// Update Display
function updateDisplay(){
  coinsEl.textContent = `Coins: ${Math.floor(coins)}`;
  cpsEl.textContent = `Coins per second: ${Math.floor(coinsPerSecond*idleMultiplier)}`;
  prestigeInfo.textContent = `Prestige Points: ${prestigePoints}`;
  renderAchievements();
  saveGame();
}

// Achievements
function checkAchievements(){
  achievements.forEach(a=>{
    if(!a.unlocked && a.condition()){
      a.unlocked=true;
      showFloatingEffect(`Achievement: ${a.name}`,'green',achievementsContainer);
    }
  });
}

// Floating Effect
function showFloatingEffect(text,color,parent){
  const effect=document.createElement('div');
  effect.textContent=text;
  effect.style.position='absolute';
  const rect=parent.getBoundingClientRect();
  effect.style.left=`${rect.left + Math.random()*rect.width}px`;
  effect.style.top=`${rect.top}px`;
  effect.style.color=color;
  effect.style.fontWeight='bold';
  effect.style.zIndex=1000;
  effect.className='floating-effect';
  document.body.appendChild(effect);
  let y=parseInt(effect.style.top);
  let opacity=1;
  const anim=setInterval(()=>{
    y-=1;
    opacity-=0.02;
    effect.style.top=y+'px';
    effect.style.opacity=opacity;
    if(opacity<=0){
      clearInterval(anim);
      document.body.removeChild(effect);
    }
  },16);
}

// Save / Load
function saveGame(){
  localStorage.setItem('clickerProSave',JSON.stringify({coins,coinsPerClick,coinsPerSecond,generators,upgrades,prestigePoints,lastSaved:Date.now()}));
}

function loadGame(){
  const saved=JSON.parse(localStorage.getItem('clickerProSave'));
  if(saved){
    coins=saved.coins;
    coinsPerClick=saved.coinsPerClick;
    coinsPerSecond=saved.coinsPerSecond;
    generators=saved.generators;
    upgrades=saved.upgrades;
    prestigePoints=saved.prestigePoints;
    lastSaved=saved.lastSaved || Date.now();
  }
}

// Offline Progress
function applyOfflineProgress(){
  const now=Date.now();
  const secondsAway=Math.floor((now-lastSaved)/1000);
  const offlineCoins = secondsAway*generators.reduce((sum,g)=>sum+g.cps*g.owned,0)*idleMultiplier;
  coins+=offlineCoins;
  if(offlineCoins>0) showFloatingEffect(`+${Math.floor(offlineCoins)} offline`,'orange',coinsEl);
  lastSaved=now;
}

// Download / Upload Save
function downloadSave(){
  const data={coins,coinsPerClick,coinsPerSecond,generators,upgrades,prestigePoints,lastSaved};
  const blob=new Blob([JSON.stringify(data)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='clicker-pro-save.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadSave(event){
  const file=event.target.files[0];
  const reader=new FileReader();
  reader.onload=()=>{
    const data=JSON.parse(reader.result);
    coins=data.coins;
    coinsPerClick=data.coinsPerClick;
    coinsPerSecond=data.coinsPerSecond;
    generators=data.generators;
    upgrades=data.upgrades;
    prestigePoints=data.prestigePoints;
    lastSaved=data.lastSaved || Date.now();
    renderUpgrades();
    renderGenerators();
    updateDisplay();
  };
  reader.readAsText(file);
}
