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
	avatar: "avatar.png",
	result: []	// Resultatet lagras efer varje spel i denna array
}

// Constants
var gameConfig = {
	nBack: 9,   // Används för att visa UI
	boardSize: 1 // For future use!?
}

// Vanliga spelparametrar
var gameParams = {
	stimuli: ["green","blue","purple","black","orange","red"],
	stimuliShow: 1200,
	stimuliDelay: 400,
	boardSize: 1,
	nBack: 2,
	matchChance: 0.3,
	streaking: false,			// Den här variabeln avgör ifall man dör när man är inaktiv
	start: undefined			// Konstig workaround för att få setInterval och clear att funka
};

// Den här funktionen körs bara vid start av appen
//
//
function splashScreen() {
	// Load and display splash screen for 3 seconds and/or
	// Handle asset loading and progress bar
	// 
	splash.innerHTML = "<div class='middle'><h1>Loading...</h1></div>";

	setTimeout(loadMenu, 1500);

	function loadMenu() {
		splash.innerHTML = "";		
		mainMenu();
	}
}


// Ritar upp spelplanen, förbereder spelarens input och kallar på startTimer
function prepareGame() {
	document.addEventListener('click', clickTrack, false);

	var cells = "";
	for (i=0 ; i<gameParams.boardSize ; i++) {
		cells += "<div id='stimtrack' class='cell'></div>";
	}
	game.innerHTML = cells;
	game.innerHTML += "<br/><br/><div class='nav'><button class='btn_match' id='btn_match'>+</button></div>";
	startTimer(3,stimtrack);
}


