/*
board.js
	Purpose: Build a connect 4 board. You play first as red vs an
			 AI that plays blue after you. There is 1 hidden mine in
			 each row that if hit will cause you to lose the turn. The 
			 mine will be revealed then disappear but there may be more 
			 than one( up to 2) in the same spot, so be careful after it
			 dissapears as it still may hide a mine. Connect 4 of the
			 same color in any direction to win. Wins and loses are tracked
			 using a cookies generated after each round, good for a day.
			 
	Optional:
	- make blue  go first
	- click methods stacks when exectuting blue
	- add edge detection for AI
	- add sizing for circle size and square size
	- organize checkWin with even more functions
	- make more app friendly
	- add better win game text
	- blueAI
		- in xCheck loop consider all options than pick the best one
		- return a value from checkWin() based on conditional for more specific picks
		
	Requirments:
	- add reload in dropChip function, probably using else statment
	- add condition for max heights and a full board, see AI
	- deal with board overflow with sizing
	- clean up code
	- add game description in comments
 
 */
"use strict";

//--Classes--//
class Dimensions{
	//--Constructor--//
	constructor(col=4,row=4,squareS=100,circleS=80){
		this.boardHeight = col;
		this.boardWidth = row;
		this.squareSize = squareS;
		this.circleSize = circleS;
		this.area = col*row;
	}
};

/*
//apply diffrent square and cirlce sizes
let targetSquare = document.querySelector(".square");
targetSquare.style.width = string(dimensions.squareSize)+"px";
targetSquare.style.height = dimensions.squareSize+"px";
let targetOccupancy = document.querySelector(".empty");
targetOccupancy.style.width = dimensions.circleSize;
targetOccupancy.style.height = dimensions.circleSize;
*/

//--Global Data-- //

// board dimensions
let dimensions = new Dimensions(5,7,50,40);

// html elements
let main = document.querySelector("main");
let board = document.getElementById("board");
let turn = document.getElementById("turn");
let info = document.getElementById("info");

// game state controls
let gameOver = false;
let canClick= true;

// end game determinators
let connectRequired = 4;
let avaliableSpots = dimensions.area;

// feature enabler(s)
let disableMines= false;

//--Constructor--//
window.addEventListener("load", makeBoard);

