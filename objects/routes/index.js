var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server,{});
var MongoClient = require('mongodb').MongoClient;
// var url = 'mongodb://localhost:27017/game';
// // Use connect method to connect to the Server
// MongoClient.connect(url, function (err, db) {
// 	if (err) {
// 		console.log('Unable to connect to the mongoDB server. Error:', err);
// 	} else {
// 		// We are connected.
// 		console.log('Connection established to', url);
//
// 		// Get the documents collection
// 		var collection = db.collection('users');
// 		insertToBD = function(theWinner){
// 			collection.insert({pseudonyme:theWinner.pseudonyme,score:theWinner.score});
// 		};
// 		topScore = function() {
// 			collection.find().toArray(function (err, result) {
// 				if (err) {
// 					console.log(err);
// 				} else{
//
// 					if (result.length) {
// 						return result.name;
// 					} else {
// 						return false;
// 					};
// 				};
//
// 				//Close connection
// 				db.close();
// 			}); // end find
// 		}; // top score
//
// 	}; // else of err
// }); // end MongoClient connect


/* GET home page. */

module.exports = function(io) {
		var app = require('express');
		var router = app.Router();

		router.get('/', function(req, res, next) {
			res.render('index', { title: 'Feed Me' });
		});

		var socketList = {};
		var playersList = {};
		var foodList = [];

		// returns a random number between start and end
		function randomInRange(start,end){
				return Math.floor(Math.random() * (end - start + 1) + start);
		}
		// returns max of an array
		function getMaxTableau(tableauNumérique) {
				return Math.max.apply(null, tableauNumérique);
		}
		// the players constructer
		var Player = function(id,name) {
				this.id = id;
				this.pseudonyme = name;
				this.x = 100;
				this.y = 100;
				this.w = 20;
				this.h = 20;
				this.score = 0;
				this.number = 'a' + Math.floor(Math.random()*1000000);
				this.color = '#' + Math.floor(Math.random()*16777215).toString(16);
				this.pressingRight = false;
				this.pressingLeft = false;
				this.pressingUp = false;
				this.pressingDown = false;
				this.maxSpd = 15;
				this.range = function(min0, max0, min1, max1) {
					return Math.max(min0, max0) >= Math.min(min1, max1) &&
					Math.min(min0, max0) <= Math.max(min1, max1);
				},
				this.eats = function(r1) {
					return this.range(this.x, this.x + this.w, r1.x, r1.x + r1.w) &&
							 this.range(this.y, this.y + this.h, r1.y, r1.y + r1.h);
				},
				this.fattens = function() {
					this.w += 8;
					this.h += 8;
				},
				this.updateScore = function() {
					this.score += 2;
				},
				this.updatePosition = function(){
						if(this.pressingRight)
								this.x += this.maxSpd;
						if(this.pressingLeft)
								this.x -= this.maxSpd;
						if(this.pressingUp)
								this.y -= this.maxSpd;
						if(this.pressingDown)
								this.y += this.maxSpd;
						// handling the edges
						if (this.x + this.w >= 750) {
							this.x = 750 - this.w ;
						}else{
							if (this.x <= 0) {
								this.x = 0  ;
							};
						};// end if this x
						if (this.y + this.h >= 650) {
							this.y = 650 - this.h;
						}else{
							if (this.y <= 0) {
								this.y = 0  ;
							};
						};// end if player y
				};// updatePosition
		};// end player

		// the food constructer
		var Food = function() {
				this.x = randomInRange(0,750);
				this.y = randomInRange(0,650);
				this.w = 10;
				this.h = 10;
				this.id = 'f' + Math.floor(Math.random() * 100000);
				this.toErase = false;
				this.erase = function() {
						this.toErase = true;
				}
		};
		var game = function() {
			// creation of food
			for(var i=0;i<10;i++) {
				var food = new Food();
				foodList.push(food);
				// console.log(foodList);
			};

		};


		// conn function
		function conn(socket,data){
			var player = new Player(socket.id,data.name);
			playersList[socket.id] = player;
			if(waitingplayer){
				socket.emit('init', 'start');
				waitingplayer.emit('init', 'start');
				waitingplayer = null;
					game();

			}else{
				waitingplayer = socket;
				socket.emit('init', 'you are waiting for a second player');
			};
				// deplacement
				socket.on('keyPress',function(data){
					if(data.inputId === 'left')
					player.pressingLeft = data.state;
					else if(data.inputId === 'right')
					player.pressingRight = data.state;
					else if(data.inputId === 'up')
					player.pressingUp = data.state;
					else if(data.inputId === 'down')
					player.pressingDown = data.state;
				}); // end keypress

		};
		var waitingplayer;
		// connection
		io.on('connection', function(socket) {
					// socket.emit('topScore',topScore);
					socket.id = 'a' + Math.floor(Math.random() * 1000000);
					socketList[socket.id] = socket;
					socket.on('logPlayer',function(data) {
							conn(socket,data);
					}); // end log player

					// deconnection
					socket.on('disconnect',function(){
							delete socketList[socket.id];
							delete playersList[socket.id];
					});
		}); //  end connection

		var gameInterID = setInterval(function(){
				var pack = [];
				var tabScore = []; // tableau des scores
				var thewinner = null; //
				for(var i in playersList){
						var player = playersList[i];
						player.updatePosition();
						pack.push({
								x:player.x,
								y:player.y,
								w:player.w,
								h:player.h,
								number:player.number,
								pseudonyme: player.pseudonyme,
								score:player.score,
								color:player.color
						});

						// handling the eating
						for(var j=0;j<foodList.length;j++) {
								if(player.eats(foodList[j])) {
										foodList.splice(j,1);
										player.fattens();
										player.updateScore();
										tabScore[j] = player.score;

								}; // end if
								if(foodList.length == 0){
										var scoreMax = getMaxTableau(tabScore);
										if(scoreMax == player.score){
											thewinner = player;
										}
								};
						}; // end for
				};// end for

				// sending food's & player's positions
				for(var i in socketList){
							var socket = socketList[i];
							socket.emit('playersPos',pack);
							socket.emit('foodPos',foodList);
							if(thewinner != null) {
								socket.emit('theWinner',thewinner);
								delete socketList[socket.id];
								delete playersList[socket.id];
								// insertToBD(thewinner);
							}
				};// end for

		},1000/25); // end setinterval

		return router;
};
/*
vous devez vous deplacer a l'aide des fleches du clavier afin de manger les petits poissons rouge.

*/