// Start Timer visar en nedräkning innan spelet kickar igång
//
// Parameters
// Duration: Hur många sekunder som ska räknas ned
// Display: Vilket HTML objekt som ska användas för att visa räknaren
//
//
function startTimer(duration, display) {
    var timer = duration;
    
    var interval = setInterval(function () {       
        
        display.textContent = timer;        

        if (--timer < 0) {
        	clearInterval(interval);
        	display.textContent = "READY!";
            startGame();
        }
    }, 800);
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


// Detta är spelloopen
//
//
function displayRound () {
		console.log('interval ' + gameParams.start);

	// Den här rutinen kollar ifall det skulle varit en match
	// fast spelaren inte hade tryckt på knappan (och aktiverat streaking)
	if (playerParams.result[0].trail[0] === playerParams.result[0].trail[gameParams.nBack] && !gameParams.streaking) {
		gameOver();
    }

	var currentStimuli = genStimuli();
	var currentPosition = document.getElementById("game").childNodes[0];	
	currentPosition.style.backgroundColor = gameParams.stimuli[currentStimuli];
	currentPosition.innerHTML = playerParams.result[0].score;
	playerParams.result[0].trail.unshift(currentStimuli); // Lägg till stimuli i spåret
		//console.log(playerParams.result[0].trail);

	setTimeout(function(){ currentPosition.style.backgroundColor = '#ddd' }, gameParams.stimuliDelay);
	gameParams.streaking = false; // Här sätter vi streaking till falskt så att vi kan kolla av resultatet nästa runda 
}


// En funktion som returnerar ett stimuli baserat på matchChance i gameParams
//
function genStimuli () {
	// Om random genererat nummer är mindre än konfigurerad matchChance och
	// spelet har gått igenom fler rundor än konfigureringen av nback så
	// kopierar vi värdet som ligger lika många steg rundor tillbaka som nBack
	if (Math.random() < gameParams.matchChance && playerParams.result[0].trail.length > gameParams.nBack) {		
		//console.log (playerParams.result[0].trail[gameParams.nBack-1]);
		return playerParams.result[0].trail[gameParams.nBack-1];
	} else {
		// Annars så generar vi ett slumpmässigt stimuli för att visa i spelrundan
		// Ser samtidigt till att vi inte returnerar samma stimuli som rundan innan
		var temp = null;
		do {
			temp = Math.floor(Math.random() * ( gameParams.stimuli.length ));
		} while (temp === playerParams.result[0].trail[0]);
		//console.log (temp);	
		return temp;
	}
}


// Game over
// Städar upp spelloopen och visar/sparar resultatet
// Innehåller även en funktion för att tracka input på game over overlay skärmen
function gameOver () {

	clearInterval(gameParams.start);

	console.log('Game over with id ' + gameParams.start);

	document.removeEventListener('click', clickTrack);
	document.addEventListener('click', overTrack);

	console.log("dead! current stimuli " + gameParams.stimuli[playerParams.result[0].trail[0]]);
	console.log("nback stimuli " + gameParams.stimuli[playerParams.result[0].trail[gameParams.nBack]]);

	var highScore = Math.max.apply(Math,playerParams.result.map(function(o){return o.score;}));

	game_over.className = 'overlay';
	game_over.innerHTML = "<div class='middle' style='text-align: center;'>";
	game_over.innerHTML += "<h1 style='color: #fff;'>Game Over</h1><br/><br/>";
	game_over.innerHTML += "<h2 style='color: #fff;'>Score " + playerParams.result[0].score + "</h2><br/><br/>";
	game_over.innerHTML += "<h2 style='color: #fff;'>High Score " + highScore + "</h2><br/><br/>";
	game_over.innerHTML += "<h1 class='btn' id='btn_restart'>Restart</h1><br/><br/>";
	game_over.innerHTML += "<h1 class='btn' id='btn_menu'>Menu</h1></div>";
	
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

// Load Result
// Laddar resultat från local storage och printar ut en HTML tabell
//
//
function loadResult () {
	//localStorage.removeItem('result'); // Debug funktion för att rensa local storage

	// This routine will sort the array of objects to create a highscore list
	// We have to make sure that we copy the array and modify it rather than modify the existing result array
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
	
	return htmlCode;
}


function saveResult () {	
		localStorage.setItem('result', JSON.stringify(playerParams.result));
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



function mainMenu() {
	document.addEventListener('click', menuTrack, false);

	var htmlContent = "<div class='menuButtonsWrapper'><div id='addvisible' class='MenuButtons'>";
	htmlContent += "<button class='btn buttonInoutWrapper addButtonWrapper' id='btn_start'>Play</button>";
	htmlContent += "<button class='btn buttonInoutWrapper' id='btn_profile'>Profile</button>";
	htmlContent += "<button class='btn buttonInoutWrapper' id='btn_stats'>Stats</button>";
	htmlContent += "</div></div>";

	menu.innerHTML = htmlContent;
	

	setTimeout(animIcons, 200);

	function animIcons() {
		addvisible.className = addvisible.className + ' visible';
	}
	

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
      break;
      case "btn_stats":
      	menu.innerHTML = ""; 
      	document.removeEventListener('click', menuTrack);
      	showStats(); 
      break;    	
    }
 }
}

function showStats() {
	
	var statsHTML = closeButton();
	statsHTML += loadResult();
	stats.innerHTML = statsHTML;
	//initChart();

	document.addEventListener('click', statsTrack, false);

    function statsTrack (ev) {
    	switch (ev.target.id) {
	    	case "close":
	    		stats.innerHTML = "";
	    		document.removeEventListener('click', statsTrack);
	    		mainMenu();
	    	break;
	    }
    }
}

function closeButton() {
	return "<button class='close btn small' id='close'>X</button>";
}

function showProfile() {
	profile.innerHTML = closeButton();
    profile.innerHTML += "<div class='avatar' id='player_avatar'></div>";
    profile.innerHTML += "<div class='name' id='player_name'>" + playerParams.name + "</div>";
    
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

// En UI funktion som visar val av nBack
//
//
function showConfig () {
	var cells = "";
	for (i=2 ; i<=gameConfig.nBack ; i++) {
		cells += "<div id='" + i + " back' class='nback_select'>"+i+"</div>";
	}
	settings.innerHTML = cells;	
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
splashScreen();






	




