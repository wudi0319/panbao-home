// 保卫胖宝 — 游戏数据（武器 / 天赋 / 建筑 / 敌人 / 地图 / 每晚的敌人）
const DOGS={yellow:{name:'鸡毛',ic:'🐶'},white:{name:'小白',ic:'🐩'}};
const WEAPONS={
 spatula:{name:'锅铲',ic:'🍳',desc:'近战拍拍，出手快',kind:'melee',range:1.5,dmg:20,cd:.45,maxHit:3,
  skill:{name:'旋风锅铲',cd:9,desc:'转圈拍飞身边所有敌人'}},
 frisbee:{name:'飞盘',ic:'🥏',desc:'远程扔飞盘',kind:'ranged',range:5.5,dmg:15,cd:.6,
  skill:{name:'满天飞盘',cd:10,desc:'向四周扔出 10 个飞盘'}},
 bone:{name:'骨头棒槌',ic:'🦴',desc:'慢，但一下砸一片',kind:'area',range:2.1,dmg:42,cd:1.2,
  skill:{name:'震地一击',cd:12,desc:'大范围重击并晕住敌人'},unlock:'win'}};
const TALENTS={
 piggy:{name:'存钱罐',ic:'🐷',desc:'开局 +10 金币，早上收入 +30%'},
 pets:{name:'小动物加油',ic:'💪',desc:'小猫小鸭血量和攻击 +35%'},
 tough:{name:'结实身体',ic:'❤️',desc:'自己血量 +60%'},
 stone:{name:'坚固的家',ic:'🏠',desc:'家和城墙血量 +50%',unlock:'n3'},
 wolfy:{name:'挑战：狼来了',ic:'🐺',desc:'敌人更多（+30%）、血量 +60%、攻击 +25%，金币 ×1.25',challenge:1,unlock:'n3'}};
// 建筑每级数值（下标 0 = 1级）
const BUILD={
 wall:{name:'城墙',ic:'🧱',cost:[3,6,12],hp:[150,300,520]},
 tower:{name:'弹弓塔',ic:'🏹',cost:[8,14,22],hp:[80,140,220],dmg:[8,13,20],range:[5,5.6,6.2],cd:[.9,.75,.6]},
 cats:{name:'小猫营',ic:'🐱',cost:[8,14,22],hp:[120,200,300],n:[2,3,4],unit:'kitten'},
 ducks:{name:'小鸭营',ic:'🐤',cost:[8,14,22],hp:[120,200,300],n:[2,3,4],unit:'duck'},
 farm:{name:'菜园',ic:'🥕',cost:[5,10,16],hp:[60,90,130],gold:[3,5,8]}};
const UNITS={
 kitten:{name:'小猫',hp:45,dmg:7,range:.8,cd:.7,spd:3.2,r:.3},
 duck:{name:'小鸭',hp:30,dmg:6,range:3.5,cd:1,spd:3,r:.28}};
const ENEMIES={
 raccoon:{name:'小偷浣熊',hp:20,spd:1.6,dmg:4,cd:.8,gold:1,r:.35,aggro:2},
 wolf:{name:'大灰狼',hp:46,spd:1.3,dmg:8,cd:1,gold:2,r:.45,aggro:2.6},
 bear:{name:'大笨熊',hp:170,spd:.8,dmg:20,cd:1.4,gold:6,r:.65,aggro:1.6,smash:1},
 boss:{name:'熊大王',hp:1000,spd:.7,dmg:34,cd:1.5,gold:30,r:.95,aggro:2,smash:1}};
