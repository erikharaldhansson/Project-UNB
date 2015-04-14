//////////////
// Refactor 1:
// Huvudmål
// Snygga upp koden
// Förenkla hela spelet

// Delmål
// Minimera confusion, speciellet med variabler och arrayer
// Samla och strukturera koden
// Försöka hitta spelglädjen

///////////
// Hypotes 1: Spelglädjen sitter i enkelheten och
// förmågan att kunna på ett enkelt och fint sätt
// mäta sin minnesförbättring

// TODO: Connect nBack config with game in an appropriate way
// TODO: Average score per day
// TODO: Separate scores by nBack level



var playerParams = {
	name: "Rasmus",
	result: []	// Resultatet lagras efer varje spel i denna array
}

// Constants
var gameConfig = {
	nBack: 9,   // Används för att visa UI
	boarSize: 1 // For future use!?
}

// Vanliga spelparametrar
var gameParams = {
	stimuli: ["green","blue","purple","black","orange","red"],
	stimuliShow: 1200,
	stimuliDelay: 400,
	boardSize: 1,
	nBack: 2,
	matchChance: 0.3,
	streaking: false,	// Den här variabeln avgör ifall man dör när man är inaktiv
	start: undefined			// Konstig workaround för att få setInterval och clear att funka
};


// En UI funktion som visar val av nBack
function showConfig () {
	var cells = "";
	for (i=2 ; i<=gameConfig.nBack ; i++) {
		cells += "<div id='" + i + " back' class='nback_select'>"+i+"</div>";
	}
	settings.innerHTML = cells;	
}

// En UI funktion som skapar spelplanen (loopar helt i önödan just nu)
function drawBoard () {
	var cells = "";
	for (i=0 ; i<gameParams.boardSize ; i++) {
		cells += "<div id='stimtrack' class='cell'></div>";
	}
	game.innerHTML = cells;	
	game.innerHTML += "<br/><br/><div class='nav'><button class='btn' id='btn_match'>+</button></div>";
	startTimer(3,stimtrack);		
}

function startTimer(duration, display) {
    var timer = duration;
    
    var interval = setInterval(function () {       
        
        display.textContent = timer;        

        if (--timer < 0) {
        	clearInterval(interval);
        	display.textContent = "GO";
            startGame();
        }
    }, 800);
}


// En funktion som returnerar ett stimuli baserat på matchChance
function genStimuli () {
	if (Math.random() < gameParams.matchChance && playerParams.result[0].trail.length > gameParams.nBack) {		
		//console.log (playerParams.result[0].trail[gameParams.nBack-1]);
		return playerParams.result[0].trail[gameParams.nBack-1];
	} else {
		// ensure non repeating stimuli
		var temp = null;
		do {
			temp = Math.floor(Math.random() * ( gameParams.stimuli.length ));
		} while (temp === playerParams.result[0].trail[0]);
		//console.log (temp);	
		return temp;
	}
}

// Detta är spelloopen. Kör en runda för tusan!
function displayRound () {
	console.log('interval ' + gameParams.start);
	if (playerParams.result[0].trail[0] === playerParams.result[0].trail[gameParams.nBack] && !gameParams.streaking) {
		gameOver();
    }

	var currentStimuli = genStimuli();
	var currentPosition = document.getElementById("game").childNodes[0];	
	currentPosition.style.backgroundColor = gameParams.stimuli[currentStimuli];
	currentPosition.innerHTML = playerParams.result[0].score;
	playerParams.result[0].trail.unshift(currentStimuli);
	//console.log(playerParams.result[0].trail);
	setTimeout(function(){ currentPosition.style.backgroundColor = '#ddd' }, gameParams.stimuliDelay);
	gameParams.streaking = false;
}


function gameOver () {

	clearInterval(gameParams.start);

	console.log('Game over with id ' + gameParams.start);

	document.removeEventListener('click', clickTrack);
	document.addEventListener('click', overTrack);

	console.log("dead! current stimuli " + gameParams.stimuli[playerParams.result[0].trail[0]]);
	console.log("nback stimuli " + gameParams.stimuli[playerParams.result[0].trail[gameParams.nBack]]);



	var highScore = Math.max.apply(Math,playerParams.result.map(function(o){return o.score;}))



	game_over.className = 'overlay';
	game_over.innerHTML = "<div class='middle' style='text-align: center;'>";
	game_over.innerHTML += "<h1 style='color: #fff;'>Game Over</h1><br/><br/>";
	game_over.innerHTML += "<h2 style='color: #fff;'>Score " + playerParams.result[0].score + "</h2><br/><br/>";
	game_over.innerHTML += "<h2 style='color: #fff;'>High Score " + highScore + "</h2><br/><br/>";
	game_over.innerHTML += "<button class='btn' id='btn_restart'>Restart</button><br/><br/>";
	game_over.innerHTML += "<button class='btn' id='btn_menu'>Menu</button></div>";
	
	var currentPosition = document.getElementById("game").childNodes[0];	
	currentPosition.style.backgroundColor = '#ddd';
	
	gameParams.streaking = false;
	gameParams.start = undefined;
	console.log (playerParams.result);
	saveResult();

	function overTrack ( ev ) {
		switch (ev.target.id) {
      		case "btn_restart":
      			game_over.className = '';
      			game_over.innerHTML = '';
      			game.innerHTML = '';
      			document.removeEventListener('click', overTrack); 
      			prepareGame();      			
      		break;
      		case "btn_menu":
      			game_over.className = '';
      			game_over.innerHTML = '';
      			game.innerHTML = '';
      			document.removeEventListener('click', overTrack); 
      			mainMenu();
      		break;
      	}
	}
}

