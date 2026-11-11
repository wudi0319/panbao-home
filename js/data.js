// 保卫胖宝 — 游戏数据（武器 / 天赋 / 建筑 / 敌人 / 地图 / 每晚的敌人）
const MAP_W=34,MAP_H=34,HOME={x:17,y:17,r:1.4};
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
 wolfy:{name:'挑战：狼来了',ic:'🐺',desc:'敌人血量 +70%，掉落金币 ×1.5',challenge:1,unlock:'n3'}};
// 建筑每级数值（下标 0 = 1级）
const BUILD={
 wall:{name:'城墙',ic:'🧱',cost:[4,8,14],hp:[150,300,520]},
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
// 固定建造点：type 固定（像王权陨落）；wall 带方向 v=竖
const SPOTS=[
 {id:'wN',t:'wall',x:17,y:11,v:0},{id:'wS',t:'wall',x:17,y:23,v:0},{id:'wW',t:'wall',x:11,y:17,v:1},{id:'wE',t:'wall',x:23,y:17,v:1},
 {id:'t1',t:'tower',x:15,y:13},{id:'t2',t:'tower',x:19,y:21},{id:'t3',t:'tower',x:13,y:19},{id:'t4',t:'tower',x:21,y:15},
 {id:'bC',t:'cats',x:19.6,y:13.6},{id:'bD',t:'ducks',x:14.4,y:20.4},
 {id:'f1',t:'farm',x:13.6,y:15},{id:'f2',t:'farm',x:20.4,y:19},{id:'f3',t:'farm',x:8,y:26},{id:'f4',t:'farm',x:26,y:8}];
const DIRS={N:{x:17,y:-.5,cn:'北'},S:{x:17,y:MAP_H+.5,cn:'南'},W:{x:-.5,y:17,cn:'西'},E:{x:MAP_W+.5,y:17,cn:'东'}};
const NIGHTS=7;
function nightDirs(n){return[['S'],['S','E'],['S','E','W'],['N','S','E','W'],['N','S','E','W'],['N','S','E','W'],['N','S','E','W']][n-1]}
// 第 n 晚的出怪表：[{t 秒, dir, k}]
function waveFor(n){const dirs=nightDirs(n),out=[],dur=22+n*5;
 const add=(k,cnt,t0=0,t1=dur)=>{for(let i=0;i<cnt;i++)out.push({t:t0+(t1-t0)*(cnt>1?i/(cnt-1):.5)+Math.random()*1.5,dir:dirs[(i+out.length)%dirs.length],k})};
 add('raccoon',4+n*2);if(n>=2)add('wolf',n*2-1,4);if(n>=3)add('bear',n-2,8);if(n===NIGHTS)add('boss',1,dur*.6,dur*.6);
 return out.sort((a,b)=>a.t-b.t)}
