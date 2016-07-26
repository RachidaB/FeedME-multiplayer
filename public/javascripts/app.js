var socket = io();

var displayArea = document.getElementById('displayArea');
var usrName = document.getElementById('name');
var psw = document.getElementById('psw');
var guestForm = document.getElementById('guestForm');
var log = document.getElementById('log');
var gameArea = document.getElementById('gameArea');
var signInbox = document.getElementById('signInbox');
var logArea = document.getElementById('logArea');
var displayBox2 = document.getElementById('displayBox2');


displayBox2.innerHTML = '<h4>Régle du jeu : </h4>'+
												'<nav> Vous devez vous déplacer à l\'aide des flèches du clavier afin de manger les petitspoissons rouge.</nav>';
function topScore(text){
	displayBox2.innerHTML =	'<nav> '+text.val+' </nav><br>';
};
function validate(){
		// login
		if(usrName.value != "" ) {
						socket.emit('logPlayer',{name: usrName.value});
		}else{
				alert("veuillez saisir votre Pseudonyme : ");
		};

};// end validate
function onMessage(text) {
		if(text == 'start'){
			guestForm.elements['name'].disabled = true;

			socket.emit('ready',{});

		} else {
			displayBox2.innerHTML = '<p> '+text+' </p><br>';
		}
};



// logging
var guestForm = document.getElementById('guestForm');
guestForm.onsubmit = function(event) {
		event.preventDefault();
		validate();
};

// initialisation of the game
socket.on('init', onMessage);
socket.on('topScore',topScore);
// game
var ctx = document.getElementById("cv").getContext("2d");
ctx.font = '10px Arial';
// food postitions
socket.on('foodPos',function(data) {
	for(var i = 0 ; i < data.length; i++) {
		ctx.fillStyle = "red";
		ctx.fillRect(data[i].x,data[i].y, 10, 10);
	}; // end for
}); // end food postitions


// winner
socket.on('theWinner',function(player) {
	if(player){
		// displayBox2.style.display = 'block';
		displayBox2.
		innerHTML = '<h4>Le gagnant est : </h4><br>'+
								'<span>'+player.pseudonyme+'</span><br>'+
								'<span> score : '+player.score+'</span><br>';

	};
});
// players postitions
socket.on('playersPos',function(data){
		// player
		ctx.clearRect(0,0,809,555);
			for(var i = 0 ; i < data.length; i++) {
				ctx.fillStyle = data[i].color;
				ctx.fillRect(data[i].x,data[i].y, data[i].w, data[i].h);
				ctx.fillStyle = 'black';
				ctx.fillText(data[i].score,data[i].x+data[i].w/2,data[i].y+data[i].h/2);
				if(!document.getElementById(data[i].number)) {
						var strong = document.createElement('strong');
						strong.id = data[i].number;
						// displayBox2.innerHTML = '';
						var logname = displayBox2.appendChild(strong);
						logname.innerHTML = data[i].pseudonyme;
						var avatar = document.createElement('p');
						var playerAvatar = logname.appendChild(avatar);
						playerAvatar.style.width = "20px";
						playerAvatar.style.height = "20px";
						playerAvatar.style.backgroundColor = data[i].color;
				};
			}; // end for

			document.onkeydown = function(event){
				var kCode = event.keyCode;
				// event.preventDefault();
				switch (kCode) {
					case 39: // right
						socket.emit('keyPress',{inputId:'right',state:true});
						break;
					case 40: //down
						socket.emit('keyPress',{inputId:'down',state:true});
						break;
					case 37: //left
						socket.emit('keyPress',{inputId:'left',state:true});
						break;
					case 38: // up
						socket.emit('keyPress',{inputId:'up',state:true});
						break;
					default:

				}; // end switch key down
			};


			document.onkeyup = function(event){
				var kCode = event.keyCode;
				// event.preventDefault();
				switch (kCode) {
					case 39: // right
						socket.emit('keyPress',{inputId:'right',state:false});
						break;
					case 40: //down
						socket.emit('keyPress',{inputId:'down',state:false});
						break;
					case 37: //left
						socket.emit('keyPress',{inputId:'left',state:false});
						break;
					case 38: // up
						socket.emit('keyPress',{inputId:'up',state:false});
						break;
					default:
				};
			}; // end switch key up

	 }); // end playersPos
