

//defteros.js


//(function () {

	Eximo.loadSpriteSheet('sprites.json');

	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext('2d');
	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	var keyboard = new KeyboardJS (true);
	var arrowKeys = {
		up: 38,
		left: 37,
		right: 39,
		down: 40
	}

	window.onresize = function () {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	window.onresize();

	/*
	var sound = new Howl({
		urls: ['bgmusic'+Math.floor(Math.random()*6)+'.mp3'],
		autoplay: true,
		volume: 0.75,
		onend: function() {
			BGMusic();
		}
	});
	*/

	function logic () {

	}

	function Scene () {

	}
	Scene.prototype.start = function () {

	}
	Scene.prototype.logic = function () {

	}
	Scene.prototype.render = function () {

	}
	Scene.prototype.end = function () {
		console.log(this);
		this.manager.nextScene();
	}

	var titleScreen = new Scene ();
	titleScreen.start = function () {
		console.log('titleScreen started');
		this.title = {Yoffset:canvas.height/2, alpha: 0};
		TweenLite.to(this.title, 5, {alpha:1, Yoffset:0, ease:"Elastic.easeOut", onComplete: function () {
			setTimeout(function () {
				TweenLite.to(this.title, 1, {alpha:0, onComplete:this.end.bind(this)});
			}.bind(this), 2000);
		}.bind(this)});
	}
	titleScreen.render = function () {
		ctx.save();
		ctx.fillStyle = '#43CCB6';
		ctx.fillRect(0,0,canvas.width, canvas.height);
		ctx.fillStyle = 'white';
		ctx.font = '40px Retro';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.globalAlpha = this.title.alpha;
		ctx.fillText('defteros',0, this.title.Yoffset);
		ctx.globalAlpha = 1;
		ctx.restore();
	}

	function Vector2 (x,y) {
		this.x = x;
		this.y = y;
	}
	Vector2.prototype = {
		x: 0,
		y: 0,
		add: function (v) {
			return new Vector2(this.x+v.x, this.y+v.y);
		}
	}

	function GameObject () {
		this.pos = new Vector2(0,0);
	}
	GameObject.prototype = {
		render : function () {
			ctx.save();
			ctx.translate(this.pos.x, this.pos.y);
			ctx.fillStyle = 'blue';
			ctx.fillRect(-10,-10,20,20);
			ctx.restore();
		}
	}

	var gravity = 0.2;

	function Minion () {
		//this.pos = new Vector2(-100+Math.floor(Math.random()*200),-100+Math.floor(Math.random()*200));
		this.pos = new Vector2(-canvas.width/2+Math.floor(Math.random()*canvas.width),-canvas.height/2+Math.floor(Math.random()*canvas.height));
		this.jumping = false;
		this.offsetY = 0;
		this.jumpVY = 0;
	}
	Minion.prototype = new GameObject();
	Minion.prototype.jump = function () {
		if (this.jumping) return;
		console.log('jump!');
		this.jumpVY = -3;
		this.jumping = true;
	}
	Minion.prototype.jumpLogic = function () {
		if (!this.jumping) return;
		this.offsetY += this.jumpVY;
		this.jumpVY += gravity;
		if (this.offsetY < 0) return;
		this.offsetY = 0;
		this.jumping = false;
	}
	Minion.prototype.logic = function () {
		if (!this.jumping && Math.random() > 0.99) this.jump();
		this.jumpLogic();
	}
	Minion.prototype.render = function () {
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		Eximo.drawSprite('MinionShadow.png',ctx,0,0);
		Eximo.drawSprite('Minion.png',ctx,0,this.offsetY);
		ctx.restore();
	}



	var gameScreen = new Scene ();
	gameScreen.start = function () {
		this.alpha = 0;
		this.gameObjects = [];
		for (var i = 0; i < 1000; ++i) {
			this.gameObjects.push(new Minion ());
		}
		this.camera = new Vector2(0,0);
		this.cameraAccel = new Vector2(0,0);
		this.cameraSpeed = 4;
		this.cameraSmooth = 1.1;
		TweenLite.to(this, 2, {alpha:1});
	}
	gameScreen.logic = function () {
		if (keyboard.keysASCII[arrowKeys.left]) this.cameraAccel.x += this.cameraSpeed;
		if (keyboard.keysASCII[arrowKeys.right]) this.cameraAccel.x -= this.cameraSpeed;
		if (keyboard.keysASCII[arrowKeys.up]) this.cameraAccel.y += this.cameraSpeed;
		if (keyboard.keysASCII[arrowKeys.down]) this.cameraAccel.y -= this.cameraSpeed;
		this.cameraAccel.x /= this.cameraSmooth;
		this.cameraAccel.y /= this.cameraSmooth;
		this.camera = this.camera.add(this.cameraAccel);
		for (var i = 0; i < this.gameObjects.length; ++i) this.gameObjects[i].logic();
	}
	gameScreen.sortfunction = function (a, b) {
		return a.pos.y-b.pos.y;
	}
	gameScreen.render = function () {
		ctx.save();
		ctx.fillStyle = '#43CCB6';
		ctx.fillRect(0,0,canvas.width, canvas.height);
		ctx.translate(Math.floor(this.camera.x+canvas.width/2), Math.floor(this.camera.y+canvas.height/2));
		ctx.globalAlpha = this.alpha;
		this.gameObjects.sort(this.sortfunction);
		for (var i = 0; i < this.gameObjects.length; ++i) this.gameObjects[i].render();
		ctx.restore();
	}

	function SceneManager () {
		this.scenes = [];
		this.sceneIndex = -1;
	}
	SceneManager.prototype.logic = function () {
		if (this.scenes[this.sceneIndex] == undefined) return;
		this.scenes[this.sceneIndex].logic();
	}
	SceneManager.prototype.render = function () {
		if (this.scenes[this.sceneIndex] == undefined) return;
		this.scenes[this.sceneIndex].render();
	}
	SceneManager.prototype.addScene = function (scene) {
		this.scenes.push(scene);
		scene.manager = this;
	}
	SceneManager.prototype.nextScene = function () {
		++this.sceneIndex;
		this.startCurrentScene();
	}
	SceneManager.prototype.startCurrentScene = function () {
		if (this.scenes[this.sceneIndex] == undefined) return;
		this.scenes[this.sceneIndex].start();
	}

	var sceneManager = new SceneManager ();
	sceneManager.addScene(titleScreen);
	sceneManager.addScene(gameScreen);
	sceneManager.nextScene();

	function logic () {
		sceneManager.logic();
	}

	function render () {
		sceneManager.render();
	}

	function main () {
		requestAnimationFrame(main);
		logic();
		render();
	}

	requestAnimationFrame(main);

//})();