var canvas = document.getElementById('myGame');
var ctx = canvas.getContext('2d');
var ratio = 1;


var windWidth = window.innerWidth;
var windHeight = window.innerHeight;

function setCanvasSize(width, height){
	if(height > 600){
		canvas.height = (600 - 20);
		ratio = (600 / 500) + 1.5;
		if(width > 500){
		   canvas.width = (500 - 20);
		}else{
	    	canvas.width = (width - 20);
		}
	}else{
		canvas.height = (height - 20);
		if(width > 500){
			canvas.width = (500 - 20);
			ratio = (width / 500) + 1.5;
		}
		else{
			canvas.width = width - 20;
			ratio = 2;
		}
	}
}

setCanvasSize(windWidth, windHeight);

var WIDTH = canvas.width;
var HEIGHT= canvas.height;
var TOP_EDGE = 30;
var BOTTOM_EDGE = 20;
var score = 0;
var enemyList = {};
var bulletList = {};
var upgradeList = {};
var timer = 0;
var timerSpd = 0;
var bulletTimer = 30;
var once = true;
var intro = 0;

var Img = {};

Img.player = new Image();
Img.player.src = "images/spaceship.png";
Img.player.w = 24 * ratio;
Img.player.h = 19 * ratio;

Img.bullet = new Image();
Img.bullet.src = 'images/bullet.png';
Img.bullet.w = 4 * ratio;
Img.bullet.h = 14 * ratio;

Img.smallrock = new Image();
Img.smallrock.src = 'images/smallrock.png';
Img.smallrock.w = 19 * ratio;
Img.smallrock.h = 17 * ratio;

Img.insect1 = new Image();
Img.insect1.src = 'images/insect-1.png';
Img.insect1.w = 22 * ratio;
Img.insect1.h = 20 * ratio;

Img.insect2 = new Image();
Img.insect2.src = 'images/insect-2.png';
Img.insect2.w = 18 * ratio;
Img.insect2.h = 16 * ratio;

Img.addlife = new Image();
Img.addlife.src = 'images/bonus_life.png';
Img.addlife.w = 17 * ratio;
Img.addlife.h = 17 * ratio;

Img.addbullets = new Image();
Img.addbullets.src = 'images/bonus_bullet.png';
Img.addbullets.w = 17 * ratio;
Img.addbullets.h = 20 * ratio;

Img.bg = new Image();
Img.bg.src = 'images/bg.png';



var setScoreText = function (score){
	if(score < 100){
		return " disastrous";
	}
	if(score >= 100 && score < 200){
		return " poor";
	}
	if(score >= 200 && score < 300){
		return " weak";
	}
	if(score >= 300 && score < 500){
		return " inadecvate";
	}
	if(score >= 500 && score < 700){
		return " decent";
	}
	if(score >= 700 && score < 900){
		return " good";
	}
	if(score >= 900 && score < 1100){
		return " excellent";
	}
	if(score >= 1100){
		return " world class";
	}
}

document.onmousemove = function(mouse){
	var rect = canvas.getBoundingClientRect();
	var mx = mouse.clientX - rect.left;
	var my = mouse.clientY;

	if(mx > 0 && mx+player.width <= WIDTH){
		player.x = mx;
	}else if(mx+player.width >= WIDTH ){
		player.x=WIDTH-player.width;
	}else{
		player.x = 0;
	}
}

document.onclick =function(mouse){
	var rect = canvas.getBoundingClientRect();
	var mx = mouse.clientX - rect.left;
	var my = mouse.clientY - rect.top;
	var mouseData = {
		x:mx,
		y:my,
		width: 15,
		height: 15,
	};
	if((intro === 0 || player.hp === 0) && testCollisionRectRect(gameInfo, mouseData)){
		clearInterval(start);
		clearInterval(update_start);
		intro = 0;
		gameInfoStart = setInterval(drawGameInfo, 40);
	}
	if(player.hp===0 && testCollisionRectRect(play, mouseData)){
		clearInterval(gameInfoStart);
	    setTimeout(resetGame, 1000);
	}else{
		if(bulletTimer >= 1){
			RandomlyGenerateBullet();
			bulletTimer = bulletTimer - 1;
		}
	}/*
	if(intro === 0){
	    clearInterval(start);
	    resetGame();
	    intro = 1;
	    setInterval(Update, 40);
	}
	*/
	if(intro === 0 && testCollisionRectRect(play, mouseData)){
		clearInterval(gameInfoStart);
		clearInterval(start);
	    resetGame();
	    intro = 1;
	    update_start = setInterval(Update, 40);
	}
}

