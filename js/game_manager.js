function GameManager(size, InputManager, Actuator, indexGame) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.indexGame = indexGame; //number of game

  this.indexGame = 1;

  this.running      = false;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on('think', function() {
    var best = this.ai.getBest();
    this.actuator.showHint(best.move);
  }.bind(this));


  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('Auto-run');
    } else {
      this.running = true;
      this.run();
      this.actuator.setRunButton('Stop');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('Auto-run');
  this.setup();
  if (this.running) {
    this.running = false;
    this.actuator.setRunButton('Auto-run');
  } else {
    this.running = true;
    this.run();
    this.actuator.setRunButton('Stop');
  }
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addStartTiles();

  this.ai           = new AI(this.grid);

  this.score        = 0;
  this.over         = false;
  this.won          = false;
  console.log("Game number: " + this.indexGame);
  // Update the actuator
  this.actuate();
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });
};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
    }
  } else {
    this.won = true;
  }

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
    
    /*
    access Index of game: gameArr[a]
    access weight1: gameArr[a][0]
    access weight2: gameArr[a][1]
    access score: gameArr[a][2]
    */
    var gameArray = new Array(10); 
    gameArray[this.indexGame] = this.setGameArr()[this.indexGame];

    //console.log("test: " + );

    this.indexGame++;

    if(this.indexGame <= 10){ // stop at 10th game
      var self = this;
      setTimeout(function(){self.restart();}, 3000);// game restart by its own 
    }
    //parent selection
    if(this.indexGame == 10){
      console.log("Parent - " + this.rouletteSelect());
    }
  }

  
  this.actuate();
}

// moves continuously until game is over
GameManager.prototype.run = function() {
  var best = this.ai.getBest();
  this.move(best.move);
  var timeout = animationDelay;
  if (this.running && !this.over && !this.won) {
    var self = this;
    setTimeout(function(){
      self.run();
    }, timeout);
  }
}

GameManager.prototype.setGameArr = function() {
  var game = new Array (10);
  for (var i = 1; i <= 10; i++) { 
    game[i] = new Array(3);
  };
  var weight1 = this.ai.getWeight1();
  var weight2 = this.ai.getWeight2();
  var score = this.score; 
  for (var i = 1; i <=10; i++) {
    game[i][0] = "weight1 test1: " + weight1;
    game[i][1] = "weight2 test2: " + weight2;
    game[i][2] = "score:" + score;
  }
  //console.log("score test:" + game[0][2]);
  return game;
}

GameManager.prototype.rouletteSelect = function (){
  var fitness = new Array(10);
  for (var i = 1; i <=10; i++) {
   fitness[i] = this.setGameArr()[i][2];
  };
  var fitness_sum = 0;
  //calculate sum of all fitness
  for (var i = 1; i <=10; i++) {
    fitness_sum+=fitness;
  }

  // get random value
  var r = Math.random()*fitness_sum;
  //console.log(fitness_sum);
  
  var F = fitness[1];
  var k = 1;

  while (F < r){
    k++;
    F += fitness(k);
  }

  var Parent = k;
  return Parent;
}
//"weight1[" + i + "][" + j + "]" +