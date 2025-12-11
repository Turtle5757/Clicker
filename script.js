// Game Variables
let coins = 0;
let coinsPerClick = 1;
let coinsPerSecond = 0;
let prestigePoints = 0;
let lastSaved = Date.now();
let clickMultiplier = 1;
let idleMultiplier = 1;

// Generators
let generators = [
  { name: "Coin Golem", cost: 50, cps: 1, owned: 0, icon: "💰" },
  { name: "Cash Printer", cost: 200, cps: 5, owned: 0, icon: "🖨️" },
  { name: "Golden Robot", cost: 1000, cps: 25, owned: 0, icon: "🤖" },
  { name: "Quantum Farm", cost: 5000, cps: 100, owned: 0, icon: "🌾" },
  { name: "Dragon Vault", cost: 20000, cps: 500, owned: 0, icon: "🐉" },
  { name: "Lucky Leprechaun", cost: 50000, cps: 1000, owned: 0, icon: "🍀" },
  { name: "Robot Accountant", cost: 200000, cps: 5000, owned: 0, icon: "📊" },
  { name: "Coin Mining Laser", cost: 500000, cps: 10000, owned: 0, icon: "🔫" },
  { name: "Time-Warp Factory", cost: 1000000, cps: 25000, owned: 0, icon: "⏳" },
  { name: "Cosmic Bank", cost: 5000000, cps: 100000, owned: 0, icon: "🏦" },
];

// Upgrades
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

// Achievements
let achievements = [
  { name: "First Click", condition: () => coins >= 1, unlocked: false },
  { name: "100 Coins", condition: () => coins >= 100, unlocked: false },
  { name: "First Generator", condition: () => generators[0].owned >= 1, unlocked: false },
  { name: "Prestige Starter", condition: () => prestigePoints >= 1, unlocked: false },
];

// DOM Elements
const coinsEl = document.getElementById('coins');
const cpsEl = document.getElementById('cps');
const prestigeEl = document.getElementById('prestige');
const clickBtn = document.getElementById('click-btn');
const upgradesContainer = document.getElementById('upgrades-container');
const generatorsContainer = document.getElementById('generators-container');
const achievementsContainer = document.getElementById('achievements-container');
const prestigeBtn = document.getElementById('prestige-btn');
const autoBuyCheckbox = document.getElementById('auto-buy');

// Load game
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
    let gained = Math.floor(coins/1000);
    prestigePoints += gained;
    coins=0; coinsPerClick=1; coinsPerSecond=0;
    generators.forEach(g=>g.owned=0);
    upgrades.forEach(u=>u.purchased=false);
    upgrades.forEach(u=>u.cost=Math.floor(u.cost/2));
    showFloatingEffect(`Prestige! +${gained} Points`,'purple',prestigeBtn);
    renderUpgrades();
    renderGenerators();
    updateDisplay();
  } else {
    alert("You need at least 1000 coins to Prestige!");
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

// Render Generators with Progress & Locked State
function renderGenerators(){
  generatorsContainer.innerHTML = "";
  generators.forEach((gen,i)=>{
    const card = document.createElement('div');
    const affordableSoon = coins >= gen.cost*0.8 && coins < gen.cost;
    card.className = "card";
    if(affordableSoon) card.classList.add("locked");
    card.innerHTML = `<div style="font-size:24px">${gen.icon}</div>
                      <strong>${gen.name}</strong><br>
                      Owned: ${gen.owned}<br>
                      CPS: ${gen.cps}<br>
                      Cost: ${gen.cost}`;
    const progress = document.createElement('div');
    progress.className='progress-bar';
    const inner = document.createElement('div');
    inner.className='progress-bar-inner';
    inner.style.width = Math.min(100, (coins/gen.cost)*100)+'%';
    progress.appendChild(inner);
    card.appendChild(progress);

    const btn = document.createElement('button');
    btn.textContent = "Buy";
    btn.disabled = coins < gen.cost;
    btn.addEventListener('click',()=>buyGenerator(i));
    card.appendChild(btn);
    generatorsContainer.appendChild(card);
  });
}

// Render Upgrades with Locked State
function renderUpgrades(){
  upgradesContainer.innerHTML = "";
  upgrades.forEach((up,i)=>{
    const card = document.createElement('div');
    const affordableSoon = coins >= up.cost*0.8 && coins < up.cost;
    card.className = "card";
    if(affordableSoon && !up.purchased) card.classList.add("locked");
    card.innerHTML = `<strong>${up.name}</strong><br>Cost: ${up.cost}`;
    const btn = document.createElement('button');
    btn.textContent = up.purchased ? "Purchased" : "Buy";
    btn.disabled = coins < up.cost || up.purchased;
    btn.addEventListener('click',()=>buyUpgrade(i));
    card.appendChild(btn);
    upgradesContainer.appendChild(card);
  });
}

// Render Achievements
function renderAchievements(){
  achievementsContainer.innerHTML="";
  achievements.forEach(a=>{
    const div=document.createElement('div');
    div.textContent = a.unlocked ? `✔ ${a.name}`:`❌ ${a.name}`;
    div.className='card';
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

function updateDisplay(){
  coinsEl.textContent = Math.floor(coins);
  cpsEl.textContent = Math.floor(coinsPerSecond * idleMultiplier);
  prestigeEl.textContent = prestigePoints;
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
  const rect=parent.getBoundingClientRect();
  effect.style.left=`${rect.left + Math.random()*rect.width}px`;
  effect.style.top=`${rect.top}px`;
  effect.style.color=color;
  effect.style.fontWeight='bold';
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
