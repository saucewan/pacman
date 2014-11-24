var size=24; //the size of the maze
var cellSize = 15; //the 
var curPos = [size/2,size/2];
var moving =true; //whether  the mouth is moving
var strong; //whether the mouth can eat the ghost
var counter=0; //time counter
var score=0;
var life=5;
var point; 
var dir; //current direction of the mouth
var audio=document.getElementById("audio");
var audioNoLoop=document.getElementById("audioNoLoop");

var ghostArray=new Array();
var ghostInside;
var mapArray=new Array();
var canvas = document.getElementById("canvas");
var cxt = this.canvas.getContext("2d");
var cover=document.getElementById("cover");
var welcomeImg=document.getElementById("welcomeImg");
var refreshing;
var strongTimer;
var blinking;
var waitToSetRefreshing;
var ghostStartTimer;
var pageTimer={};
var noOfTimer=0;

//display the initial picture
function welcome(){
	cover.innerHTML="pacman";
	cover.style.visibility="visible";
	welcomeImg.style.visibility="visible";
	refreshScore();
	refreshTime();
	refreshLife();
		
}

//set a new game
function newGame(){	
	if (!confirm("Sure to restart the PAC-MAN? ")){
		canvas.focus();
		return;
	}
	welcomeImg.style.visibility="hidden";
	clearTimeout(waitToSetRefreshing);
	clearInterval(refreshing);
	
	clearAllTimer();
	noOfTimer=0;
	cover.style.visibility="hidden";
		
	var sizeRadio=document.getElementsByName("sizeGroup");
	if (sizeRadio[0].checked)
		size=sizeRadio[0].value*1.0;
	else
		size=sizeRadio[1].value*1.0;
	
	canvas.height=(size+1)*cellSize;
	canvas.width=(size+1)*cellSize;
	
	createMap();
	iniItems();
	drawMap();
	drawMouth();
	drawGhost();
	
	audio.src="dot.wav";
	audio.loop=true;
	
	refreshScore();
	refreshLife();
	refreshTime();
	canvas.focus();
	
	drawBlink();
	pageTimer[noOfTimer++]=setTimeout("drawBlink()",500);
	pageTimer[noOfTimer++]=setTimeout("drawBlink()",1000);
	canvas.addEventListener( "keydown", doKeyDown, true);
	pageTimer[noOfTimer++]=waitToSetRefreshing=setTimeout("refreshing=setInterval(\"draw()\",125)",1500);
}

//make the map array
function createMap(){
	for (var i=0;i<=this.size;i++){
		mapArray[i]=new Array();
		for (var j=0; j<=this.size; j++){
			this.mapArray[i][j]=-1;	
		}
	}
	for (var i=1;i<this.size;i++){
		this.mapArray[i][1]=1;
		this.mapArray[i][this.size-1]=1;
		this.mapArray[1][i]=1;
		this.mapArray[this.size-1][i]=1;
		
		this.mapArray[i][this.size/2]=1;
		this.mapArray[this.size/2][i]=1;
	}

	randomHalfMap();
	
	for (var i=size/2-3;i<=size/2;i++)
		for (var j=size/2-2;j<=size/2+2;j++)
			mapArray[j][i]=1;
	
	mapArray[size/2][size/2]=-1;
	mapArray[size/2-1][size/2]=-1;
	mapArray[size/2+1][size/2]=-1;
	mapArray[size/2][size/2-1]=-1;
	mapArray[size/2-1][size/2-1]=-1;
	mapArray[size/2+1][size/2-1]=-1;
	mapArray[size/2][size/2-2]=-1;
	mapArray[size/2-1][size/2-2]=-1;
	mapArray[size/2+1][size/2-2]=-1;
	
	mapArray[4][1]=2;
	mapArray[size-5][1]=2;
	
	
	for (var i=0;i<size;i++)
		for (var j=0;j<size/2;j++)
			mapArray[i][size-j]=mapArray[i][j];
}