var testCollisionRectRect = function(rect1,rect2){
        return rect1.x <= rect2.x + rect2.width
                && rect2.x <= rect1.x + rect1.width
                && rect1.y <= rect2.y + rect2.height
                && rect2.y <= rect1.y + rect1.height;
}

var Character = function(x, y, width, height, spdX, spdY, hp, type, color, img){
	var id = new Date();
	id = id.getTime();
	var self = {
		type:type,
		hp:hp,
		x:x,
		y:y,
		width:width,
		height:height,
		spdX:spdX,
		spdY:spdY,
		color:color,
		atkSpd:1,
		img:img,
		id:id,
		drawImg: function(){
		    ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, self.x, self.y, self.width, self.height);
		},
		drawBg: function(){
			if(self.y < -500){
				self.y -= self.y;
			}else
			{
				self.y -= 0.5;
			}
		    ctx.drawImage(self.img, 0, 500 + self.y, 500, 500, 0, 0, self.width, self.height);
		},
		drawRect: function(){
			ctx.fillStyle = 'white';
			ctx.fillText(self.type, self.x, self.y + self.height/2);
		},
		setImage:  function(){
			switch(self.hp) {
		    case 1:
		    	self.img = Img.insect2;
		        self.width = Img.insect2.w;
		        self.height = Img.insect2.h;

		        break;
		    case 2:
		        self.img = Img.insect1;
		        self.width = Img.insect1.w;
		        self.height = Img.insect1.h;
		        break;
		    default:
		        self.img = Img.smallrock;
		        self.width = Img.smallrock.w;
		        self.height = Img.smallrock.h;
			}
		},
		setImageUpg:  function(){
			switch(self.hp) {
		    case 1:
                self.img = Img.addbullets;
		        self.width = Img.addbullets.w;
		        self.height = Img.addbullets.h;
		        break;
		    case 2:
		        self.img = Img.addlife;
		        self.width = Img.addlife.w;
		        self.height = Img.addlife.h;
		        break;
		    default:
		        self.img = Img.addbullets;
		        self.width = Img.addbullets.w;
		        self.height = Img.addbullets.h;
			}
		},
		setUpg: function(upg){
		    if(upg.hp <= 1 ){
		        bulletTimer += 3;
		    }else{
		        this.hp++;
		    }
		},
		setUpgAtkSpd: function(){
		    this.atkSpd++;
		}
	}
	return self;
}

var RandomlyGenerateEnemy = function(){
	var x = Math.floor(Math.random() * ((WIDTH - 50) - 0) + 0);
	var hp = Math.floor(Math.random() * (4 - 1) + 1);
	var self = new Character(x, -30, 30, 40, 5, Math.floor(Math.random() * (4 - 2) + 2), hp, "enemy", "red", hp);
	self.setImage();
	enemyList[self.id]=self;
}

var RandomlyGenerateUpgrade = function(){
	var x = Math.floor(Math.random() * ((WIDTH - 50) - 0) + 0);
	var hp = Math.floor(Math.random() * (10 - 1) + 1);
    	if(hp < 2){ //we create a chance that 1 in 9 times the upgrade will be a life else it will be extra bullets
    	    hp = 2;
    	}else{
    	    hp = 1;
    	}
	var self = new Character(x, -30, 20, 40, 5, Math.floor(Math.random() * (4 - 2) + 2), hp, "Upgrade", "red", hp);
	self.setImageUpg();
    upgradeList[self.id]=self;
}

