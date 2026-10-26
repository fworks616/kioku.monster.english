import {createPronunciationPlayer} from './audio.js';
import {words} from './words.js';
import {dayKey,review} from './learning.js';

const genres=[['TRAVEL','旅','✈','#7459e8'],['FOOD','食','🍔','#ec5968'],['WORK','仕事','💼','#177bdc'],['LIFE','暮らし','⌂','#12a9a0'],['NATURE','自然','🍃','#9258d5'],['SCIENCE','科学','⚗','#ee6659'],['CULTURE','文化','🎨','#2884dc'],['RANDOM','おまかせ','?','#12aaa1']].map(([name,jp,icon,color])=>({name,jp,icon,color}));
const wheelAngles=[45,315,135,225];
const wheelAngle=index=>wheelAngles[index]??index*90;
const svg={home:'<path d="m3 11 9-8 9 8v9h-6v-6H9v6H3z"/>',book:'<path d="M4 5c3-2 6-1 8 1 2-2 5-3 8-1v14c-3-1-6 0-8 2-2-2-5-3-8-2z"/><path d="M12 6v15"/>',chart:'<path d="M4 20h17M7 16v-5m5 5V4m5 12V8"/>',sound:'<path d="m11 5-5 4H3v6h3l5 4z"/><path d="M15 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${svg[n]}</svg>`;

let state;
try{state=JSON.parse(localStorage.getItem('kioku-v1'))}catch{}
state={records:{},days:{},bookmarks:[],goal:5,requeue:[],questionCount:0,...state};
state.requeue=Array.isArray(state.requeue)?state.requeue:[];
state.questionCount=Number.isInteger(state.questionCount)?state.questionCount:0;

function restoreWheelGame(){try{const saved=JSON.parse(sessionStorage.getItem('kioku-wheel-v1'));if(!saved||!Array.isArray(saved.questions)||!Number.isInteger(saved.index)||saved.index<0||saved.index>4)return null;const byId=new Map(words.map(w=>[w.id,w]));const questions=saved.questions.map(id=>byId.get(id));if(questions.some(w=>!w))return null;return {...saved,questions,options:Array.isArray(saved.options)?saved.options.map(id=>byId.get(id)).filter(Boolean):null,usedOptions:Array.isArray(saved.usedOptions)?saved.usedOptions:[]}}catch{return null}}
function persistWheelGame(){try{if(!wheelGame){sessionStorage.removeItem('kioku-wheel-v1');return}sessionStorage.setItem('kioku-wheel-v1',JSON.stringify({...wheelGame,questions:wheelGame.questions.map(w=>w.id),options:wheelGame.options?.map(w=>w.id)||null}))}catch{}}
let wheelGame=restoreWheelGame();
let page='home',spinning=!!wheelGame?.spinning,selected=0,session=null,sound=true,audio,audioCtx=null,account=null,authMode='signin',modal=null,saveQueue=Promise.resolve();
let ballAnimId=null;
let lastLandedIndex=null;

const app=document.querySelector('#app'),today=()=>state.days[dayKey()]||0,total=()=>Object.values(state.days).reduce((a,b)=>a+b,0);
function streak(){let n=0,d=new Date();if(!state.days[dayKey(d)])d.setDate(d.getDate()-1);while(state.days[dayKey(d)]){n++;d.setDate(d.getDate()-1)}return n}
function save(){if(account){const snapshot=JSON.stringify(state);saveQueue=saveQueue.then(async()=>{const r=await fetch('/api/data',{method:'PUT',headers:{'Content-Type':'application/json'},body:snapshot});if(!r.ok)throw Error()}).catch(()=>toast('学習記録を保存できませんでした'));return}try{localStorage.setItem('kioku-v1',JSON.stringify(state))}catch{}}
function toast(s){const e=document.querySelector('#toast');e.textContent=s;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>[...a].sort(()=>Math.random()-.5);

function getAudioCtx(){
  if(!sound)return null;
  // Safari otherwise treats Web Audio as ambient sound and mutes it with the
  // iPhone's silent switch, even while the pronunciation MP3s remain audible.
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch{}
  const AudioCtx=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!AudioCtx)return null;
  if(!audioCtx||audioCtx.state==='closed')try{audioCtx=new AudioCtx()}catch{}
  return audioCtx;
}

function unlockAudioFromGesture(){
  const ctx=getAudioCtx();
  if(!ctx||ctx.state==='closed')return Promise.resolve();
  // Start the buffer inside the tap handler, including while suspended.
  // Waiting for resume() first loses the user gesture on older iOS versions.
  try{
    const buffer=ctx.createBuffer(1,1,ctx.sampleRate);
    const source=ctx.createBufferSource();
    source.buffer=buffer;
    source.connect(ctx.destination);
    source.start();
  }catch{}
  if(ctx.state==='running')return Promise.resolve();
  try{
    const resumed=ctx.resume?.();
    return Promise.resolve(resumed).catch(()=>{});
  }catch{return Promise.resolve()}
}

function ballClickSound(speedRatio=1){
  if(!sound)return;
  try{
    const ctx=getAudioCtx();
    if(!ctx||ctx.state!=='running')return;
    const now=ctx.currentTime;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    const freq=550+speedRatio*1000;
    osc.type='triangle';
    osc.frequency.setValueAtTime(freq,now);
    osc.frequency.exponentialRampToValueAtTime(450,now+0.018);
    const vol=0.16+speedRatio*0.2;
    gain.gain.setValueAtTime(vol,now);
    gain.gain.exponentialRampToValueAtTime(0.001,now+0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now+0.022);
  }catch{}
}

function ballBounceSound(){
  if(!sound)return;
  try{
    const ctx=getAudioCtx();
    if(!ctx||ctx.state!=='running')return;
    const now=ctx.currentTime;
    [0,0.045].forEach((delay,idx)=>{
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(idx===0?640:440,now+delay);
      gain.gain.setValueAtTime(0.35,now+delay);
      gain.gain.exponentialRampToValueAtTime(0.001,now+delay+0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now+delay);
      osc.stop(now+delay+0.055);
    });
  }catch{}
}

function ballDropSound(){
  if(!sound)return;
  try{
    const ctx=getAudioCtx();
    if(!ctx||ctx.state!=='running')return;
    const now=ctx.currentTime;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(320,now);
    gain.gain.setValueAtTime(0.3,now);
    gain.gain.exponentialRampToValueAtTime(0.001,now+0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now+0.09);
  }catch{}
}

function playWinFanfare(){
  if(!sound)return;
  try{
    const ctx=getAudioCtx();
    if(!ctx||ctx.state!=='running')return;
    const notes=[523.25,659.25,783.99,1046.5];
    notes.forEach((freq,i)=>{
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      const now=ctx.currentTime+i*0.08;
      osc.type='triangle';
      osc.frequency.setValueAtTime(freq,now);
      gain.gain.setValueAtTime(0.22,now);
      gain.gain.exponentialRampToValueAtTime(0.001,now+0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now+0.26);
    });
  }catch{}
}

function playLoseTone(){
  if(!sound)return;
  try{
    const ctx=getAudioCtx();
    if(!ctx||ctx.state!=='running')return;
    const notes=[370,330];
    notes.forEach((freq,i)=>{
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      const now=ctx.currentTime+i*0.12;
      osc.type='sine';
      osc.frequency.setValueAtTime(freq,now);
      gain.gain.setValueAtTime(0.18,now);
      gain.gain.exponentialRampToValueAtTime(0.001,now+0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now+0.24);
    });
  }catch{}
}

function nav(){return `<nav class="bottom-nav"><button data-page="home" class="${page==='home'?'active':''}">${icon('home')}<span>ホーム</span></button><button data-page="words" class="${page==='words'?'active':''}">${icon('book')}<span>単語帳</span></button><button data-page="stats" class="${page==='stats'?'active':''}">${icon('chart')}<span>記録</span></button><button data-action="account" class="${modal==='account'?'active':''}">${icon('user')}<span>${account?'アカウント':'ログイン'}</span></button></nav>`}
function authModal(){return `<div class="auth-backdrop"><section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button class="auth-close" data-action="close-modal" aria-label="閉じる">${icon('close')}</button><div class="auth-emblem">✦</div>${account?`<p class="overline">SIGNED IN</p><h2 id="auth-title">${esc(account.name)}さん</h2><p class="auth-copy">${esc(account.email)}<br>学習記録はこのアカウントに保存されています。</p><button class="auth-primary" data-action="signout">ログアウト</button>`:`<p class="overline">${authMode==='signup'?'CREATE YOUR ACCOUNT':'WELCOME BACK'}</p><h2 id="auth-title">${authMode==='signup'?'冒険を保存しよう。':'おかえりなさい。'}</h2><p class="auth-copy">ログインすると、端末が変わっても学習記録を引き継げます。</p><form id="auth-form">${authMode==='signup'?'<label>お名前<input name="name" autocomplete="nickname" maxlength="40" required></label>':''}<label>メールアドレス<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>パスワード<input name="password" type="password" autocomplete="${authMode==='signup'?'new-password':'current-password'}" minlength="10" maxlength="128" required><small>10文字以上</small></label><p id="auth-error" role="alert"></p><button class="auth-primary" type="submit">${authMode==='signup'?'アカウントを作成':'ログイン'}</button></form><button class="auth-switch" data-action="toggle-auth">${authMode==='signup'?'すでにアカウントをお持ちの方':'はじめての方 · 新規登録'}</button><p class="auth-note">ゲスト記録とアカウント記録は別々に保存されます。</p>`}</section></div>`}
function show(html,cls=''){app.innerHTML=`<div class="app-shell ${cls}">${html}${cls==='stats-shell'?'':nav()}${modal==='account'?authModal():''}</div>`;bind()}
function renderCurrent(){if(page==='words')wordPage();else if(page==='stats')stats();else home()}

function questionPriority(w){const record=state.records[w.id],pending=state.requeue.find(x=>x.id===w.id&&x.due<=state.questionCount);if(pending)return 0;if(record?.due<=Date.now())return 1;if(!record)return 2;return 3}
function chooseTarget(used){const available=words.filter(w=>!used.has(w.id));if(!available.length)return null;const pending=available.filter(w=>questionPriority(w)===0),due=available.filter(w=>questionPriority(w)===1),unseen=available.filter(w=>questionPriority(w)===2),other=available.filter(w=>questionPriority(w)===3);if(pending.length)return pending[Math.floor(Math.random()*pending.length)];if(unseen.length&&due.length&&Math.random()<.4)return unseen[Math.floor(Math.random()*unseen.length)];if(due.length)return due[Math.floor(Math.random()*due.length)];if(unseen.length)return unseen[Math.floor(Math.random()*unseen.length)];return shuffle(other)[0]||available[0]}
function makeWheelGame(){const questions=[],used=new Set();for(let i=0;i<5;i++){const target=chooseTarget(used);if(!target)break;questions.push(target);used.add(target.id)}return {questions,index:0,correct:0,answered:false,chosen:null,options:null,usedOptions:[]}}
function wheelQuestion(){wheelGame??=makeWheelGame();const target=wheelGame.questions[wheelGame.index];if(!target)return words[0];if(!wheelGame.options){const usedIds=new Set([...wheelGame.questions.slice(0,wheelGame.index).map(w=>w.id),...wheelGame.usedOptions,target.id]);let distractors=shuffle(words.filter(w=>!usedIds.has(w.id))).slice(0,3);if(distractors.length<3)distractors=shuffle(words.filter(w=>w.id!==target.id)).slice(0,3);wheelGame.usedOptions.push(...distractors.map(w=>w.id));wheelGame.options=shuffle([target,...distractors])}persistWheelGame();return target}
function outcomeFx(correct){return `<div class="outcome-fx ${correct?'celebrate':'sad'}" aria-hidden="true"><strong>${correct?'大正解！':'ざんねん…'}</strong></div>`}

const raf=typeof requestAnimationFrame==='function'?requestAnimationFrame:(fn)=>setTimeout(fn,16);
const caf=typeof cancelAnimationFrame==='function'?cancelAnimationFrame:(id)=>clearTimeout(id);

// Generate authentic SVG European roulette matching user image
function renderRouletteSvg(options,target,chosen,answered){
  const ringPath=(outer,inner,step)=>{
    const half=step*Math.PI/360;
    const point=(r,a)=>[300+r*Math.sin(a),300-r*Math.cos(a)].map(n=>n.toFixed(1));
    const [x1,y1]=point(outer,-half),[x2,y2]=point(outer,half),[x3,y3]=point(inner,half),[x4,y4]=point(inner,-half);
    return `M ${x1} ${y1} A ${outer} ${outer} 0 ${step>180?1:0} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${step>180?1:0} 0 ${x4} ${y4} Z`;
  };
  const pinsVertical=[0,45,90,135,180,225,270,315].map(a=>`
    <g transform="rotate(${a} 300 300)">
      <ellipse cx="300" cy="46" rx="4" ry="14" fill="url(#metal-pin)" stroke="#4a2a0e" stroke-width="0.8" filter="url(#drop-shadow)"/>
    </g>`).join('');

  const pinsHorizontal=[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map(a=>`
    <g transform="rotate(${a} 300 300)">
      <ellipse cx="300" cy="48" rx="10" ry="3.5" fill="url(#metal-pin)" stroke="#4a2a0e" stroke-width="0.8" filter="url(#drop-shadow)"/>
    </g>`).join('');

  const sectors=options.map((w,i)=>{
    const a=wheelAngle(i);
    const isRed=i%2===0;
    const isCorrect=answered&&w.id===target.id;
    const isWrong=answered&&i===chosen&&w.id!==target.id;
    const isSelected=i===chosen;
    const pocketFill=isCorrect?'#10854d':isWrong?'#50141f':isRed?'#d11a2a':'#141416';
    return `
      <!-- Sector ${i}: Pocket -->
      <g class="svg-sector ${isCorrect?'is-correct':''} ${isWrong?'is-wrong':''} ${isSelected?'is-selected':''}" transform="rotate(${a} 300 300)">
        <!-- Outer Black Word Band (r=244 to 176, expanded for maximum visibility) -->
        <path d="${ringPath(244,176,360/options.length)}" fill="#121216" stroke="#f6ce72" stroke-width="1"/>
        
        <!-- Inner Box Pocket (r=176 to 126) -->
        <path d="${ringPath(176,126,360/options.length)}" fill="${pocketFill}" stroke="#e5b854" stroke-width="1.2"/>
        <!-- Inner pocket depth shadow -->
        <path d="${ringPath(150,126,360/options.length)}" fill="rgba(0,0,0,0.35)"/>
      </g>
    `;
  }).join('');

  const frets=[0,45,90,135,180,225,270,315].map(a=>`
    <line x1="300" y1="58" x2="300" y2="172" stroke="url(#metal-fret)" stroke-width="2" transform="rotate(${a+22.5} 300 300)"/>
    <circle cx="300" cy="172" r="2.5" fill="#f8e08d" transform="rotate(${a+22.5} 300 300)"/>
  `).join('');

  return `
    <svg class="casino-roulette-svg" viewBox="0 0 600 600" aria-hidden="true">
      <defs>
        <radialGradient id="wood-bowl" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#e3a763"/>
          <stop offset="25%" stop-color="#b67332"/>
          <stop offset="55%" stop-color="#733d14"/>
          <stop offset="85%" stop-color="#46220a"/>
          <stop offset="100%" stop-color="#230d04"/>
        </radialGradient>
        <radialGradient id="ball-track-groove" cx="50%" cy="50%" r="50%">
          <stop offset="68%" stop-color="#281406" stop-opacity="0"/>
          <stop offset="72%" stop-color="#1e0c03"/>
          <stop offset="86%" stop-color="#451e08"/>
          <stop offset="97%" stop-color="#140602"/>
          <stop offset="100%" stop-color="#5a2b0c"/>
        </radialGradient>
        <radialGradient id="gold-cone" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stop-color="#fff8d4"/>
          <stop offset="28%" stop-color="#e5be61"/>
          <stop offset="65%" stop-color="#a6731e"/>
          <stop offset="100%" stop-color="#694109"/>
        </radialGradient>
        <linearGradient id="metal-pin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="35%" stop-color="#f8e59e"/>
          <stop offset="70%" stop-color="#ba8226"/>
          <stop offset="100%" stop-color="#5e3805"/>
        </linearGradient>
        <linearGradient id="metal-fret" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="50%" stop-color="#d49a24"/>
          <stop offset="100%" stop-color="#7c4e09"/>
        </linearGradient>
        <linearGradient id="chrome-arm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#e2e2e8"/>
          <stop offset="65%" stop-color="#8a8a96"/>
          <stop offset="100%" stop-color="#3a3a44"/>
        <filter id="text-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000" flood-opacity="0.95"/>
        </filter>
        <radialGradient id="ball-sphere" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="35%" stop-color="#f8f8f8"/>
          <stop offset="70%" stop-color="#cccccc"/>
          <stop offset="100%" stop-color="#555555"/>
        </radialGradient>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.8"/>
        </filter>
        <filter id="cone-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- 1. Outer Mahogany Bowl -->
      <circle cx="300" cy="300" r="294" fill="url(#wood-bowl)" stroke="#260f04" stroke-width="5"/>
      <circle cx="300" cy="300" r="287" fill="none" stroke="#e8b46e" stroke-width="2.5" opacity="0.8"/>
      <circle cx="300" cy="300" r="283" fill="none" stroke="#3d1806" stroke-width="2"/>

      <!-- 2. Ball Track Slope (Ball circles in this outer channel r=285) -->
      <circle cx="300" cy="300" r="284" fill="url(#ball-track-groove)"/>
      <circle cx="300" cy="300" r="244" fill="none" stroke="#2a1005" stroke-width="3"/>

      <!-- 3. Metallic Deflectors: 8 vertical canoe pins & 8 horizontal oval pins -->
      ${pinsVertical}
      ${pinsHorizontal}

      <!-- 4. Word Band & Pockets (Red & Black alternating, High Visibility Words) -->
      <g filter="url(#drop-shadow)">
        ${sectors}
        ${frets}
      </g>

      <!-- 5. Brass Center Cone (Sloping down from turret to pockets) -->
      <circle cx="300" cy="300" r="126" fill="url(#gold-cone)" stroke="#ffd76b" stroke-width="2.5" filter="url(#cone-shadow)"/>
      <!-- Radiating lines on brass cone -->
      ${[0,45,90,135,180,225,270,315].map(a=>`<line x1="300" y1="300" x2="300" y2="152" stroke="#78480b" stroke-width="1.2" opacity="0.55" transform="rotate(${a} 300 300)"/>`).join('')}

      <!-- 6. Center Chrome & Brass Turret Spindle (十字ハンドルなし、リアルな多重金属ドームノブ) -->
      <g filter="url(#drop-shadow)">
        <!-- Turret Base Ring -->
        <circle cx="300" cy="300" r="48" fill="#18181c" stroke="#d6d6df" stroke-width="2.5"/>
        <circle cx="300" cy="300" r="40" fill="url(#chrome-arm)" stroke="#111" stroke-width="1.5"/>
        <circle cx="300" cy="300" r="30" fill="url(#gold-cone)" stroke="#ffd76b" stroke-width="1.5"/>

        <!-- Center Dome Knob (すっきりとした美しい真鍮クロムノブ) -->
        <circle cx="300" cy="300" r="20" fill="url(#chrome-arm)" stroke="#1a1a20" stroke-width="2"/>
        <circle cx="300" cy="300" r="12" fill="#141418"/>
        <circle cx="300" cy="300" r="6" fill="#ffffff" opacity="0.95"/>
      </g>

      <!-- 7. Roulette Ball (Ivory Sphere rolling along outer track r=285 down to pocket r=151) -->
      <g id="roulette-ball-group" style="display: none;">
        <circle id="roulette-ball-shadow" cx="300" cy="19" r="10" fill="rgba(0,0,0,0.5)" filter="url(#drop-shadow)"/>
        <circle id="roulette-ball" cx="300" cy="15" r="9.5" fill="url(#ball-sphere)" stroke="#ffffff" stroke-width="0.5"/>
      </g>
    </svg>
  `;
}

function home(){
  page='home';
  const target=wheelQuestion();
  const isCorrect=wheelGame.answered&&wheelGame.options[wheelGame.chosen]?.id===target.id;
  const correctIndex=wheelGame.options.findIndex(w=>w.id===target.id);

  show(`<main class="home">
    ${wheelGame.answered?outcomeFx(isCorrect):''}
    <div class="sky" aria-hidden="true"><i></i><i></i><i></i><span></span></div>
    <header>
      <div>
        <button class="streak" data-page="stats">🔥 <b>${streak()}</b>日連続</button>
        <button class="sound" data-action="sound">${sound?icon('sound'):'×'}</button>
      </div>
    </header>
    ${wheelGame.answered?`<div class="top-actions">
      <button class="pronounce-answer" data-wheel-speak="${target.id}">${icon('sound')}<span>発音を聞く</span></button>
        <button class="spin next-btn top-next" data-action="next-wheel"><strong>→</strong><b>${wheelGame.index===4?'結果を見る':'次の問題へ'}</b></button>
    </div>`:''}

    <section class="title answer-title">
      <h1>「<em>${target.meaning}</em>」</h1>
      <h2>${spinning?'ボールがルーレットを周回中…':wheelGame.answered?'ボールが正解のポケットに入りました':'正しい英単語をタップしよう（ボール発射）'}</h2>
      <p style="margin-top:7px;font-size:12px;opacity:.78;font-weight:700">${wheelGame.index+1} / 5 問</p>
    </section>

    <!-- 本格ヨーロピアンルーレットステージ -->
    <section class="wheel-stage">
      <div class="roulette-wrapper">
        <!-- SVGリアルルーレット盤（画像準拠） -->
        ${renderRouletteSvg(wheelGame.options,target,wheelGame.chosen,wheelGame.answered)}

        <!-- 盤面タップ用の透明ボタン: 盤面直タップ -->
        <div class="pocket-hitboxes">
          ${wheelGame.options.map((w,i)=>`
            <button class="pocket-hitbox ${wheelGame.answered?(w.id===target.id?'is-correct':i===wheelGame.chosen?'is-wrong':''):''}"
                    style="--i:${i};--angle:${wheelAngle(i)}deg"
                    data-wheel-choice="${i}"
                    ${spinning||wheelGame.answered?'disabled':''}
                    aria-label="${esc(w.word)}">
            </button>
          `).join('')}
        </div>
      </div>
      <!-- 4枚を盤面の四隅に配置し、同じ位置のポケットを選べるようにする -->
      <section class="choices-container">
        <p class="choices-label">${spinning?'ボールが正解へ向かって回転中…':wheelGame.answered?'学習結果':'正しい英単語をタップしてください'}</p>
      <div class="choices-grid">
        ${wheelGame.options.map((w,i)=>{
          const isCorrectCard=wheelGame.answered&&w.id===target.id;
          const isChosenWrong=wheelGame.answered&&i===wheelGame.chosen&&w.id!==target.id;
          const isSelected=wheelGame.chosen===i;
          const cardColor=i%2===0?'card-red':'card-black';
          const wordSize=w.word.length<=8?24:w.word.length<=10?22:w.word.length<=12?20:18;
          const cls=['choice-card',cardColor,isCorrectCard?'is-correct':'',isChosenWrong?'is-wrong':'',isSelected?'is-selected':''].filter(Boolean).join(' ');
          return `<button class="${cls}" data-card-choice="${i}" aria-pressed="${isSelected}" ${spinning||wheelGame.answered?'disabled':''}>
            <span class="choice-word" style="font-size:${wordSize}px">${w.word}</span>${isCorrectCard?'<small class="choice-correct-label">正解</small>':''}
          </button>`;
        }).join('')}
      </div>
      </section>
    </section>

    ${wheelGame.answered?`<section class="answer-study" aria-label="単語の解説">
      <div class="study-heading"><h2>${esc(target.word)}</h2><button class="pronounce-answer" data-example="${target.id}" aria-label="${esc(target.word)}の例文を聞く">${icon('sound')}<span>例文を聞く</span></button></div>
      <p class="study-pronunciation">${esc(target.ipa)} · ${esc(target.pos)}</p>
      <p class="study-example" lang="en">${esc(target.example)}</p>
      <p class="study-translation">${esc(target.translation)}</p>
    </section>`:''}
  </main>`,'night');

  // 回答済みの場合はボールの位置を正解ポケットに維持
  if(wheelGame.answered){
    const ballGroup=document.getElementById?.('roulette-ball-group');
    const ball=document.getElementById?.('roulette-ball');
    const shadow=document.getElementById?.('roulette-ball-shadow');
    if(ballGroup&&ball){
      ballGroup.style.display='block';
      const rad=wheelAngle(correctIndex)*Math.PI/180;
      const cx=300+151*Math.sin(rad);
      const cy=300-151*Math.cos(rad);
      ball.setAttribute('cx',cx.toFixed(1));
      ball.setAttribute('cy',cy.toFixed(1));
      if(shadow){
        shadow.setAttribute('cx',(cx+2).toFixed(1));
        shadow.setAttribute('cy',(cy+3).toFixed(1));
      }
    }
  }
}

function launchBallToPocket(targetIndex,onComplete){
  if(ballAnimId){caf(ballAnimId);ballAnimId=null}
  const ballGroup=document.getElementById?.('roulette-ball-group');
  const ball=document.getElementById?.('roulette-ball');
  const shadow=document.getElementById?.('roulette-ball-shadow');
  if(!ballGroup||!ball){onComplete();return}

  // SVG viewBox="0 0 600 600"、中心=(300, 300)
  // R_OUTER: 外枠木枠ギリギリの最外周溝 = 285px (直径570pxの最大円！)
  // R_POCKET: 赤黒の角形ポケット内 = 151px
  const R_OUTER=285;
  const R_POCKET=151;
  const targetAngle=wheelAngle(targetIndex);

  const startAngle=lastLandedIndex!==null?wheelAngle(lastLandedIndex):((targetAngle+180)%360);
  const angleStep=360/wheelGame.options.length;
  // 適度で優雅な速度感：4周
  const totalRounds=4.0;
  const deltaNeeded=((targetAngle-(startAngle%360)+360)%360);
  const totalDeltaAngle=totalRounds*360+deltaNeeded;

  const duration=2000; // 回転時間を従来の半分に短縮
  const startTime=performance.now();
  let lastSector=-1;
  let bounceSoundPlayed=false;

  ballGroup.style.display='block';

  function setBallPos(angleDeg,radius){
    const rad=angleDeg*Math.PI/180;
    const cx=300+radius*Math.sin(rad);
    const cy=300-radius*Math.cos(rad);
    ball.setAttribute('cx',cx.toFixed(1));
    ball.setAttribute('cy',cy.toFixed(1));
    if(shadow){
      shadow.setAttribute('cx',(cx+2).toFixed(1));
      shadow.setAttribute('cy',(cy+3).toFixed(1));
    }
  }

  function frame(now){
    const elapsed=now-startTime;
    const p=Math.min(1,elapsed/duration);

    // Easing: カジノルーレット物理減速（初速が速すぎず、滑らかに減速）
    const easeOut=1-Math.pow(1-p,2.3);
    const currentAngle=startAngle+totalDeltaAngle*easeOut;

    // 【外枠いっぱいに回る！】
    // フェーズ1 (0% 〜 54% / 約2.2秒): 外枠木枠ギリギリの最外周 (R_OUTER = 285px) で大きな真円を心地よく周回！
    // フェーズ2 (54% 〜 86% / 約1.3秒): 滑らかに少しずつ内側へ螺旋降下 (285px -> 151px)
    // フェーズ3 (86% 〜 100% / 約0.5秒): ポケットに着地し、仕切り（フレット）を跳ねて収まる！
    let currentR;
    if(p<0.54){
      currentR=R_OUTER;
    }else if(p<0.86){
      const spiralP=(p-0.54)/0.32;
      const smoothDrop=(1-Math.cos(spiralP*Math.PI))/2;
      currentR=R_OUTER-(R_OUTER-R_POCKET)*smoothDrop;
    }else{
      const bounceP=(p-0.86)/0.14;
      const bounceDamp=Math.exp(-3.5*bounceP);
      const bounceWave=Math.abs(Math.sin(bounceP*Math.PI*2.5));
      currentR=R_POCKET+14*bounceDamp*bounceWave;

      if(!bounceSoundPlayed){
        bounceSoundPlayed=true;
        ballBounceSound();
        if(navigator.vibrate)navigator.vibrate(25);
      }
    }

    const sector=Math.floor((currentAngle-angleStep/2)/angleStep);
    if(sector!==lastSector){
      lastSector=sector;
      const speedRatio=1-easeOut;
      ballClickSound(speedRatio);
      if(navigator.vibrate&&p<0.7)navigator.vibrate(8);
    }

    setBallPos(currentAngle,currentR);

    if(p<1){
      ballAnimId=raf(frame);
    }else{
      ballAnimId=null;
      setBallPos(targetAngle,R_POCKET);
      lastLandedIndex=targetIndex;
      ballDropSound();
      onComplete();
    }
  }

  ballAnimId=raf(frame);
}

function chooseWheel(index){
  if(spinning||wheelGame.answered)return;
  unlockAudioFromGesture().then(()=>ballClickSound(0.9));
  const target=wheelQuestion();
  const choice=wheelGame.options[index];
  const correctIndex=wheelGame.options.findIndex(w=>w.id===target.id);

  wheelGame.chosen=index;
  spinning=true;
  wheelGame.spinning=true;
  persistWheelGame();
  home();

  launchBallToPocket(correctIndex,()=>{
    spinning=false;
    wheelGame.spinning=false;
    wheelGame.answered=true;
    const correct=choice.id===target.id;
    state.questionCount++;
    if(correct){
      wheelGame.correct++;
      state.requeue=state.requeue.filter(x=>x.id!==target.id);
      playWinFanfare();
      navigator.vibrate?.([80,35,80]);
    }else{
      state.requeue=state.requeue.filter(x=>x.id!==target.id);
      state.requeue.push({id:target.id,due:state.questionCount+5+Math.floor(Math.random()*6)});
      playLoseTone();
      navigator.vibrate?.([25,60,25]);
    }
    state.records[target.id]=review(state.records[target.id],correct);
    state.days[dayKey()]=today()+1;
    save();
    persistWheelGame();
    home();
  });
}

function nextWheel(){
  if(wheelGame.index===4)return wheelFinish();
  wheelGame.index++;
  wheelGame.options=null;
  wheelGame.answered=false;
  wheelGame.chosen=null;
  wheelGame.spinning=false;
  persistWheelGame();
  lastLandedIndex=null;
  home();
}

function wheelFinish(){
  wheelGame.finished=true;persistWheelGame();
  const score=wheelGame.correct,xp=score*20+(score===5?50:0);
  show(`<main class="reveal final"><p class="overline">5 SPINS COMPLETE</p><div class="medal">${score===5?'👑':score>=3?'🏆':'🌱'}</div><h1>${score===5?'PERFECT!':score>=3?'GREAT SPIN!':'NICE TRY!'}</h1><p>選んだ言葉が、またひとつ力になった。</p><section><div><small>SCORE</small><b>${score}<i>/5</i></b></div><div><small>REWARD</small><b>+${xp}<i> XP</i></b></div></section><button class="gold" data-action="restart-wheel">もう5問挑戦 ⟳</button><button class="ghost" data-page="words">覚えた単語を見る</button></main>`,'night');
}

function reveal(){
  const g=genres[selected];
  show(`<main class="reveal" style="--accent:${g.color}"><p class="overline">THE WHEEL HAS SPOKEN</p><div class="genre-icon">${g.icon}</div><p>今日のジャンルは</p><h1>${g.name}</h1><h2>${g.jp}の英単語</h2><div class="dots">● ● ● ● ●</div><p class="sub">5問チャレンジ · 約1分</p><button class="gold" data-action="begin">挑戦をはじめる →</button><button class="ghost" data-page="home">もう一度回す</button></main>`,'night');
}

function begin(){
  const pool=selected===7?words:words.filter((_,i)=>i%7===selected%7);
  session={genre:genres[selected],questions:shuffle(pool.length>=5?pool:words).slice(0,5),index:0,correct:0,answered:false};
  page='quiz';
  quiz();
}

function quiz(){
  if(session.index===5)return finish();
  const w=session.questions[session.index];
  session.options??=shuffle([w.meaning,...shuffle(words.filter(x=>x.id!==w.id)).slice(0,3).map(x=>x.meaning)]);
  show(`<main class="quiz" style="--accent:${session.genre.color}"><header><button data-action="quit">${icon('close')}</button><div><span>${session.genre.icon} ${session.genre.name}</span><i><b style="width:${session.index*20}%"></b></i></div><strong>${session.index+1}<small>/5</small></strong></header><article><p class="overline">WHAT DOES THIS WORD MEAN?</p><div class="word"><h1>${w.word}</h1><button data-action="speak">${icon('sound')}</button></div><p class="ipa">${w.ipa}</p><div class="answers">${session.options.map((o,i)=>{const c=session.answered?(o===w.meaning?'correct':i===session.choice?'wrong':''):'';return `<button data-choice="${i}" class="${c}" ${session.answered?'disabled':''}><span>${'ABCD'[i]}</span>${o}<b>${c==='correct'?'✓':c==='wrong'?'×':''}</b></button>`}).join('')}</div>${session.answered?`<div class="note ${session.options[session.choice]===w.meaning?'good':'retry'}"><b>${session.options[session.choice]===w.meaning?'NICE! 正解':'もう一歩！'}</b><p>${w.example}<small>${w.translation}</small></p></div><button class="next" data-action="next">${session.index===4?'結果を見る':'次の問題'} →</button>`:'<p class="tap">答えをひとつ選んでください</p>'}</article></main>`,'quiz-shell');
}

function choose(i){
  if(session.answered)return;
  const w=session.questions[session.index],ok=session.options[i]===w.meaning;
  session.choice=i;
  session.answered=true;
  if(ok)session.correct++;
  state.records[w.id]=review(state.records[w.id],ok);
  state.days[dayKey()]=today()+1;
  save();
  navigator.vibrate?.(ok?40:[25,25,25]);
  quiz();
}

function next(){session.index++;session.options=null;session.answered=false;quiz()}
function finish(){const xp=session.correct*20+(session.correct===5?50:0);show(`<main class="reveal final"><p class="overline">CHALLENGE COMPLETE</p><div class="medal">${session.correct===5?'👑':session.correct>=3?'🏆':'🌱'}</div><h1>${session.correct===5?'PERFECT!':session.correct>=3?'GREAT SPIN!':'NICE TRY!'}</h1><p>今日の言葉が、またひとつ力になった。</p><section><div><small>SCORE</small><b>${session.correct}<i>/5</i></b></div><div><small>REWARD</small><b>+${xp}<i> XP</i></b></div></section><button class="gold" data-page="home">もう一度回す ⟳</button><button class="ghost" data-page="words">覚えた単語を見る</button></main>`,'night')}
function wordPage(){page='words';show(`<main class="plain"><header class="wordbook-header"><button class="back-button" data-page="home">← ホームへ戻る</button><p>WORD COLLECTION</p><h1>出会った言葉たち。</h1><small>${Object.keys(state.records).length} / ${words.length} WORDS</small></header><div class="word-list">${words.map(w=>`<article class="${state.records[w.id]?'seen':''}"><div class="wordbook-entry"><div class="study-heading"><h2>${esc(w.word)}</h2><button class="example-audio" data-example="${w.id}" aria-label="${esc(w.word)}の例文を聞く">${icon('sound')}<span>例文を聞く</span></button></div><p>${esc(w.meaning)}</p><details class="wordbook-detail"><summary>例文・発音記号</summary><p class="study-pronunciation">${esc(w.ipa)} · ${esc(w.pos)}</p><p class="study-example" lang="en">${esc(w.example)}</p><p class="study-translation">${esc(w.translation)}</p></details></div><button data-word="${w.id}" aria-label="${esc(w.word)}の発音を聞く">${icon('sound')}</button></article>`).join('')}</div></main>`)}
function stats(){page='stats';const learned=Object.values(state.records).filter(r=>r.level>=2).length,week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return [d.toLocaleDateString('ja-JP',{weekday:'short'}),state.days[dayKey(d)]||0]}),max=Math.max(5,...week.map(x=>x[1]));show(`<main class="plain"><header><button class="back-button" data-page="home">← ホームへ戻る</button><h1>挑戦の記録。</h1><small>KEEP THE FIRE ALIVE</small></header><div class="stats"><div>🔥<b>${streak()}<small>日</small></b><p>連続学習</p></div><div>⚡<b>${total()*10}<small>XP</small></b><p>累計XP</p></div><div>✦<b>${learned}<small>語</small></b><p>習得済み</p></div></div><section class="week"><h2>今週の挑戦</h2><div>${week.map(x=>`<span><b>${x[1]}</b><i><em style="height:${Math.max(5,x[1]/max*100)}%"></em></i><small>${x[0]}</small></span>`).join('')}</div></section></main>`,'stats-shell')}
function speak(w,kind='word'){if(!sound||!w)return;audio??=createPronunciationPlayer({onError:toast});audio.play({text:kind==='example'?w.example:w.word,src:`/audio/${w.id}-${kind}.mp3`})}

