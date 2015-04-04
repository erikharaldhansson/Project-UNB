// Forced matching if no matches at round 8 
// Möjlighet att växla stimuli, ändra antal positioner
// Settings controls
// Förfina databasen så den innehåller ALLT vi behöver, och displayar som vi vill
// Pause-knapp


// Monte carlo simulation
// graphics


// Asset Loading
var img = new Image();
img.src = "assets/nback_start.png";

loading.style.display = "block";
loading.innerHTML = "<img src="+ img.src + "/>";

setTimeout(function(){
  loading.style.display = "none";
  menu.style.display = "block";
}, 3000);


var colorStim = {
  type: "color",
  values: ['Purple','Green','Orange','Yellow', 'Red', 'Pink','Aqua']
}

var audioStim = {
  type: "audio",
  values: ['Beer','Brandy','Champagne','Gin', 'Rum', 'Tequila','Vodka','Water','Whiskey','Wine']
}

var positionStim = {
  type: "position",
  values: ['gs0','gs1','gs2','gs3','gs4','gs5','gs6','gs7','gs8']
}


for( i=0 ; i<audioStim.values.length ; i++) {
  var audio = new Audio();
  var audioExt = (audio.canPlayType('audio/mpeg;')) ? "ogg":"mp3";  
  audio.src = 'stimuli/audio/'+ audioStim.values[i] + '.' + audioExt;    
  audioStim.values[i] = audio;       
}


var preStimuliOne = document.getElementById("stimuliOne").value; // Retrieves user choice of stimuli
var preStimuliTwo = document.getElementById("stimuliTwo").value;
var stimuliOne;  // Declaring variable for storing converted user choice as per the switch statement below
var stimuliTwo;


console.log(stimuliOne);
console.log(stimuliTwo);

var stimuli = [stimuliOne, stimuliTwo];

console.log(stimuli);



//  

var state = "menu";
var gameState = "stopped"; // Track playing game or not
var start;

var stimColor = ['Purple','Green','Orange','Yellow', 'Red', 'Pink','Aqua','Gray','Black'];
//var stimPosition = [gs1, gs2, gs3, gs4, gs5, gs6, gs7, gs8, gs9];
var stimPosition = [];
var levelArray = [];    //Empty array to store the stimuli of each round
var matchPercent = document.getElementById("settingMatchPercent").value; //Desired percent matches
var answerArr = []; //contains players answers
var matchArr = []; //contains number of matches
var wrongArr = []; //contains number of wrong clicks
var playedGames = [];
//var gameSquares = document.getElementById("settingSquares").value;

var stimPositionSetting = [];

//var back = document.getElementById("settingNBack").value; //Number of N-back
//var rounds = document.getElementById("settingRounds").value; //Number of rounds per game

var i; //Iterator for gameloop
var r; //Iterator for randomization
var synthMatch = null; // counts number of synthetic matches
var rndColor;
var rndPosition;
var progressCounter;

//localStorage.removeItem('playedgames');

var x;  //What round we are on
var rnd; //randomization number

// Default Player Settings (should only be here first time playing)
var playerSettings = {
  back    : 3,
  rounds  : 15,
  matches : 0.5,
  squares : 9
};

// Load player score
  //
  //
  var playedGames = JSON.parse(localStorage.getItem('playedgames')); // Try to get local storage item

// Load settings
  if (localStorage.getItem('playersettings')) {
    playerSettings = JSON.parse(localStorage.getItem('playersettings'));
  }
  
  document.getElementById("settingMatchPercent").value = playerSettings.matches;
  document.getElementById("settingRounds").value = playerSettings.rounds;
  document.getElementById("settingSquares").value = playerSettings.squares;
  document.getElementById("settingNBack").value = playerSettings.back;


