// 保卫胖宝 — 界面：开始选择、HUD、按钮、摇杆和键盘
const $=id=>document.getElementById(id);
const sel={dog:'yellow',weapon:'spatula',talents:[],map:'yard'};
const unlocked=(u,r)=>$('unlockAll').checked||!u||(u==='win'?r.wins>0:u==='n3'?r.best>=3:true);
const unlockText=u=>u==='win'?'通关后解锁':'守过第 3 夜解锁';
function drawDogIcons(){document.querySelectorAll('#pickDog canvas').forEach(c=>{const x=c.getContext('2d');x.clearRect(0,0,96,96);x.save();x.scale(96,96);S.puppy(x,0,0,false,c.parentNode.dataset.dog);x.restore()})}
function renderStart(){const r=Game.loadRec();
 $('pickWeapon').innerHTML=Object.entries(WEAPONS).map(([k,w])=>{const ok=unlocked(w.unlock,r);if(!ok&&sel.weapon===k)sel.weapon='spatula';
  return`<button data-w="${k}" class="${sel.weapon===k?'on':''} ${ok?'':'lock'}">${w.ic} ${w.name}<small>${ok?w.desc:'🔒 '+unlockText(w.unlock)}</small></button>`}).join('');
 const all=$('unlockAll').checked;if(!mapUnlocked(r,sel.map,all))sel.map='yard';
 $('pickMap').innerHTML=MAP_ORDER.map(id=>{const m=MAPS[id],ok=mapUnlocked(r,id,all),cleared=mapCleared(r,id),n=MAP_ORDER.indexOf(id)+1;
  return`<button data-map="${m.id}" class="${sel.map===m.id?'on':''} ${ok?'':'lock'} ${cleared?'cleared':''}">${m.ic} ${m.name}<small>${ok?(cleared?'★ 已通关':'第 '+n+' 关'):'🔒 先通关上一关'}</small></button>`}).join('');
 const sm=MAPS[sel.map];$('mapDesc').textContent=sm?(sm.ic+' '+sm.desc):'';
 sel.talents=sel.talents.filter(k=>unlocked(TALENTS[k].unlock,r));
 $('pickTalent').innerHTML=Object.entries(TALENTS).map(([k,t])=>{const ok=unlocked(t.unlock,r);
  return`<button data-t="${k}" class="${sel.talents.includes(k)?'on':''} ${ok?'':'lock'} ${t.challenge?'ch':''}">${t.ic} ${t.name}<small>${ok?t.desc:'🔒 '+unlockText(t.unlock)}</small></button>`}).join('');
 document.querySelectorAll('#pickDog button').forEach(b=>b.classList.toggle('on',b.dataset.dog===sel.dog));
 const nClear=MAP_ORDER.filter(id=>mapCleared(r,id)).length;
 $('rec').textContent=r.best||r.wins?`最好成绩：守住 ${r.best} 夜 · 通关 ${r.wins} 次 · 已过 ${nClear}/${MAP_ORDER.length} 关`:'';drawDogIcons()}
$('pickDog').onclick=e=>{const b=e.target.closest('button');if(!b)return;sel.dog=b.dataset.dog;renderStart()};
$('pickWeapon').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.classList.contains('lock'))return toast('还没解锁哦');sel.weapon=b.dataset.w;renderStart()};
$('pickMap').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.classList.contains('lock'))return toast('还没解锁哦');sel.map=b.dataset.map;renderStart()};
$('pickTalent').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.classList.contains('lock'))return toast('还没解锁哦');const k=b.dataset.t,i=sel.talents.indexOf(k);
 if(i>=0)sel.talents.splice(i,1);else{if(sel.talents.length>=2)sel.talents.shift();sel.talents.push(k)}renderStart()};
