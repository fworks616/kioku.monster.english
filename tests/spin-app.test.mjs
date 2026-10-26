import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {words} from '../dist/words.js';
import {review,dayKey} from '../dist/learning.js';

test('Safari effects use media playback and unlock during the tap before resume completes',async()=>{
  const app={innerHTML:''},events=[],audioSession={type:'auto'};
  let contextInstance,finishResume;
  class AudioContext{
    constructor(){
      assert.equal(audioSession.type,'playback');
      this.state='suspended';this.sampleRate=48000;this.currentTime=0;this.destination={};
      contextInstance=this;
    }
    createBuffer(){return {}}
    createBufferSource(){return {connect(){},start:()=>events.push(['prime',this.state])}}
    resume(){events.push(['resume']);return new Promise(resolve=>{finishResume=()=>{this.state='running';resolve()}})}
    createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){events.push(['effect'])},stop(){}}}
    createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}
  }
  const context=vm.createContext({
    words,review,dayKey,AudioContext,navigator:{audioSession},
    localStorage:{getItem(){return null}},
    document:{querySelector(){return app},querySelectorAll(){return []}}
  });
  const source=(await readFile(new URL('../dist/spin-app.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
  vm.runInContext(source,context);
  const ready=vm.runInContext('unlockAudioFromGesture().then(()=>ballClickSound(0.9))',context);
  assert.deepEqual(events,[['prime','suspended'],['resume']]);
  finishResume();
  await ready;
  assert.deepEqual(events.at(-1),['effect']);
  contextInstance.state='closed';
  vm.runInContext('getAudioCtx()',context);
  assert.equal(contextInstance.state,'suspended');
});

test('word roulette runs a five-question challenge and saves progress',async()=>{
  const app={innerHTML:''},toast={textContent:'',classList:{add(){},remove(){}}};
  let saved;const played=[];
  const context=vm.createContext({
    words,review,dayKey,Date,JSON,Math,String,Number,Array,Object,Promise,console,
    navigator:{vibrate(){}},setTimeout(){},
    createPronunciationPlayer:()=>({play(request){played.push(request)}}),
    localStorage:{getItem(){return null},setItem(_key,value){saved=JSON.parse(value)}},
    document:{querySelector(selector){return selector==='#app'?app:toast},querySelectorAll(){return []}}
  });
  const source=(await readFile(new URL('../dist/spin-app.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
  vm.runInContext(source,context);
  assert.match(app.innerHTML,/正しい英単語をタップしよう/);
  assert.equal((app.innerHTML.match(/data-wheel-choice=/g)||[]).length,4);
  vm.runInContext("modal='account';renderCurrent()",context);
  assert.match(app.innerHTML,/id="auth-form"/);
  assert.match(app.innerHTML,/新規登録/);
  vm.runInContext("account={name:'<script>',email:'test@example.com'};renderCurrent()",context);
  assert.match(app.innerHTML,/&lt;script&gt;/);
  assert.doesNotMatch(app.innerHTML,/<h2 id="auth-title"><script>/);
  vm.runInContext("account=null;modal=null;renderCurrent()",context);
  vm.runInContext("wordPage()",context);
  assert.match(app.innerHTML,/ホームへ戻る/);
  assert.match(app.innerHTML,/data-example="p499"/);
  assert.ok(app.innerHTML.includes(words.find(w=>w.id==='p499').example));
  vm.runInContext("speak(words.find(w=>w.id==='p499'),'example')",context);
  assert.equal(played.at(-1).text,words.find(w=>w.id==='p499').example);
  assert.equal(played.at(-1).src,'/audio/p499-example.mp3');
  vm.runInContext('wheelGame.answered=true;wheelGame.chosen=0;home()',context);
  assert.match(app.innerHTML,/class="answer-study"/);
  assert.ok(app.innerHTML.includes(vm.runInContext('wheelQuestion().example',context)));
  vm.runInContext('selected=7;begin()',context);
  assert.match(app.innerHTML,/WHAT DOES THIS WORD MEAN/);
  vm.runInContext('choose(session.options.indexOf(session.questions[0].meaning))',context);
  assert.equal(saved.days[dayKey()],1);
  assert.match(app.innerHTML,/NICE! 正解/);
  vm.runInContext('for(let n=1;n<5;n++){next();choose(session.options.indexOf(session.questions[session.index].meaning))}next()',context);
  assert.match(app.innerHTML,/PERFECT!/);
  assert.equal(saved.days[dayKey()],5);
  assert.equal(Object.keys(saved.records).length,5);
});