//random left half of map
function randomHalfMap(){
	for (var k=0;k<2;k++){
	var cell=[2,k+3];
	mapArray[cell[0]][cell[1]]=1;
	while (cell[0]<(size-1)){
		var length=Math.floor(Math.random()*1)+2;
		var direction=Math.floor(Math.random()*3);//0-down;1-left;2-right
		for (var i=1; i<=length; i++){
			switch(direction){
				case 0:
					if (cell[0]>=(size-1))
						continue;
					cell[0]++;
					break;
				case 1:
					if (cell[1]>1)
						cell[1]--;
					break;
				case 2:
					if (cell[1]<(size/2-2))
						cell[1]++;
					break;		
			}
			this.mapArray[cell[0]][cell[1]]=1;
		}
	}
}	
	for (var k=0;k<2;k++){
	cell=[size/2*k+5,2];
	mapArray[cell[0]][cell[1]]=1;
	while (cell[1]<(size/2-1)){
		length=Math.floor(Math.random()*1)+1;
		direction=Math.floor(Math.random()*3);//0-down;1-up;2-right
		for (var i=1; i<=length; i++){
			switch(direction){
				case 0:
					if (cell[0]<size/2)
						cell[0]++;
					break;
				case 1:
					if (cell[0]>1)
						cell[0]--;
					break;
				case 2:
					if (cell[1]>=(size/2-1))
						continue;
					cell[1]++;
					break;
					
					
			}
			this.mapArray[cell[0]][cell[1]]=1;
		}
	}
	}
	
	
}

//initiate items
function iniItems(){
	strong =false;
	counter = 1;
	score=0;
	life=5;
	point=0;
	dir=3;
	
	curPos=[size/2+2,size/2];
	ghostArray=new Array();
	iniGhost();
	
	audio.autoplay=true;
	audio.loop=true;
	audioNoLoop.autoplay=true;
	audioNoLoop.loop=false;
}

//function to initiate all ghosts
function iniGhost(){
	ghostInside=4;
	for (var i=0;i<4;i++){
		this.ghostArray[i]={dir:0,
							loc:[size/2-1,size/2],
							alive:false};
		pageTimer[noOfTimer++]=setTimeout("ghostStart("+i+")",i*3000.0);
	}		
}

//function to start a ghost
function ghostStart(ghostIndex){
	ghostArray[ghostIndex].loc=[size/2-1,size/2];
	ghostArray[ghostIndex].alive=true;
	ghostInside--;
}
//function to refresh the score
function refreshScore(){
	document.getElementById("scoreText").innerHTML=this.score;
}
//function to refresh the life
function refreshLife(){
	var tempEle=document.getElementById("life");
	tempEle.innerHTML="";
	for (var i=0;i<life;i++)
		tempEle.innerHTML+="<div class='imgDiv'></div>";	
}
//function to refresh the time	
function refreshTime(){
	document.getElementById("timeText").innerHTML=(100-Math.floor(this.counter/8));	
}

//funtion for mouth to move
function move(){
	var prePos=curPos;
	switch(dir){
		case 0:	
			if((curPos[0]>0) && (mapArray[curPos[0]-1][curPos[1]]>=0))
				curPos[0]-=1;
			break;
		case 1:
			if((curPos[0]<size+1) && (mapArray[curPos[0]+1][curPos[1]]>=0))
				curPos[0]+=1;
			break;
		case 2:
			if((curPos[1]>0) && (mapArray[curPos[0]][curPos[1]-1]>=0))
				curPos[1]-=1;
			break;
		case 3:
			if((curPos[1]<size+1) && (mapArray[curPos[0]][curPos[1]+1]>=0))
				curPos[1]+=1;
			break;
	}
	if (prePos.toString() == curPos.toString())
		this.moving =false;
	else moving = true;
} 

//function to change the mapArray when eating 
function eat(curPos){
	if (this.mapArray[curPos[0]][curPos[1]]==1){
		this.mapArray[curPos[0]][curPos[1]]=0;
		score+=1.0;
	}
	if (this.mapArray[curPos[0]][curPos[1]]==2){
		this.mapArray[curPos[0]][curPos[1]]=0;
		score+=10.0;
		audioNoLoop.src="eatBig.wav";
		strong=true;
		clearTimeout(strongTimer);
		strongTimer=setTimeout("strong=false",5000);
	}
	refreshScore();
}