$('unlockAll').onchange=renderStart;
$('goBtn').onclick=()=>{Game.newGame(sel);paused=false;$('pause').classList.add('hidden');$('start').classList.add('hidden');$('end').classList.add('hidden');$('hMe').textContent=DOGS[sel.dog].ic;tut.start();SFX.play('click');measure()};
$('againBtn').onclick=()=>{SFX.play('click');$('end').classList.add('hidden');renderStart();$('start').classList.remove('hidden')};
let toastT;function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400)}
Game.hooks.toast=toast;Game.hooks.sfx=k=>SFX.play(k);Game.hooks.coin=()=>{const g=$('hGold');g.classList.remove('bump');void g.offsetWidth;g.classList.add('bump')};
Game.hooks.end=(win,was,r)=>{const G=Game.G;$('endIcon').textContent=win?'🏆':'😭';$('endTitle').textContent=win?'胖宝安全啦！':'家被攻破了…';
 $('endText').textContent=win?`守住了全部 ${NIGHTS} 个晚上，打倒 ${G.stats.kills} 个敌人！`:`守住了 ${G.night} 夜，打倒 ${G.stats.kills} 个敌人。再试一次吧！`;
 const nu=[];if(r.wins>0&&!(was.wins>0))nu.push('🦴 骨头棒槌');if(r.best>=3&&!(was.best>=3))nu.push('🏠 坚固的家','🐺 挑战：狼来了');
 const mid=G.map||'yard',ix=MAP_ORDER.indexOf(mid);if(win&&ix>=0&&ix<MAP_ORDER.length-1){const wasClear=was.maps&&was.maps[mid]&&was.maps[mid].wins>0;if(!wasClear){const nxt=MAPS[MAP_ORDER[ix+1]];nu.push(nxt.ic+' '+nxt.name)}}
 $('endUnlock').textContent=nu.length?'新解锁：'+nu.join('、'):'';setTimeout(()=>$('end').classList.remove('hidden'),600)};
// ---- 按钮 ----
const me=()=>Game.G&&Game.G.players[Game.G.me];
const tap=(id,fn)=>$(id).addEventListener('click',e=>{e.preventDefault();fn()});
tap('buildBtn',()=>{const p=me();if(p&&Game.build(p.id))tut.on('build')});
tap('nightBtn',()=>{Game.startNight();tut.on('night')});
tap('skillBtn',()=>{const p=me();if(p&&p.skillCd<=0&&Game.skill(p.id))tut.on('skill')});
tap('followBtn',()=>{const p=me();if(p)Game.armyFollow(p.id)});tap('deployBtn',()=>{const p=me();if(p)Game.armyDeploy(p.id)});
// ---- 暂停 / 音效 ----
let paused=false;
function setPause(v){const G=Game.G;if(!G||!$('start').classList.contains('hidden')||G.phase==='win'||G.phase==='lose')v=false;paused=v;$('pause').classList.toggle('hidden',!v);jv={x:0,y:0};knob.style.transform='';keys.clear()}
function muteLabel(){$('muteBtn').textContent=SFX.muted?'🔇 音效：关':'🔊 音效：开';$('pauseBtn').dataset.m=SFX.muted?'1':''}
tap('pauseBtn',()=>{SFX.play('click');setPause(!paused)});tap('resumeBtn',()=>{SFX.play('click');setPause(false)});
tap('muteBtn',()=>{SFX.setMuted(!SFX.muted);muteLabel();SFX.play('click')});
tap('quitBtn',()=>{setPause(false);Game.G.phase='lose';$('end').classList.add('hidden');renderStart();$('start').classList.remove('hidden')});
muteLabel();
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true)});
// ---- 摇杆：左半屏任意位置按下都能出摇杆（浮动摇杆），键盘 WASD ----
const joy=$('joy'),knob=$('knob'),stage=$('stage');let jv={x:0,y:0},jid=null;const keys=new Set();
function joyMove(e){const r=joy.getBoundingClientRect(),dx0=e.clientX-(r.left+r.width/2),dy0=e.clientY-(r.top+r.height/2),m=Math.hypot(dx0,dy0),R=r.width/2-10;
 const k=m>R?R/m:1;knob.style.transform=`translate(${dx0*k}px,${dy0*k}px)`;const n=m<4?0:Math.min(1,m/R*1.15);jv=n===0?{x:0,y:0}:{x:dx0/m*n,y:dy0/m*n};tut.on('move')}
function joyStart(e,float){if(jid!==null||paused)return;jid=e.pointerId;if(float){joy.classList.add('float');joy.style.left=(e.clientX-joy.offsetWidth/2)+'px';joy.style.top=(e.clientY-joy.offsetHeight/2)+'px';joy.style.bottom='auto'}
 try{(float?$('map'):joy).setPointerCapture(jid)}catch(_){}joyMove(e)}