// 墙段几何：segs = [{x,y,len,v,gate}]，gate 为门洞半宽（0 表示没门）
const WALL_HT=.4,GATE_W=1.15;
function segsOf(s){return s.segs||[{x:s.x,y:s.y,len:s.len||5.4,v:!!s.v,gate:s.gate||0}]}
function mkGate(id,x,y,v){return{id,t:'wall',kind:'gate',x,y,v,segs:[{x,y,len:4.4,v,gate:GATE_W}]}}
function mkCorner(id,cx,cy,sx,sy){const arm=4.05,m=arm/2;return{id,t:'wall',kind:'corner',x:cx+sx*1.15,y:cy+sy*1.15,segs:[{x:cx+sx*m,y:cy,len:arm,v:0,gate:0},{x:cx,y:cy+sy*m,len:arm,v:1,gate:0}]}}
function mkWall(id,x,y,len,v,gate){return{id,t:'wall',kind:gate?'gate':'wall',x,y,v,segs:[{x,y,len,v,gate:gate||0}]}}
function bName(s){return s.t==='wall'&&s.kind==='gate'?'城门':BUILD[s.t].name}
// 核心一圈：11..23 的方环，四边路中央是门，四角是 L 形墙，接缝重叠，围起来没有缝
function coreRing(){return[
 mkGate('wN',17,11,0),mkGate('wS',17,23,0),mkGate('wW',11,17,1),mkGate('wE',23,17,1),
 mkCorner('wNW',11,11,1,1),mkCorner('wNE',23,11,-1,1),mkCorner('wSW',11,23,1,-1),mkCorner('wSE',23,23,-1,-1)
]}
function coreBuildings(){return[
 {id:'t1',t:'tower',x:15,y:13},{id:'t2',t:'tower',x:19,y:21},{id:'t3',t:'tower',x:13,y:19},{id:'t4',t:'tower',x:21,y:15},
 {id:'bC',t:'cats',x:19.6,y:13.6},{id:'bD',t:'ducks',x:14.4,y:20.4},
 {id:'f1',t:'farm',x:13.6,y:15},{id:'f2',t:'farm',x:20.4,y:19},{id:'f3',t:'farm',x:8,y:26},{id:'f4',t:'farm',x:26,y:8}
]}
const MAPS={
 yard:{id:'yard',name:'胖宝的院子',ic:'🏡',desc:'围墙能连成一圈，四边路上各有一座城门',
  unlock:null,w:34,h:34,gold:15,nights:7,home:{x:17,y:17,r:1.4},spots:[...coreRing(),...coreBuildings()]},
 barbican:{id:'barbican',name:'瓮城',ic:'🏯',desc:'南门外加一圈瓮城，大门错开；西南菜园单独围起来',
  unlock:'win',w:34,h:34,gold:18,nights:7,home:{x:17,y:17,r:1.4},spots:[
   ...coreRing(),...coreBuildings(),
   // 南瓮城：外墙在 y=28.5，门开在东侧，不对准南路
   mkWall('wBW',11,25.85,5.7,1,0),mkWall('wBE',23,25.85,5.7,1,0),
   mkWall('wBSW',14.8,28.5,7.6,0,0),mkWall('wBSE',20.7,28.5,4.6,0,GATE_W),
   // 西南菜园小围栏，东门朝家
   mkWall('pN',8.15,23.5,5.3,0,0),mkWall('pW',5.5,26.05,5.1,1,0),mkWall('pS',8.15,28.6,5.3,0,0),mkWall('pE',10.8,26.05,5.1,1,GATE_W)
  ]}
};
let MAP=null,MAP_W=34,MAP_H=34,HOME={x:17,y:17,r:1.4},SPOTS=[],NIGHTS=7,DIRS={};
function refreshDirs(){DIRS={N:{x:HOME.x,y:-.5,cn:'北'},S:{x:HOME.x,y:MAP_H+.5,cn:'南'},W:{x:-.5,y:HOME.y,cn:'西'},E:{x:MAP_W+.5,y:HOME.y,cn:'东'}}}
function useMap(id){MAP=MAPS[id]||MAPS.yard;MAP_W=MAP.w;MAP_H=MAP.h;HOME=MAP.home;SPOTS=MAP.spots;NIGHTS=MAP.nights||7;refreshDirs();return MAP}
useMap('yard');
function nightDirs(n){return[['S'],['S','E'],['S','E','W'],['N','S','E','W'],['N','S','E','W'],['N','S','E','W'],['N','S','E','W']][n-1]}
// 第 n 晚的出怪表：[{t 秒, dir, k}]
function waveFor(n,cm=1){const dirs=nightDirs(n),out=[],dur=22+n*5;
 const add=(k,c0,t0=0,t1=dur)=>{const cnt=k==='boss'?c0:Math.round(c0*cm);for(let i=0;i<cnt;i++)out.push({t:t0+(t1-t0)*(cnt>1?i/(cnt-1):.5)+Math.random()*1.5,dir:dirs[(i+out.length)%dirs.length],k})};
 add('raccoon',4+n*2);if(n>=2)add('wolf',n*2-1,4);if(n>=3)add('bear',n-2,8);if(n===NIGHTS)add('boss',1,dur*.6,dur*.6);
 return out.sort((a,b)=>a.t-b.t)}