//funtion for a ghost to change direction
function ghostChangeDir(i){
		if (!ghostArray[i].alive)
			return;
		var tempArray=new Array();
		var tempIndex=0;
					
		if ((ghostArray[i].loc[0]>0)&&(mapArray[ghostArray[i].loc[0]-1][ghostArray[i].loc[1]] > -1)){
			tempArray[tempIndex++]={loc:[ghostArray[i].loc[0]-1,ghostArray[i].loc[1]],
									dir:0};
		}
		if ((ghostArray[i].loc[0]<size+1)&&(mapArray[ghostArray[i].loc[0]+1][ghostArray[i].loc[1]] > -1)){
			tempArray[tempIndex++]={loc:[ghostArray[i].loc[0]+1,ghostArray[i].loc[1]],
									dir:1};
		}
		if ((ghostArray[i].loc[1]>0)&&(mapArray[ghostArray[i].loc[0]][ghostArray[i].loc[1]-1] > -1)){
			tempArray[tempIndex++]={loc:[ghostArray[i].loc[0],ghostArray[i].loc[1]-1],
									dir:2};
		}
		if ((ghostArray[i].loc[1]<size+1)&&(mapArray[ghostArray[i].loc[0]][ghostArray[i].loc[1]+1] > -1)){
			tempArray[tempIndex++]={loc:[ghostArray[i].loc[0],ghostArray[i].loc[1]+1],
									dir:3};
		}
		var tempNo=Math.floor(Math.random()*tempArray.length);
		var tempPos=tempArray[tempNo].loc;
		if (tempPos!=null){
			ghostArray[i].loc=tempPos;
			ghostArray[i].dir=tempArray[tempNo].dir;
		}
}

//function to all ghosts to change direction
function ghostShock(){
	for (var i=0;i<ghostArray.length;i++)
		ghostChangeDir(i);
	
}

//function for all ghosts to move
function ghostMove(){
	for (var i=0;i<ghostArray.length;i++){
		if (ghostArray[i].alive){
			var tempPos=getPosition(ghostArray[i].loc,ghostArray[i].dir);
			if (tempPos!=null)
				ghostArray[i].loc=tempPos;
			else 
				ghostChangeDir(i);
		}
	}
}

//get a position given a current position and direction:0 up; 1 down; 2 left; 3 right;
function getPosition(curPos,ghostDir){
	var tempPos=null;
	switch(ghostDir){
		case 0:
			if ((curPos[0]>0)&&(mapArray[curPos[0]-1][curPos[1]]>-1))
				tempPos=[curPos[0]-1,curPos[1]];

			else tempPos=null;
			break;
		case 1:
			if ((curPos[0]<size+1)&&(mapArray[curPos[0]+1][curPos[1]]>-1))
				tempPos=[curPos[0]+1,curPos[1]];
			else tempPos=null;
			break;

		case 2:
			if ((curPos[1]>0)&&(mapArray[curPos[0]][curPos[1]-1]>-1))
				tempPos=[curPos[0],curPos[1]-1];
			else tempPos=null;
			break;
		case 3:
			if ((curPos[1]<size+1)&&(mapArray[curPos[0]][curPos[1]+1]>-1))
				tempPos=[curPos[0],curPos[1]+1];
			else return null;
			break;

	}
	return tempPos;
	
}

//check whether there is nothing to eat
function checkWin(){
	if (point==0){
		clearInterval(refreshing);
		canvas.blur();
		cover.innerHTML="YOU WIN!!!";
		cover.style.visibility="visible";
		audio.src="";
		audioEat.src="win.wav";
	}
}

//check whether the mouth meet the ghost
function meet(){
	for (var i=0;i<ghostArray.length;i++){
		if ((ghostArray[i].alive)&&((ghostArray[i].loc[0]==curPos[0])&&(ghostArray[i].loc[1]==curPos[1]))){
			if (this.strong){
				ghostArray[i].alive=false;
				pageTimer[noOfTimer++]=setTimeout("ghostStart("+i+")",5000);
				ghostInside++;
				audioNoLoop.src="eatGhost.wav";
			}
			else {
				checkGameOver();
				
			}
			return true;
		}
	}
	return false;
}