function loadResult () {
	//localStorage.removeItem('result'); // Debug funktion för att rensa local storage

	// This routine will sort the array of objects to create a highscore list
	//playerParams.result.sort(function(a,b) { return parseFloat(a.score) - parseFloat(b.score) } );

	var storResult = localStorage.getItem('result');
	if (storResult) {
		playerParams.result = JSON.parse(storResult);
	}

	var htmlCode = "<table>";

	for (i = 0 ; i < playerParams.result.length ; i++) {

		htmlCode += "<tr>";
		htmlCode += "<td>" + playerParams.result[i].date + "</td>";
		htmlCode += "<td>" + playerParams.result[i].player + "</td>";
		htmlCode += "<td>" + playerParams.result[i].nback + "</td>";
		htmlCode += "<td>" + playerParams.result[i].score + "</td>";
		htmlCode += "</tr>";

	}

	htmlCode += "</tr>";
	
	profile.innerHTML += htmlCode;
}


function saveResult () {	
		localStorage.setItem('result', JSON.stringify(playerParams.result));
}


function startGame () {
	playerParams.result.unshift({
		player: playerParams.name,
		game: playerParams.result.length,
		date: new Date().getTime(),
		nback: gameParams.nBack,
		score: 0,
		trail: []
	});
	var currentPosition = document.getElementById("game").childNodes[0];
	currentPosition.style.backgroundImage = 'none';

	gameParams.streaking = true;
	gameParams.start = setInterval(function(){ displayRound() }, gameParams.stimuliShow); // starts engine, runs it every 2 seconds
	console.log("Game Started with id " + gameParams.start);
}


function clickTrack (ev) {
    switch (ev.target.id) {
      case "btn_match":
      	if (gameParams.start != null && playerParams.result[0].trail.length >= gameParams.nBack && playerParams.result[0].trail[0] === playerParams.result[0].trail[gameParams.nBack] && !gameParams.streaking) {
      		playerParams.result[0].score++;
      		gameParams.streaking = true;
      		document.getElementById("game").childNodes[0].innerHTML = playerParams.result[0].score;
      		console.log("score!");
      	} else {
      		gameOver();
      	}
      break;      
    }
 }

// D3 funktion som generar och printar ut en line chart baserat på resultat
function initChart() {

	var vis = d3.select("#visualisation"),
	WIDTH = 250,
	HEIGHT = 250,
	MARGINS = {
		top: 50,
		right: 20,
		bottom: 50,
		left: 50
	},
	xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(playerParams.result, function(d) {
	return d.game;
	}), d3.max(playerParams.result, function(d) {
		return d.game;
	})]),
	yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(playerParams.result, function(d) {
	return d.score;
	}), d3.max(playerParams.result, function(d) {
		return d.score;
	})]),
	xAxis = d3.svg.axis()
	.scale(xScale),
	yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left");

	vis.append("svg:g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
		.call(xAxis);

	vis.append("svg:g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + (MARGINS.left) + ",0)")
		.call(yAxis);

	var lineGen = d3.svg.line()
		.x(function(d) {
			return xScale(d.game);
		})
		.y(function(d) {
			return yScale(d.score);
		})
	.interpolate("basis");

	vis.append('svg:path')
		.attr('d', lineGen(playerParams.result))
		.attr('stroke', 'white')
		.attr('stroke-width', 2)
		.attr('fill', 'none');
}

function loadGame() {
	// Load and display splash screen for 3 seconds and/or
	// Handle asset loading and progress bar
	// 
	splash.innerHTML = "<div class='middle'><h1>Loading...</h1></div>";

	setTimeout(loadMenu, 3000);

	function loadMenu() {
		splash.innerHTML = "";		
		mainMenu();
	}
}

function mainMenu() {
	document.addEventListener('click', menuTrack, false);
	menu.innerHTML = "<div class='middle'><button class='btn' id='btn_start'>Play</button><br/><br/><button class='btn' id='btn_profile'>Profile</button></div>";

	function menuTrack (ev) {
    switch (ev.target.id) {
      case "btn_start":
      	menu.innerHTML = "";
      	document.removeEventListener('click', menuTrack);
      	prepareGame();
      break;
      case "btn_profile":
      	menu.innerHTML = ""; 
      	document.removeEventListener('click', menuTrack);
      	showProfile();     	
    }
 }
}

function showProfile() {
	profile.innerHTML = "<button class='btn small' id='close'>X</button>";
    //initChart();
    loadResult();
    document.addEventListener('click', profileTrack, false);

    function profileTrack (ev) {
    	switch (ev.target.id) {
	    	case "close":
	    		profile.innerHTML = "";
	    		document.removeEventListener('click', profileTrack);
	    		mainMenu();
	    	break;
	    }
    }
}

function prepareGame() {
	document.addEventListener('click', clickTrack, false);
    drawBoard();      	
}

////////////////////////////////////////////////////////////////
// The below code is an attempt to collect average score per day
// Currently not working as expected
// Initial research is pointing to Map/Reduce solution

//var tempDate = 0;

//var revResult = new Array();
//revResult = playerParams.result.slice(0);
//revResult.reverse();
//var score = 0;

//var intervalDate = 0;
//var iter = 0;

//var avgScore = [];

// Doesn't count the first entry
//for (i=0 ; i < revResult.length ; i++) {		 
	
//	if (intervalDate == 0) intervalDate = revResult[i].date + 86400000;
//	score += revResult[i].score;
//	iter ++;

//	if (revResult[i].date <= intervalDate) {
			
//	} else {
//		avgScore.push(score / iter);
//		score = 0;
//		iter = 0;

//		intervalDate = revResult[i].date + 86400000;		
//	}
//}

//if (avgScore.length == 0) avgScore.push(score / iter);

//console.log(avgScore);




// Start the game
loadGame();






	