//--Functions--//
function makeBoard (){
	// use dimesions to iiterate through height & width of board
	for(let y=0; y < dimensions.boardHeight; y++){
		// create endl div based on css class to end flex rows
		let endl = document.createElement("div");
		endl.className = "endl"
		// generate random  mine location for each row
		let randXAxisBomb = Math.floor(Math.random()*(dimensions.boardWidth));
		for(let x=0; x < dimensions.boardWidth; x++){
			// spot hold mines or empty circle classes 
			let spot = document.createElement("div");
			if(x != randXAxisBomb || disableMines== true){ //set empty
				spot.className = "empty";
			}else{ // set mine
				spot.className = "mine"
				// generate rand mine quantity, either 1 or 2 per mine 
				let bombLife = Math.floor((Math.random()*2)+1);
				spot.text = bombLife;
			}
			turn.value = 'Blue';
			// square's id holds cordinates and is the outer container for spot 
			let square = document.createElement("div");
			square.id = "square_"+y+"-"+x;
			square.className = "square"
			// red is the user and click's to drop the chip if the game isn't over
			if(gameOver == false && turn.value == "Red"){
				square.addEventListener('click', () => {
					// drop chip using the x value to drop into a specific column
					dropChip(x);
				});
			}
			// append the spot the square & square to board
			square.appendChild(spot);
			board.appendChild(square);
		}
		// end a board row with endl div
		board.appendChild(endl);
	}

	// dropChip(column : int) : void
	function dropChip (column) {
		// event enabler condition
		if (gameOver == false && canClick== true){ 
			// loop from the bottom up, scaning the column
			for (let y=dimensions.boardHeight-1; y >= 0; y--) { // ? remove blues turn since its converted to an AI
				// target square in colum
				let targetID = "square_"+y+"-"+column;
				let targetSquare = document.getElementById(targetID);
				// child node "spot div" of target square
				let targetCircle = targetSquare.firstElementChild;
				if (targetCircle.className == "empty") { // empty spot found
					// red landed in  its position
					targetCircle.className = "red";
					// check if red wins
					gameOver = checkWin(y,column,"red", connectRequired);
					if(gameOver == true){ // victory
						victory("red");
						return;
					}else{ // pass turn
						// 1 less space available
						avaliableSpots--;
						// set blue turn display
						turn.value = "Blue";
						turn.style.background = "blue";
					}
					y = 0; // end the for loop
				} 
				else if (targetCircle.className == "mine") { // mine spot found
					// mine animation
					info.value = "Red hit a mine, end turn"
					targetCircle.className= 'visible-mine';
					canClick= false;
					setTimeout(function() { // end mine animation
						if (parseInt(targetCircle.text) <= 0){ 
							// clear mine
							targetCircle.className = "empty";
						}else{
							// reset mine
							targetCircle.className= 'mine';
						}
						// still avaliable spots
						if(avaliableSpots != 0){
							turn.value = "Blue";
							turn.style.background = "blue";
							info.value = "make a move";
						}else{ // tie
							tie();
						}
						// blues turn
						setTimeout(function() {
							canClick= true;
							blueAI();
						},500);
					}, 1500);
					// lower mine spot class counter
					targetCircle.text = parseInt(targetCircle.text) - 1;
					y = 0; // end the for loop
				} // end of else if
				else if (y == 0) { // invalid spot found
					canClick = false;
					info.value = "invalid move";
					setTimeout(function() {
						info.value = "make a move";
						canClick= true;
					}, 500);						
				}
			}// end of loop
			if(avaliableSpots == 0){
				tie();
			}
			// assures if missed it won't let blue go
			else if(turn.value == "Blue"){ 
				// blues turn
				setTimeout(function(){
					blueAI();
				}, 500);
			}
		} // end of dropChip function

		function tie(){
			// set tie display
			turn.value = "";
			turn.style.background = "purple";
			info.value = "Tie game!";
			main.style.background = "purple";
			gameOver == true
			// start a new game	
			setTimeout(() => {location.reload()},3000);
		}

		function blueAI(){
			// loop from the coonection required to 0
			for(let cCheck = connectRequired; cCheck >= 0; cCheck--){
				// for(let xCheck=(dimensions.boardWidthwidth/2)+1; xCheck != (dimensions.boardWidth/2); xCheck = (xCheck+1) % (dimensions.boardWidth)){
				// loop from left to right of board, scaning the row
				for(let xCheck=0; xCheck < dimensions.boardWidth; xCheck++){
					// x may or may not use xCheck value
					let x = xCheck
					// random xPos if 0 connect options exist
					if (cCheck == 0){ 
						x = Math.floor(Math.random()*(dimensions.boardWidth));
					}
					// loop from the bottom up of board, scaning the column
					for(let y=dimensions.boardHeight-1; y >= 0; y--){ // finds appropriate y pos
						let targetID = "square_"+y+"-"+x;
						let targetSquare = document.getElementById(targetID);
						let targetCircle = targetSquare.firstElementChild;		
						// empty or mine spot found
						if (targetCircle.className == "mine" || targetCircle.className == "empty") {
							// mine spot found and win condition at cCheck exist or cCheck doesn't exits
							if (targetCircle.className == "mine" && (checkWin(y,x,"blue", cCheck) == true || cCheck == 0)){ // mine spot found
								// mine animation
								info.value = "Blue hit a mine, end turn";
								targetCircle.className = 'visible-mine';
								canClick= false;
								setTimeout(function() { // end mine animation
									// lower mine count
									if (parseInt(targetCircle.text) <= 0){ 
										targetCircle.className = "empty";
									}else{
										targetCircle.className= 'mine';
									}
									// pass turn to red
									turn.value = "Red";
									turn.style.background = "red";
									info.value = "make a move";
									canClick= true;
									// end game if boards filled
									if(avaliableSpots == 0){
										tie();
									}
									return;
								}, 1500);
							    // lower mine count
								targetCircle.text = parseInt(targetCircle.text) - 1;
								// end the for loops
								y = 0; 
								xCheck = dimensions.boardWidth;
								cCheck = 0;
							}
							// priority empty spot found 
							else if(targetCircle.className == "empty" && (checkWin(y,x,"blue", cCheck) == true || cCheck == 0)){ 
								targetCircle.className = "blue";
								if(cCheck == connectRequired){
									gameOver = checkWin(y,x,"blue",connectRequired);
									if(gameOver == true){
										victory("blue");
									}									
									return;
								}
								// decrease avaliable board spot
								avaliableSpots--;
								if(avaliableSpots != 0){ // avaliable spots
									// set reds turn display
									turn.value = "Red";
									turn.style.background = "red";
								}else{ // tie
									tie();
								}
								return
							}
							// non-priority spot found
							else if((targetCircle.className == "empty" || targetCircle.className == "mine") && (checkWin(y,x,"blue", cCheck) == false)){
								// exit the inner loop
								y = 0; 
							}
						} // end of if
					}// end of y loop
				} // end of xCheck loop
			}// end of cCheck loop
		} // end of blueAI function

		// checkWin(squareY : int, squareX : int, circleClass : string, connectCheck : int) : bool
		function checkWin(squareY, squareX, circleClass, connectCheck){
			// don't include current circle
			connectCheck--;
			// loop using i determines 4 connection types
			for(let i=0; i < 4; i++){ 
				if(i==0){ // check vertical (South only) 
					let vertical = [];
					for(let south = 1; south <= connectCheck; south++){ // check right
						if((squareY+south) < dimensions.boardHeight) { // checks for loop chip location
							let checkID = "square_"+(squareY+south)+"-"+(squareX);
							let tokensS = document.getElementById(checkID);
							if(tokensS.firstElementChild.className == circleClass){
								vertical.push(true);
								if(vertical.length == connectCheck){ //check game over!
									return true;
								}	
							}else{ // end loop
								south = connectCheck;  
							}
						}
					}	
				}else if(i==1){ // Horizontal 
					// check East
					let horizontal = []; //
					for(let east = 1; east <= connectCheck; east++){ // check right
						if((squareX+east) < dimensions.boardWidth) { // checks for loop chip location
							let checkID = "square_"+(squareY)+"-"+(squareX+east);
							let tokensE = document.getElementById(checkID);
							if(tokensE.firstElementChild.className == circleClass){
								horizontal.push(true);
								if(horizontal.length == connectCheck){ //check game over!
									return true;
								}	
							}else{ // end loop
								east = connectCheck;  
							}
						}
					}
					// check West
					for(let west = -1; west >= (-connectCheck); west--){ // left <- right
						if((squareX+west) >= 0) { // checks for loop chip location
							let checkID = "square_"+(squareY)+"-"+(squareX+west);
							let tokensW = document.getElementById(checkID);
							if(tokensW.firstElementChild.className == circleClass){
								horizontal.push(true);
								if(horizontal.length == connectCheck){ //check game over!
									return true;
								}	
							}else{ // end loop
								west = -connectCheck;  
							}
						}
					}				
				}else if(i==2){ // Down-Diagnal
					let downDiagnal = []; //
					// check South East 
					for(let south_east = 1; south_east <= connectCheck; south_east++){ // check right
						if((squareX+south_east) < dimensions.boardWidth && (squareY+south_east) < dimensions.boardHeight) { // checks for loop chip location
							let checkID = "square_"+(squareY+south_east)+"-"+(squareX+south_east);
							let tokensSE = document.getElementById(checkID);
							if(tokensSE.firstElementChild.className == circleClass){
								downDiagnal.push(true);
								if(downDiagnal.length == connectCheck){ //check game over!
									return true;
								}	
							}else{ // end loop
								south_east = connectCheck;  
							}
						}
					} 
					// check North West
					for(let north_west = -1; north_west >= (-connectCheck); north_west--){ // check right
						if((squareX+north_west) >= 0 && (squareY+north_west) >= 0) { // checks for loop chip location
							let checkID = "square_"+(squareY+north_west)+"-"+(squareX+north_west);
							let tokensNW = document.getElementById(checkID);
							if(tokensNW.firstElementChild.className == circleClass){
								downDiagnal.push(true);
								if(downDiagnal.length == connectCheck){ //check game over!
									return true;
								}	
							}else{ // end loop
								north_west = -connectCheck;  
							}
						}
					}
				}else if(i==3){ // Up-Diagnal
					let upDiagnal = []; //
					// check North East 
					for(let north_east = 1; north_east <= connectCheck; north_east++){ // check right
						if((squareX+north_east) < dimensions.boardWidth && (squareY-north_east) >= 0) { // checks for loop chip location
							let checkID = "square_"+(squareY-north_east)+"-"+(squareX+north_east);
							let tokensNE = document.getElementById(checkID);
							if(tokensNE.firstElementChild.className == circleClass){
								// console.log("Hello "+tokensNE.id);
								upDiagnal.push(true);
								if(upDiagnal.length == connectCheck){ //check game over!
									return true;
								}	
							}else{ // end loop
								north_east = connectCheck;  
							}
						}
					}
					// check South West
					for(let south_west = -1; south_west >= (-connectCheck); south_west--){ // check right
						if((squareX+south_west) >= 0 && (squareY-south_west) < dimensions.boardHeight) { // checks for loop chip location
							let checkID = "square_"+(squareY-south_west)+"-"+(squareX+south_west);
							let tokensSW = document.getElementById(checkID);
							if(tokensSW.firstElementChild.className == circleClass){
								upDiagnal.push(true);
								if(upDiagnal.length == connectCheck){ //check game over!
									return true;
								}	
							}else{ // end loop
								south_west = -connectCheck;  
							}
						}
					}					
				} // end of else if
			} // end of i/directional for loop
			// no win found
			return false;  
		} // end of checkWin function

		// victory(winningClass : string) : void
		function victory(winningClass){
			// set victory display colors
			turn.style.background = winningClass;
			main.style.background = winningClass;
			if(winningClass == "red"){
				// set red victory text
				turn.value = "Red"
				info.value = "Red wins!"
				// increase wins via cookie
				makeCookie(true);
			}
			else if(winningClass == "blue"){
				// set blue victory text
				turn.value = "Blue"
				info.value = "Blue wins!"
				// increase loses via cookie
				makeCookie(false);
			}
			// start a new game	
			setTimeout(() => {location.reload()},3000);
		}
	} // end dropChip function
} // end makeBoard function