//function to check whether game is over
function checkGameOver(){
	life--;
	if (life<=0){
		audio.src="";
		clearInterval(refreshing);
		canvas.blur();
		drawMouth();
		cover.innerHTML="GAME OVER";
		cover.style.visibility="visible";
		audioNoLoop.src="gameOver.wav";
		
	}
	else{ 
		audioNoLoop.src="meetGhost.wav";
		audio.src="";
		clearInterval(refreshing);
		for (var each in ghostArray)
			ghostArray[each].alive=false;
		clearAllTimer();
		noOfTimer=0;
		drawMouth();
		curPos=[size/2+3,size/2];
		dir=3;
		pageTimer[noOfTimer++]=setTimeout("stopMouth()",1500);
		waitToSetRefreshing=setTimeout("refreshing=setInterval(\"draw()\",125)",4500);	
		ghostInside=4;
		pageTimer[noOfTimer++]=setTimeout("iniGhost()",5500);
		pageTimer[noOfTimer++]=setTimeout("audio.src=\"dot.wav\"",4500);
		
	}
	refreshLife();
}


//function to check if time is out
function checkTimeOut(){
	var timeLeft=100-Math.floor(this.counter/8);
	if (timeLeft<=0){
		canvas.blur();
		clearInterval(refreshing);
		cover.innerHTML="TIME OUT";
		cover.style.visibility="visible";
		audio.src="";
		audioEat.src="gameOver";
	}
}

//whether decrease life, keep the scene for a while
function stopMouth(){
	drawMap();
	
	for (var i=0;i<ghostArray.length;i++)
		if (ghostArray[i].alive)
			ghostArray[i].loc=[size/2-1,size/2];
	drawGhost();
	blinking=setInterval("drawBlink()",500);	
	setTimeout("clearInterval(blinking)",3000);
	
}

//function to draw a blinking mouth
function drawBlink(){
	if (counter%2 ==0)
		counter++;
	drawMouth();
	pageTimer[noOfTimer++]=setTimeout("cxt.clearRect(curPos[1]*cellSize,curPos[0]*cellSize,cellSize,cellSize)",250);
	
}

//draw all ghosts
function drawGhost(){
	if (!strong)
		cxt.fillStyle="#FF0040";
	else
		cxt.fillStyle="#A4A4A4";
	for (var i=0;i<ghostArray.length;i++){
		if (ghostArray[i].alive)
			cxt.ghost(ghostArray[i].loc[1]*cellSize,ghostArray[i].loc[0]*cellSize).fill();
	}
	switch(ghostInside){
		case 1: cxt.ghost(size/2*cellSize,size/2*cellSize).fill();
				break;
		case 2: cxt.ghost(size/2*cellSize,size/2*cellSize).fill();
				cxt.ghost((size/2-1)*cellSize,size/2*cellSize).fill();
				break;
		case 3: cxt.ghost(size/2*cellSize,size/2*cellSize).fill();
				cxt.ghost((size/2-1)*cellSize,size/2*cellSize).fill();
				cxt.ghost((size/2+1)*cellSize,size/2*cellSize).fill();
				break;
		case 4:	cxt.ghost(size/2*cellSize,size/2*cellSize).fill();
				cxt.ghost((size/2-1)*cellSize,size/2*cellSize).fill();
				cxt.ghost((size/2+1)*cellSize,size/2*cellSize).fill();
				cxt.ghost(size/2*cellSize,(size/2-1)*cellSize).fill();
				break;
	}
}

//draw mouth
function drawMouth(){
	this.cxt.fillStyle="#FFFF00";
	var tempX=curPos[1]*cellSize+cellSize/2;
	var tempY=curPos[0]*cellSize+cellSize/2;
		
	switch(dir){
		case 0:
			var tempAng=Math.PI/4*7;	
			break;
		case 1:
			var tempAng=Math.PI/4*3;
			break;
		case 2:
			var tempAng=Math.PI/4*5;
			break;
		case 3:
			var tempAng=Math.PI/4*1;
			break;	
	}
	if (counter%2==0){
		cxt.sector(tempX,tempY,cellSize/2,0,Math.PI*2).fill();	
	}
	else {
		cxt.sector(tempX,tempY,cellSize/2,tempAng,tempAng-Math.PI/2).fill();
	}

}