function setupGame() {


  
    preStimuliOne = document.getElementById("stimuliOne").value; // Retrieves user choice of stimuli
    preStimuliTwo = document.getElementById("stimuliTwo").value;



  stimuli = [stimuliOne, stimuliTwo];

  matchPercent = playerSettings.matches;
  rounds = playerSettings.rounds;
  gameSquares = playerSettings.squares;
  back = playerSettings.back;

  x=0;
  i=0;  
  r=0;
  matchArr.length = 0;
  levelArray.length = 0;
  answerArr.length = 0;
  matchArr.length = 0;
  wrongArr.length = 0;
  synthMatch = null;
  rndColor = 0;
  rndPosition = 0;
  stimPosition.length = 0;
  score.setAttribute("value", 0); 


  rnd=0;


switch(preStimuliOne) {   // This switch statement only serves to convert the input from HTML from string to object,
                          // as I sadly found no other way!
case "positionStim":
stimuliOne = positionStim;
break;
case "colorStim":
stimuliOne = colorStim;
break;
case "audioStim":
stimuliOne = audioStim;
break;
default:
stimuliOne = positionStim;

}

switch(preStimuliTwo) {


case "positionStim":
stimuliTwo = positionStim;
break;
case "colorStim":
stimuliTwo = colorStim;
break;
case "audioStim":
stimuliTwo = audioStim;
break;
default:
stimuliTwo = positionStim;


}



stimuli = [stimuliOne, stimuliTwo];



  // generate game squares based on stimposition length
  //
  var squareshtml = "";
  for (i=0 ; i < gameSquares ; i++) {
    squareshtml += "<div class='gamesquare' id=\"" + 'gs'+i + "\"></div>"; 
    stimPosition.push('gs'+i);
    stimPositionSetting.push('gs'+stimPosition[i]);
    if(i === 2 || i === 5 || i === 8) {
      squareshtml += "<br>";
    }
  }
  //console.log(squareshtml);

  //console.log('this many stimpositions'+stimPosition);
  gamesquares.innerHTML = squareshtml;
  //

  //////////////////////////
  // Generate all the rounds
  for ( r=0 ; r<rounds ; r++ ) {       //Loop that enables percent matches per game to equal matchPercent, and 
                                       //generates random stimuli in the other cases, then pushes those positions to levelArray
    
    //console.log('r is' + r + 'and rnd is ' + rnd);                    //generates random stimuli in the other cases, then pushes those positions to levelArray
    if ((Math.random() < matchPercent) && (r >= (back))) {    // ATT GÖRA: LÄGG TILL ELSE IFS FÖR ATT GENERERA FORCED MATCHING AV BARA COLOR ELLER POSITION
    
      levelArray[r] = levelArray[r-back];
      matchArr.push(1);
      //console.log(levelArray[r-back]);
      synthMatch++;

    } else {        // ATT GÖRA: LÄGG IN TRACKING AV NATURLIGA MATCHES SOM PUSHAS TILL matchArr!!!!

      var rndStim = new Array();
      // Iterate through the stimuli options
      for (i=0 ; i<stimuli.length ; i++) {
       rndStim[i] = Math.floor(Math.random() * ( stimuli[i].values.length ));
       if ((r >= back) && rndStim[i] === levelArray[r-back][i]) matchArr.push(2); // A natural match on one stimuli 
      }

      levelArray.push(rndStim);
      //console.log(levelArray);

      if ((r >= back) && rndStim === levelArray[r-back]) matchArr.push(4) // A natural match on all stimuli        

    };

  };
    
  console.log (matchArr.length + ' matches in this round. Whereof '+synthMatch+' are synthetic, and '+(matchArr.length-synthMatch)+' are natural!'); //logs number of synthetic matches

};

document.addEventListener("change", changeTrack);
document.addEventListener('click', clickTrack, false); // Capture all click events with event listener
setupGame(); 

/////////////////////////////////////////////////////////////////////////////////////
//
//                     Here begins the function that sets color and position based on
//                     what's in levelArray
//
//


function setColor() {   //function to set color and position based on what's in levelArray, called by var start

  if (x <= rounds){ 

     //console.log('x is now at' + x);
    
    for (z = 0; z < stimPosition.length; z++) {
      
      document.getElementById(stimPosition[z]).style.backgroundColor = "white"; 
      document.getElementById(stimPosition[z]).style.transitionDuration = "2s";  // resets square before start of loop 
    }

    //console.log ('Round count ' + (x+1));
    //console.log ('Position ' + (levelArr[x][1]+1) + ' Color ' + colors[levelArr[x][0]]);
    if(x < rounds){  
      progressCounter = (x+1) + '/' + rounds;
      roundscount.innerHTML = progressCounter;
      currentBack.innerHTML = back+'-back';
      //console.log(levelArray);
      
      if (stimuli[1].type == "audio") stimuli[1].values[levelArray[x][1]].play();
      
      document.getElementById(stimPosition[levelArray[x][0]]).style.backgroundColor = stimColor[levelArray[x][1]];  // sets color and position for square
      document.getElementById(stimPosition[levelArray[x][0]]).style.transitionDuration = "1ms"; 
    };
                             
  } else {
      //console.log('Level complete, stopping engine');
      //console.log(answerArr);
      //console.log("interval "+ start);
      clearInterval(start); // stops engine after x is above rounds
      play.innerHTML = "Play";
      //console.log('Your scored '+answerArr.length+' right, out of '+matchArr.length+' possible!\n You had '+wrongArr.length+' incorrect answers.');  //logs number of correct answers
        document.getElementById("showResult").innerHTML = 'Your scored '+answerArr.length+' right, out of '+matchArr.length+' possible! <br> You had '+wrongArr.length+' incorrect answers.';
      
       //console.log('Your matchArr now contains '+matchArr); 
        var game = {
          time: Date(),
          scorepercent: ((answerArr.length)/(matchArr.length) + '%'),
          config: {
            nback: back,
            matchpercent: matchPercent
          }
        };     

        // Save this game in array of games for local storage
        playedGames.push(game);

        //console.log(playedGames);
        localStorage.setItem('playedgames', JSON.stringify(playedGames));  //stores number of correct answers in local file
    }
  x++;  // increments x on each run of the function setColor, called by setInterval in var start          
};