function makeCookie(win=false, inc=1) {
	// initial wins & loses
	let wins = 0;
	let loses = 0;
	// assign previous cookies values if they exist
	if(document.cookie){
		wins = parseInt(getCookie("wins"));
		loses = parseInt(getCookie("loses"));
		// delete old cookies
		clearAllCookies();
	}
	// increments wins or loses via win argument
	if(win){
		wins += inc;
	}else{ //lose
		loses += inc;
	}
	// makes new cookie after each round
	writeCookie("wins ", wins, 1);
	writeCookie("loses", loses, 1);		 
}

// getCookie(name : string) : void
function getCookie(name) {
	const cookieArray = document.cookie.split(';');
	// gets cookie value based on name
	for (const cookie of cookieArray) {
		const [cookieName, cookieValue] = cookie.trim().split('=');
		if (cookieName === name) {
			// retrieve existing cookie
			return cookieValue;
		}
	}
	// cookie with name value doesn't exist
	return null;
}

function writeCookie(name, value, daysToExpire, path, domain, secure){ //days version	
	// writes a cookie, requires at least name and value arg
	let cStr = name + "=" + encodeURIComponent(value);
	if (daysToExpire){ 
		let expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + daysToExpire);
		cStr += ";expires=" + expirationDate.toUTCString();
	}
	if (path) cStr += ";path=" + path;
	if (domain) cStr += ";domain" + domain;
	if (secure) cStr += ";secure" + secure;
	document.cookie = cStr;
}

function clearAllCookies() {
	// delete previous cookie values
	let cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
	  let cookie = cookies[i];
	  let eqPos = cookie.indexOf("=");
	  let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
	  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	}
}
