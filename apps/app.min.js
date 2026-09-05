(function(){
  var W=g.getWidth(),H=g.getHeight();
  var mode='introPuzzle', level=0, cols=3, rows=3, cursor=0, selected=-1, moves=0;
  var startTime=0,recoveredTime=0,image=null,fileNo=1,lastFile=0,bag=[],bagPos=0;
  var MAIN_COUNT=12, BONUS_COUNT=15, INTRO_COUNT=3, IMG_W=240, IMG_H=180, PX=118, PY=70;
  var isBonus=false, introPage=0, board=[];
  var introNames=['INTRO001','INTRO002','INTRO003'];
  function rand(n){return Math.floor(Math.random()*n)}
  function now(){return Date.now?Date.now():getTime()*1000}
  function shuffle(a){var i,j,t;for(i=a.length-1;i>0;i--){j=rand(i+1);t=a[i];a[i]=a[j];a[j]=t}return a}
  function refillBag(){bag=[];var i;for(i=1;i<=MAIN_COUNT;i++)bag.push(i);shuffle(bag);if(bag.length>1&&bag[0]===lastFile){var t=bag[0];bag[0]=bag[1];bag[1]=t}bagPos=0}
  function nextMainFile(){if(bagPos>=bag.length)refillBag();lastFile=bag[bagPos++];return lastFile}
  function nextBonusFile(){return 1+rand(BONUS_COUNT)}
  function setDifficulty(){if(level<=2){cols=3;rows=3}else if(level<=4){cols=4;rows=3}else if(level<=7){cols=4;rows=4}else{cols=5;rows=4}}
  function cellW(){return Math.floor(IMG_W/cols)}
  function cellH(){return Math.floor(IMG_H/rows)}
  function solved(){var i;for(i=0;i<board.length;i++)if(board[i]!==i)return false;return true}
  function shuffleBoard(){var n=cols*rows,i,j,t;board=[];for(i=0;i<n;i++)board[i]=i;do{for(i=n-1;i>0;i--){j=rand(i+1);t=board[i];board[i]=board[j];board[j]=t}}while(solved())}
  function fg(){return g.theme&&g.theme.fg!==undefined?g.theme.fg:1}
  function bg(){return g.theme&&g.theme.bg!==undefined?g.theme.bg:0}
  function text(s,x,y,f,a){g.setColor(fg()).setFont(f||'Monofonto16').setFontAlign(a===undefined?-1:a,-1).drawString(s,x,y)}
  function clear(){g.setColor(bg()).clear()}
  function header(){g.setColor(fg()).fillRect(38,0,438,38);g.setColor(bg()).setFont('Monofonto23').setFontAlign(-1,-1).drawString('PROJECT: RECOVERY',46,5);g.setFont('Monofonto16').drawString(mode==='bonusIntro'||isBonus?'BONUS ARCHIVE // PERSONAL':mode==='hackSuccess'?'SECURITY OVERRIDE':'VISUAL DATA RESTORATION',46,26)}
  function loadStorage(name){try{return require('Storage').read(name)}catch(e){return null}}
  function loadIntroImage(){image=loadStorage('USER/PROJECT_RECOVERY/'+introNames[introPage]+'.IMG')}
  function loadCurrentImage(){var name='USER/PROJECT_RECOVERY/FILE'+('00'+fileNo).slice(-3)+'.IMG';image=loadStorage(name)}
  function drawImageTile(tile,dx,dy,sel){var cw=cellW(),ch=cellH(),sx=tile%cols,sy=Math.floor(tile/cols),x=PX+dx*cw,y=PY+dy*ch;if(image){g.setClipRect(x+1,y+1,x+cw-2,y+ch-2);g.drawImage(image,x-sx*cw,y-sy*ch);g.setClipRect(0,0,W-1,H-1)}else{g.setColor(fg()).drawRect(x+2,y+2,x+cw-3,y+ch-3);text('NO DATA',x+cw/2,y+ch/2-7,'Monofonto16',0)}g.setColor(fg()).drawRect(x,y,x+cw-1,y+ch-1);if(sel)g.drawRect(x+3,y+3,x+cw-4,y+ch-4)}
  function drawPuzzle(){clear();header();var label=mode==='introPuzzle'?'INTRO '+('00'+(introPage+1)).slice(-3):(isBonus?'BONUS FILE':'FILE');text(label,438,50,'Monofonto16',1);text(mode==='introPuzzle'?'INITIAL RECOVERY':('00'+fileNo).slice(-3),438,66,'Monofonto16',1);text(mode==='introPuzzle'?'SEQUENCE '+(introPage+1)+'/3':'LEVEL '+level,438,84,'Monofonto16',1);text('MOVES '+moves,438,102,'Monofonto16',1);text(cols+' x '+rows,438,120,'Monofonto16',1);text(selected<0?'SELECT':'SWAP',438,140,'Monofonto16',1);var i,r,c;for(i=0;i<board.length;i++){r=Math.floor(i/cols);c=i%cols;drawImageTile(board[i],c,r,i===selected)}var cx=cursor%cols,cy=Math.floor(cursor/cols),x=PX+cx*cellW(),y=PY+cy*cellH();g.setColor(fg()).drawRect(x,y,x+cellW()-1,y+cellH()-1);g.drawRect(x+2,y+2,x+cellW()-3,y+cellH()-3);text(mode==='introPuzzle'?'INITIALIZING RECOVERY':'RECOVERY IN PROGRESS',438,302,'Monofonto16',1)}
  function drawRecovered(){clear();header();text(mode==='introRecovered'?'INTRO FILE RECOVERED':(isBonus?'BONUS RECOVERY COMPLETE':'VISUAL DATA RECOVERED'),238,48,'Monofonto18',0);if(image){g.setClipRect(PX,70,PX+IMG_W-1,249);g.drawImage(image,PX,70);g.setClipRect(0,0,W-1,H-1)}var sec=Math.floor((recoveredTime-startTime)/1000);text('INTEGRITY 100%',58,298,'Monofonto16');text('MOVES '+moves,200,298,'Monofonto16');text('TIME '+sec+'s',330,298,'Monofonto16');text('PRESS LEFT KNOB',438,318,'Monofonto16',1)}
  function drawHackSuccess(){clear();header();text('!!! SYSTEM OVERRIDE !!!',238,55,'Monofonto18',0);text('HACK SUCCESS',238,86,'Monofonto23',0);g.setColor(fg());g.drawRect(62,103,418,107);text('ROOT ACCESS: ENABLED',82,124,'Monofonto16');text('FIREWALL: BYPASSED',82,146,'Monofonto16');text('DECRYPTION: COMPLETE',82,168,'Monofonto16');text('CRITICAL DATA UNLOCKED',238,196,'Monofonto18',0);text('PERSONAL ARCHIVE ACCESS GRANTED',238,220,'Monofonto16',0);g.drawRect(92,242,386,274);text('PRESS LEFT KNOB TO CONTINUE',239,252,'Monofonto16',0)}
  function drawBonusIntro(){clear();header();text('ADDITIONAL DATA DETECTED',238,68,'Monofonto18',0);text('PERSONAL ARCHIVE CLEARANCE',238,100,'Monofonto16',0);text('SECURITY CLEARANCE: ACCEPTED',238,126,'Monofonto16',0);text('BONUS RECOVERY FILE '+('00'+fileNo).slice(-3),238,152,'Monofonto16',0);g.setColor(fg()).drawRect(88,178,392,232);text('PRESS LEFT KNOB TO ACCESS',284,190,'Monofonto16',0)}
  function startIntroPuzzle(){cols=3;rows=3;isBonus=false;loadIntroImage();cursor=0;selected=-1;moves=0;startTime=now();shuffleBoard();mode='introPuzzle';drawPuzzle()}
  function startLevel(){level++;setDifficulty();isBonus=(level%3===0);fileNo=isBonus?nextBonusFile():nextMainFile();loadCurrentImage();cursor=0;selected=-1;moves=0;startTime=now();shuffleBoard();mode=isBonus?'bonusIntro':'puzzle';if(mode==='puzzle')drawPuzzle();else drawBonusIntro()}
  function finishPuzzle(){recoveredTime=now();if(mode==='introPuzzle'){mode='introRecovered'}else{mode='recovered'}drawRecovered()}
  function advance(){if(mode==='introRecovered'){if(introPage<2){introPage++;startIntroPuzzle()}else{mode='hackSuccess';drawHackSuccess()}return}if(mode==='hackSuccess'){level=0;startLevel();return}if(mode==='bonusIntro'){mode='puzzle';drawPuzzle();return}if(mode==='recovered'){startLevel();return}}
  function press(){if(mode==='hackSuccess'||mode==='introRecovered'||mode==='recovered'||mode==='bonusIntro'){advance();return}if(selected<0)selected=cursor;else if(selected===cursor)selected=-1;else{var t=board[selected];board[selected]=board[cursor];board[cursor]=t;moves++;selected=-1;if(solved()){finishPuzzle();return}}drawPuzzle()}
  function moveX(d){if(mode!=='introPuzzle'&&mode!=='puzzle')return;var x=cursor%cols;x+=d;if(x<0)x=cols-1;if(x>=cols)x=0;cursor=Math.floor(cursor/cols)*cols+x;drawPuzzle()}
  function moveY(d){if(mode!=='introPuzzle'&&mode!=='puzzle')return;var y=Math.floor(cursor/cols),x=cursor%cols;y+=d;if(y<0)y=rows-1;if(y>=rows)y=0;cursor=y*cols+x;drawPuzzle()}
  function onKnob1(dir){if(dir)moveX(dir);else press()}
  function onKnob2(dir){if(dir)moveY(dir)}
  function teardown(){Pip.removeListener('knob1',onKnob1);Pip.removeListener('knob2',onKnob2);if(Pip.audioStop)Pip.audioStop();delete Pip.remove;delete Pip.removeSubmenu}
  if(Pip.remove)Pip.remove();if(Pip.removeSubmenu)Pip.removeSubmenu();delete Pip.remove;delete Pip.removeSubmenu;Pip.remove=teardown;Pip.removeSubmenu=teardown;Pip.on('knob1',onKnob1);Pip.on('knob2',onKnob2);if(Pip.audioStop)Pip.audioStop();refillBag();startIntroPuzzle();
})();