const joyEnd=e=>{if(e.pointerId!==jid)return;jid=null;jv={x:0,y:0};knob.style.transform='';joy.classList.remove('float');joy.style.left=joy.style.top=joy.style.bottom=''};
joy.addEventListener('pointerdown',e=>{e.preventDefault();joyStart(e,false)});
$('map').addEventListener('pointerdown',e=>{const m=Game.view.mm;if(Game.G&&e.clientX>=m.x-4&&e.clientX<=m.x+m.s+4&&e.clientY>=m.y-4&&e.clientY<=m.y+m.s+4){m.big=!m.big;SFX.play('click');return}
 if(e.clientX<innerWidth*.5&&e.clientY>gview().top+10)joyStart(e,true)});
for(const el of[joy,$('map')]){el.addEventListener('pointermove',e=>{if(e.pointerId===jid)joyMove(e)});el.addEventListener('pointerup',joyEnd);el.addEventListener('pointercancel',joyEnd)}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='p'||k==='escape'){if(!e.repeat)setPause(!paused);return}if(paused)return;keys.add(k);if(e.repeat)return;
 if(['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown'].includes(k))tut.on('move');
 if(k==='e'||k==='enter')$('buildBtn').classList.contains('hidden')||$('buildBtn').click();
 if(k===' '){e.preventDefault();$('skillBtn').classList.contains('hidden')||$('skillBtn').click()}
 if(k==='n')$('nightBtn').classList.contains('hidden')||$('nightBtn').click();if(k==='f'){const p=me();if(p&&Game.G.units.length)Game.toggleArmy(p.id)}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
function readInput(){let x=jv.x,y=jv.y;if(keys.has('a')||keys.has('arrowleft'))x-=1;if(keys.has('d')||keys.has('arrowright'))x+=1;if(keys.has('w')||keys.has('arrowup'))y-=1;if(keys.has('s')||keys.has('arrowdown'))y+=1;
 const m=Math.hypot(x,y);return m>1?{x:x/m,y:y/m}:{x,y}}
// ---- 新手引导（只在第一次玩时出现，存在手机里） ----
const TUT_KEY='panbao-tut-v1';
const tut={step:-1,start(){this.step=localStorage.getItem(TUT_KEY)?-1:0;if(this.step<0)toast('天亮了，走到虚线框旁边建造，保护胖宝！')},
 on(ev){const need=['move','build','night','skill'][this.step];if(ev!==need)return;this.step++;if(this.step>=4){this.step=-1;localStorage.setItem(TUT_KEY,'1');toast('👍 学会啦！守住 7 个晚上就赢')}},
 text(G){if(this.step<0)return'';if(this.step===2&&G.phase==='night')this.step=3;if(this.step===3&&G.phase==='day'){this.step=-1;localStorage.setItem(TUT_KEY,'1');return''}
  return['👈 按住屏幕左边拖动，就能走路（左上角是小地图）','走到闪光的虚线框旁边，点右下角「建造」','建好了！准备好就点「🌙 开始入夜」','敌人来了！靠近会自动打，点「'+WEAPONS[me().weapon].skill.name+'」放大招'][this.step]}};