var RandomlyGenerateBullet = function(){
	var x = Math.floor(Math.random() * ((WIDTH - 50) - 0) + 0);
	var self = new Character((player.x + player.width / 2) - 5, player.y, Img.bullet.w, Img.bullet.h, 5, Math.floor(Math.random() * (player.atkSpd + 3 - player.atkSpd) + player.atkSpd), 1, "bullet", "black", Img.bullet);
	bulletList[self.id]=self;
}

var gameOver = function(){
	ctx.font = "40px Verdana";
	var text = 'Score: '+ score;
	var scoreText = "Your Rating: "+setScoreText(score);
	ctx.fillStyle = 'red';
	ctx.fillText(text, (WIDTH / 2) - (ctx.measureText(text).width / 2), (HEIGHT / 3) - 40);
	ctx.font = "20px Verdana";
	ctx.fillText(scoreText, (WIDTH / 2) - (ctx.measureText(scoreText).width / 2), (HEIGHT / 3));
	ctx.font = "40px Verdana";
	play.drawRect();
	gameInfo.drawRect();
	play.drawRect();
	gameInfo.drawRect();
	intro = 1;
}

var drawBase = function(){
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	ctx.save();
	bg.drawBg();
	//ctx.fillRect(0, HEIGHT-TOP_EDGE, WIDTH, TOP_EDGE);
	ctx.font='15px Comic sans';
	ctx.fillStyle = 'white';
	var scoreText = 'Score: '+ score;
	ctx.fillText(scoreText, 10, 20);
	ctx.drawImage(Img.bullet, 0, 0, Img.bullet.width, Img.bullet.height, WIDTH - 90, 7, 6, 20);
	ctx.fillText(bulletTimer, WIDTH - 70, 20);
	ctx.drawImage(Img.addlife, 0, 0, Img.addlife.width, Img.addlife.height, WIDTH - 40, 7, 15, 15);
	ctx.fillText(player.hp, WIDTH - 15, 20);
	ctx.restore();
}

var drawGameInfo = function(){
	ctx.clearRect(0,0,WIDTH,HEIGHT);
    drawBase();
	ctx.save();
	ctx.font = "40px Verdana";
	play.y = HEIGHT/1.1;
	play.drawRect();
	ctx.fillStyle = 'white';
  	ctx.font = "20px Verdana";
	ctx.drawImage(Img.player, 0, 0, Img.player.width, Img.player.height, WIDTH / 5, HEIGHT / 7, Img.player.w, Img.player.h);
    ctx.fillText('Player', (WIDTH / 3) + 10, (HEIGHT / 7) + 40);
    ctx.drawImage(Img.smallrock, 0, 0, Img.smallrock.width, Img.smallrock.height, WIDTH / 5, HEIGHT / 7 + 65, Img.smallrock.w, Img.smallrock.h);
    ctx.fillText('Enemy (3 hp)', (WIDTH / 3) + 10, (HEIGHT / 7) + 100);
    ctx.drawImage(Img.insect1, 0, 0, Img.insect1.width, Img.insect1.height, WIDTH / 5, HEIGHT / 7 + 130, Img.insect1.w, Img.insect1.h);
    ctx.fillText('Enemy (2 hp)', (WIDTH / 3) + 10, (HEIGHT / 7) + 170);
    ctx.drawImage(Img.insect2, 0, 0, Img.insect2.width, Img.insect2.height, WIDTH / 5, HEIGHT / 7 + 195, Img.insect2.w, Img.insect2.h);
    ctx.fillText('Enemy (1 hp)', (WIDTH / 3) + 10, (HEIGHT / 7) + 230);
    ctx.drawImage(Img.addlife, 0, 0, Img.addlife.width, Img.addlife.height, WIDTH / 5, HEIGHT / 7 + 250, Img.addlife.w, Img.addlife.h);
    ctx.fillText(' + 1 Life', (WIDTH / 3) + 10, (HEIGHT / 7) + 280);
    ctx.drawImage(Img.addbullets, 0, 0, Img.addbullets.width, Img.addbullets.height, WIDTH / 5, HEIGHT / 7 + 310, Img.addbullets.w, Img.addbullets.h);
    ctx.fillText(' + 3 Bullets', (WIDTH / 3) + 10, (HEIGHT / 7) + 340);
	ctx.restore();
}