// Returns an HTML string with a table of results based on global variable playedGames which loads from local storage
function playedGamesHTML () {

  if (playedGames) {     // This conditional will display all your saved results in the gamescreen

    console.log (playedGames);

    game = "<table style='width:100%'><tr><td>Game</td><td>Date</td><td>Score</td><td>Back</td><td>Match Percent</td></tr>";

    for (y=0 ; y < playedGames.length; y++) {
      game += "<tr>";
      game += "<td>" + (y+1) + "</td>";
      game += "<td>" + playedGames[y].time + "</td>";
      game += "<td>" + playedGames[y].scorepercent + "</td>";
      game += "<td>" + playedGames[y].config.nback + "</td>";
      game += "<td>" + playedGames[y].config.matchpercent + "</td>";
      game += "</tr>";
    }
    game += "</table>";
    //console.log(game);
    return game;
  } else {
    playedGames = []; // Reinitialize to empty array so that the game can save to it
    return false;
  }

}

/////////////////
// Change Tracking
// Track when typing in certain forms to save the values
function changeTrack (ev) {  
  switch (ev.target.id) {
    case "settingNBack":      
      // Update global var
      playerSettings.back = ev.target.value;
      // Update local storage
      localStorage.setItem('playersettings', JSON.stringify(playerSettings)); 
      console.log(ev.target.id + ' ' + ev.target.value);
    break;
    case "settingMatchPercent":
      // Update global var
      playerSettings.matches = ev.target.value;
      // Update local storage
      localStorage.setItem('playersettings', JSON.stringify(playerSettings)); 
      console.log(ev.target.id + ' ' + ev.target.value);
    break;
    case "settingSquares":
      playerSettings.squares = ev.target.value;
      // Update local storage
      localStorage.setItem('playersettings', JSON.stringify(playerSettings)); 
      console.log(ev.target.id + ' ' + ev.target.value);
    break;
    case "settingRounds":
      playerSettings.rounds = ev.target.value;
      // Update local storage
      localStorage.setItem('playersettings', JSON.stringify(playerSettings)); 
      console.log(ev.target.id + ' ' + ev.target.value);
    break;
  }
}


/////////////////
// Click Tracking
// Track only when clicking on certain objects (id in this example)
//

function clickTrack (ev) {  
    switch (ev.target.id) {
      case "trackposition":
        if (gameState == "playing") {
          if (levelArray[x-1][0] == levelArray[x-back-1][0]) {  //checks if your click was correct
            console.log('Matched Position!');
            answerArr.push(1); // pushes correct answers to answerArr
            score.setAttribute("value", (answerArr.length/matchArr.length)*100);
          }
          else {
            wrongArr.push(1);
          }
          console.log('click pos at ' + x);        
        }

      break;
      case "trackcolor":
        if (gameState == "playing") {
          if (levelArray[x-1][1] == levelArray[x-back-1][1]) {
            console.log('Matched Color!');
            answerArr.push(1);
            score.setAttribute("value", (answerArr.length/matchArr.length)*100); 
          }
          else {
            wrongArr.push(1);
          }
          console.log('click col at ' + x);
        }       

      break;
      case "trackall":
        if (gameState == "playing") {
          if (levelArray[x-1][1] == levelArray[x-back-1][1] && levelArray[x-1][0] == levelArray[x-back-1][0]) {
            console.log('Matched all!');
            answerArr.push(1);
            score.setAttribute("value", (answerArr.length/matchArr.length)*100); 
          }
          else {
            wrongArr.push(1);
          }
          console.log('click all at ' + x);
        }        

      break;
      case "play":        
        switch (gameState) {
          case "stopped":
            play.innerHTML = "Pause";
            gameState = "playing";
            setupGame();
            start = setInterval(function(){ setColor() }, 2000); // starts engine, runs it every 2 seconds
          break;
          case "playing":
            console.log("received playing");
            play.innerHTML = "Play";
            gameState = "paused";
            clearInterval(start);
          break;
          case "paused":
            play.innerHTML = "Pause";
            gameState = "playing";
            start = setInterval(function(){ setColor() }, 2000); // starts engine, runs it every 2 seconds
          break;
        }          
      break;
      case "restart":
        console.log('matchArr is '+matchArr);
        console.log(JSON.stringify(start));

        gameState = "playing";
        play.innerHTML = "Pause";        
        clearInterval(start); // stops engine after x is above rounds
        document.getElementById("showResult").innerHTML = "";
        setupGame();
        start = setInterval(function(){ setColor() }, 2000); // starts engine, runs it every 2 seconds
      break;
      case "stop":
        clearInterval(start);
        play.innerHTML = "Play";
        gameState = "stopped";        
      break;
      case "menu_score":        
        state = "score";
        scores.style.display = "block";
        closer.style.display = "block";
        
        scores.innerHTML = playedGamesHTML();
      break;
      case "menu_playgame":
        state = document.getElementById(state);
        state.style.display = "none";
        state = "play";
        gameState="playing";
        play.style.display = "block";
        setupGame();
        start = setInterval(function(){ setColor() }, 2000); // starts engine, runs it every 2 seconds
      break;
      case "closer":
        scores.style.display = "none";
        closer.style.display = "none";
      break;
    }

};