function guideSpot(G,p){let best=null,bd=1e9;for(const s of SPOTS){const b=G.b[s.id],c=Game.nextCost(s);if(b.lv||c==null||c>G.gold)continue;const d=Math.hypot(s.x-p.x,s.y-p.y);if(d<bd){bd=d;best=s}}return best}
// ---- HUD（只在内容变化时改 DOM） ----
let hudMM=0;
const setT=(id,v)=>{const el=$(id);if(el._v!==v){el._v=v;el.textContent=v}};
const setH=(id,h)=>{const el=$(id);if(el._h!==h){el._h=h;el.classList.toggle('hidden',h)}};
const setW=(id,w)=>{const el=$(id);w=Math.round(w)+'%';if(el._w!==w){el._w=w;el.style.width=w;el.style.background=parseFloat(w)<30?'#ff5a5a':parseFloat(w)<60?'#ffb347':'#6fd07a'}};
function gview(){return Game.view}
function placeToast(){const h=$('hint'),hb=h.textContent?h.getBoundingClientRect().bottom:$('hud').getBoundingClientRect().bottom;stage.style.setProperty('--toastt',Math.round(hb+6)+'px');Game.view.hintB=hb}
function measure(){const h=$('hud').getBoundingClientRect(),g=$('hGold').getBoundingClientRect();Game.view.top=h.bottom;$('stage').style.setProperty('--hudb',Math.round(h.bottom)+'px');Game.view.joyTop=$('joy').getBoundingClientRect().top;placeToast();Game.view.gold={x:g.left+g.width/2,y:g.top+g.height/2}}
addEventListener('resize',()=>setTimeout(measure,50));
function hud(){const G=Game.G,p=me();if(!G||!p)return;const day=G.phase==='day';
 setT('hGold','💰 '+G.gold);setT('hNight',day?`☀️ 第 ${G.night+1} 天 · 共 ${NIGHTS} 夜`:G.phase==='night'?`🌙 第 ${G.night+1} 夜 / ${NIGHTS}`:G.phase==='win'?'🏆 通关啦':'💔 失败');
 setW('hHome',100*G.home.hp/G.home.max);setW('hHp',p.dead?0:100*p.hp/p.max);
 const s=day&&!p.dead?Game.nearSpot(p):null;
 if(s){const b=G.b[s.id],c=Game.nextCost(s);setH('buildBtn',false);setT('buildBtn',c==null?`${BUILD[s.t].ic} ${bName(s)} 已满级`:`${BUILD[s.t].ic} ${b.lv?'升级':'建造'}${bName(s)}${b.lv?' → '+(b.lv+1)+'级':''} 💰${c}`);$('buildBtn').classList.toggle('poor',c==null||G.gold<c)}else setH('buildBtn',true);
 setH('nightBtn',!day);
 const W=WEAPONS[p.weapon];setH('skillBtn',G.phase!=='night');setT('skillName',W.skill.name);setT('skillCd',p.skillCd>0?''+Math.ceil(p.skillCd):'');
 setH('armyRow',!G.units.length);$('followBtn').classList.toggle('on',G.army.mode==='follow');$('deployBtn').classList.toggle('on',G.army.mode==='deploy');
 const mm=Math.round(Game.view.mm.s)+(Game.view.mm.big?1:0);if(mm!==hudMM){hudMM=mm;const M=Game.view.mm,st=$('stage').style,wide=innerWidth-M.s>300;
  // 小地图放大时：横屏把提示放到地图右边；竖屏放到地图下面，不挡地图
  st.setProperty('--mm',(!M.big||wide?Math.round(M.s):0)+'px');st.setProperty('--hudb',Math.round(M.big&&!wide?M.y+M.s+4:$('hud').getBoundingClientRect().bottom)+'px');placeToast()}
 const tt=tut.text(G);let h=tt;
 if(!h){if(day){const tip=MAP.id==='mountain'?'沿盘山公路一层一层守，守不住就往上撤':MAP.id==='bridge'?'守住桥上的门，别让它们过河':MAP.id==='fields'?'四个菜园各自围起来':'把门建好，只有自己人能过';h=s?'点右下角按钮建造 / 升级':'今晚敌人从'+nightDirs(G.night+1).map(d=>DIRS[d].cn).join('、')+'边来 · '+tip}
  else if(G.phase==='night')h=p.dead?`${DOGS[p.dog].name}复活中… ${Math.ceil(p.respawn)}`:`敌人还剩 ${G.enemies.length+G.spawnQ.length} 个 · 靠近会自动打`;else h=''}
 if($('hint')._v!==h||$('hint').classList.contains('tut')!==!!tt){setT('hint',h);$('hint').classList.toggle('tut',!!tt);placeToast()}
 Game.view.guide=day&&(tut.step===1||tut.step===0)&&!G.night?(guideSpot(G,p)||{}).id||null:null}
// ---- 主循环 ----
let last=performance.now(),fpsN=0,fpsT=0;const showFps=/fps/.test(location.search);
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const G=Game.G;
 if(G&&!paused&&G.phase!=='win'&&G.phase!=='lose'&&$('start').classList.contains('hidden')){G.input[G.me]=readInput();Game.step(dt)}
 Game.render();hud();if(showFps){fpsN++;fpsT+=dt;if(fpsT>1){$('hint').textContent+=' · '+fpsN+'fps';fpsN=0;fpsT=0}}requestAnimationFrame(frame)}
renderStart();measure();requestAnimationFrame(frame);
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