async function submitAuth(event){event.preventDefault();const form=event.currentTarget,button=form.querySelector('button[type="submit"]'),error=form.querySelector('#auth-error');button.disabled=true;button.textContent='処理中…';error.textContent='';try{const values=Object.fromEntries(new FormData(form));const response=await fetch('/api/'+authMode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});const result=await response.json();if(!response.ok)throw Error(result.error||'ログインできませんでした');account=result.user;state={records:{},days:{},bookmarks:[],goal:5,requeue:[],questionCount:0,...result.data};wheelGame=null;modal=null;renderCurrent();toast(authMode==='signup'?'アカウントを作成しました':'ログインしました')}catch(e){error.textContent=e.message||'接続を確認してください';button.disabled=false;button.textContent=authMode==='signup'?'アカウントを作成':'ログイン'}}
async function signout(){await saveQueue;try{const response=await fetch('/api/signout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!response.ok)throw Error();account=null;let guest;try{guest=JSON.parse(localStorage.getItem('kioku-v1'))}catch{}state={records:{},days:{},bookmarks:[],goal:5,...guest};wheelGame=null;modal=null;renderCurrent();toast('ログアウトしました')}catch{toast('ログアウトできませんでした')}}
async function initializeAuth(){try{const response=await fetch('/api/me');if(!response.ok)return;const result=await response.json();account=result.user;if(account){const dataResponse=await fetch('/api/data');if(dataResponse.ok)state={records:{},days:{},bookmarks:[],goal:5,requeue:[],questionCount:0,...(await dataResponse.json()).data};renderCurrent()}}catch{}}

function bind(){
  const form=document.querySelector('#auth-form');
  if(form)form.onsubmit=submitAuth;
  document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{modal=null;({home,words:wordPage,stats}[b.dataset.page]||home)()});
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{
    const a=b.dataset.action;
    if(a==='begin')begin();
    if(a==='next')next();
    if(a==='next-wheel')nextWheel();
    if(a==='restart-wheel'){wheelGame=null;lastLandedIndex=null;home()}
    if(a==='account'){modal='account';renderCurrent()}
    if(a==='close-modal'){modal=null;renderCurrent()}
    if(a==='toggle-auth'){authMode=authMode==='signin'?'signup':'signin';renderCurrent()}
    if(a==='signout')signout();
    if(a==='quit')home();
    if(a==='speak')speak(session.questions[session.index]);
    if(a==='sound'){sound=!sound;audio?.stop();if(sound)unlockAudioFromGesture().then(()=>ballClickSound(0.6));else audioCtx?.suspend?.();home()}
  });
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(+b.dataset.choice));
  document.querySelectorAll('[data-wheel-choice]').forEach(b=>{
    b.onpointerdown=unlockAudioFromGesture;
    b.onclick=()=>chooseWheel(+b.dataset.wheelChoice);
  });
  document.querySelectorAll('[data-card-choice]').forEach(b=>{
    b.onpointerdown=unlockAudioFromGesture;
    b.onclick=()=>chooseWheel(+b.dataset.cardChoice);
  });
  document.querySelectorAll('[data-wheel-speak]').forEach(b=>b.onclick=()=>speak(words.find(w=>w.id===b.dataset.wheelSpeak)));
  document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>speak(words.find(w=>w.id===b.dataset.word)));
  document.querySelectorAll('[data-example]').forEach(b=>b.onclick=()=>speak(words.find(w=>w.id===b.dataset.example),'example'));
}

const resumeWheelSpin=!!wheelGame?.spinning;
if(wheelGame?.finished)wheelFinish();else home();
if(resumeWheelSpin&&wheelGame&&!wheelGame.answered){const resumeChoice=wheelGame.chosen;spinning=false;wheelGame.spinning=false;chooseWheel(Number.isInteger(resumeChoice)?resumeChoice:0)}
initializeAuth();