var drawIntro = function(){
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    drawBase();
	ctx.save();
	ctx.font = "40px Verdana";
	var text = 'Space Bugs';
	ctx.fillStyle = 'red';
	ctx.fillText(text, (WIDTH / 2) - (ctx.measureText(text).width / 2), (HEIGHT / 2) - 40);
	play.drawRect();
	gameInfo.drawRect();
	ctx.restore();
}

var Update = function(){
	drawBase();
	if(player.hp <=0 ){
	   intro = 0;
	   bulletTimer = 0;
	   gameOver();
	}else{
		//bulletTimer = bulletTimer++;//not in use,
		if(timer+timerSpd > 50){
			RandomlyGenerateEnemy();
			if(Object.keys(enemyList).length >= 3){ // if we have more then 2 enemies we randomly create an update
			    RandomlyGenerateUpgrade();
			}
			timer = 0;
			timerSpd += 0.10;
		}else{
			timer++;
		}

		/* check if bullets hit / collided with any enemies */
		for(var key in bulletList){
			toRemove = false;
				bulletList[key].y -= bulletList[key].spdY;
				bulletList[key].drawImg();
			for(var key2 in enemyList){
				if(testCollisionRectRect(bulletList[key], enemyList[key2])){
					if(enemyList[key2].hp <= 1){
						score++;
						delete enemyList[key2];
					}else{
						enemyList[key2].hp -= 1;
						score++;
						enemyList[key2].setImage();
					}
				toRemove = true;
				}
			}
			if(bulletList[key].y < TOP_EDGE){
				toRemove = true;
			}
			if(toRemove){
				delete bulletList[key];
			}
		}

		/* checks for player and upgrade collision */
		for(var key in upgradeList){
		    toRemove = false;
		    if(testCollisionRectRect(upgradeList[key],player)){
		        player.setUpg(upgradeList[key]);
		        toRemove = true;
		    }
		    if(upgradeList[key].y + upgradeList[key].height > HEIGHT-BOTTOM_EDGE){
				toRemove = true;
			}
			if(toRemove){
				delete upgradeList[key];
			}else{
    		    upgradeList[key].y += upgradeList[key].spdY;
    		    upgradeList[key].drawImg();
			}
		}

		/* checks  collision between enemies and player */
		for(var key in enemyList){
			if(testCollisionRectRect(enemyList[key],player)){
				player.hp -= 1;
				delete enemyList[key];
			}else{
				if (enemyList[key].y + enemyList[key].height > HEIGHT){
					player.hp -= 1;
					delete enemyList[key];
				}else{
					enemyList[key].y+= enemyList[key].spdY;
					enemyList[key].drawImg();
				}
			}
		}
	    if(score === 30 && once === true){
	        player.setUpgAtkSpd();
	        once = false;
	        //console.log('Player attack upgraded');
	    }
	player.drawImg();
	}
}

var resetGame = function(){
	bg = new Character(0, 0, WIDTH, HEIGHT, 5, 1, 2, "enemy", "red", Img.bg);
	player = new Character(150, HEIGHT-BOTTOM_EDGE-40, Img.player.w, Img.player.h, 5, 5, 2, "player", "grey", Img.player);
	play = new Character((WIDTH / 2) - Img.player.w, (HEIGHT/ 2), Img.player.w + 30, Img.player.h + 10, 5, 5, 2, "Play", "grey", Img.player);
	gameInfo = new Character((WIDTH / 2) - 100, (HEIGHT/ 2) + 80, Img.player.w + 100, Img.player.h, 5, 5, 2, "Game Info", "grey", Img.player);
	score = 0;
	timer = 0;
	timerSpd = 0;
	bulletTimer = 30;
	enemyList = {};
	bulletList = {};
	upgradeList = {};
}

resetGame();
var update_start = {};
var gameInfoStart = {};
var start = setInterval(drawIntro, 40); // shows intro for 6 seconds then the games starts or if you click the games starts