//function to draw map and points
function drawMap(){
	this.cxt.clearRect(0,0,size*cellSize,size*cellSize);
	point=0;
	//draw map and point
	for(var i in mapArray){
		for (var j in mapArray[i]){
			switch(mapArray[i][j]){
				case -1:
					this.cxt.fillStyle="#084B8A";
					this.cxt.fillRect(j*cellSize,i*cellSize,cellSize,cellSize);
					break;
				case 1:
					this.cxt.fillStyle="#F2F5A9";
					this.cxt.beginPath();
					this.cxt.arc(j*cellSize+cellSize/2,i*cellSize+cellSize/2,cellSize/8,2.0*Math.PI,0,true);
					this.cxt.closePath();
					this.cxt.fill();
					point++;
					break;
				case 2:
					this.cxt.fillStyle="#F2F5A9";
					this.cxt.beginPath();
					this.cxt.arc(j*cellSize+cellSize/2,i*cellSize+cellSize/2,cellSize/4,2.0*Math.PI,0,true);
					this.cxt.closePath();
					this.cxt.fill();
					point++;
					break;	
			}
		}
 	}
	this.cxt.fillStyle="#000000";
	this.cxt.fillRect((size/2-1)*cellSize,(size/2)*cellSize,cellSize,cellSize);
	this.cxt.fillRect((size/2)*cellSize,(size/2)*cellSize,cellSize,cellSize);
	this.cxt.fillRect((size/2)*cellSize,(size/2-1)*cellSize,cellSize,cellSize);
	this.cxt.fillRect((size/2+1)*cellSize,(size/2)*cellSize,cellSize,cellSize);
	
	this.cxt.fillStyle="#FFFFFF";
	this.cxt.fillRect((size/2)*cellSize,(size/2-0.5)*cellSize,cellSize,5);
}

//funtion to refresh the canvas
function draw(){
	
	drawMap();
	checkWin();
	if (meet()==false){
		ghostMove();
		drawGhost();
	}
		//change ghost direction sometimes
	if (counter%5==0)
		ghostShock();
	
	//check meet
	
	
	if (meet()==false){
		move();
		eat(this.curPos);
	}
	if (meet()==false)
		drawMouth();
				
	this.counter += 1;
	refreshTime();
	checkTimeOut();
}

//prototype to draw ghost
CanvasRenderingContext2D.prototype.ghost = function(x,y){	
	this.save();
	this.translate(x,y);
	this.beginPath();
	this.moveTo(0,cellSize/2);
	this.quadraticCurveTo(cellSize/2,-5,cellSize,cellSize/2);
	
	this.lineTo(cellSize,cellSize);
	this.lineTo(0,cellSize);
	this.moveTo(0,cellSize);
	this.lineTo(0,cellSize/2);
	this.closePath();
	this.restore();
	return this;
};

//prototype to draw sector
CanvasRenderingContext2D.prototype.sector = function (x, y, radius, sDeg, eDeg) {
// 初始保存
	this.save();
	this.translate(x, y);
	this.beginPath();
	this.arc(0,0,radius,sDeg, eDeg);
	this.save();
	this.rotate(eDeg);
	this.moveTo(radius,0);
	this.lineTo(0,0);
	this.restore();
	this.rotate(sDeg);
	this.lineTo(radius,0);
	this.closePath();
	this.restore();
	return this;
}

//function to deal with events of pressing the keyboard
function doKeyDown(e){
	if(e.keyCode==38)
		if((curPos[0]>0) && (mapArray[curPos[0]-1][curPos[1]]>=0))
			dir=0;//up
	if(e.keyCode==40)
		if((curPos[0]<size+1) && (mapArray[curPos[0]+1][curPos[1]]>=0))
			dir=1;//down
	if(e.keyCode==37)	
		if((curPos[1]>0) && (mapArray[curPos[0]][curPos[1]-1]>=0))	
			dir=2;//left
	if(e.keyCode==39)
		if((curPos[1]<size+1) && (mapArray[curPos[0]][curPos[1]+1]>=0))
			dir=3;//right
}

//function to deal with events when clicking the direction buttons
function upOnClick(){
	dir=0;
}
function downOnClick(){
	dir=1;
}
function leftOnClick(){
	dir=2;
}
function rightOnClick(){
	dir=3;
}


function clearAllTimer(){
	for (var each in pageTimer)
		clearTimeout(pageTimer[each]);	
}

