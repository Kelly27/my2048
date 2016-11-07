function GameManager(size, InputManager, Actuator, indexGame, fitness, gameArray, child1w1, child2w1) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.indexGame = indexGame; //number of game
  this.indexGame = 1;
  this.fitness = [];
  this.gameArray = new Array (10);
  this.child1w1 = child1w1;
  this.child2w1 = child2w1;  

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
  console.log("Game number: " + this.indexGame);

  this.ai           = new AI(this.grid);

  this.score        = 0;
  this.over         = false;
  this.won          = false;
  
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
    
    this.gameArray[this.indexGame] = this.setGameArr()[this.indexGame];
    console.log("Check array: " + this.gameArray[this.indexGame]);
    this.fitness[this.indexGame] = this.setFitness(this.indexGame);
    this.indexGame++;

    if(this.indexGame <= 10){ // stop at 10th game
      var self = this;
      setTimeout(function(){self.restart();}, 3000);// game restart by its own 
    }
    //parent selection
    if(this.indexGame == 11){
      var parent1 = this.rouletteSelect(this.fitness);
      var parent2 = this.rouletteSelect(this.fitness);

      while(parent2 == parent1) parent2 = this.rouletteSelect(this.fitness); //make sure the parent are different.
      console.log("Parent1 = " + parent1);
      console.log("Parent2 = " + parent2);
      this.crossOver(parent1, parent2);
      
    }
  }
    this.actuator.myConsole("Fitness: "+ this.fitness + "<br>Parent 1: " + parent1 +  "<br>Parent 2: " + parent2);
    
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
    game[i][0] = weight1;
    game[i][1] = weight2;
    game[i][2] = score;
  }
  return game;
}

//get data structure score
GameManager.prototype.setFitness = function(indexGame){
  var i = indexGame;
  var fitness = this.setGameArr()[i][2];
  console.log("fitness[" + i + "] = " + fitness);
  return fitness;
}

GameManager.prototype.rouletteSelect = function (fitness){
  console.log("fitness array: "+fitness);
  var fitness_sum = 0;
  //calculate sum of all fitness
  for (var i = 0; i <11; i++) {
    if (fitness[i] == null) fitness[i] = 0;
    fitness_sum +=fitness[i];
    console.log("sum = "+fitness_sum);
  }
  
  // get random value
  var r = Math.random()*fitness_sum;
  console.log("random" + r);
  
  var F = fitness[1];
  var k = 1;

  while (F < r){
    k++;
    F += fitness[k];
  }

  var parent = k;
  return parent;
}

GameManager.prototype.crossOver = function (parent1, parent2){
  var p1weight1 = this.gameArray[parent1][0];
  var p2weight1 = this.gameArray[parent2][0];
  // console.log("check array: " + this.gameArray[parent1][0]);

  var p1c2 = p1weight1.splice(14); //get out the other half of weight 1
  var p1c1 = p1weight1;//let the remainder of weight 1 be the chromosome 1
  var p2c2 = p2weight1.splice(14);
  var p2c1 = p2weight1; 

  
  // console.log("p1c1: " + p1c1);
  // console.log("p1c2: " + p1c2);
  // console.log("p2c1: " + p2c1);
  // console.log("p2c2: " + p2c2);

  this.child1w1 = p1c1.concat(p2c2);
  this.child2w1 = p1c2.concat(p2c1);

  //do mutation
  this.swapMutation(this.child1w1);
  this.swapMutation(this.child2w1);
  //return [child1w1, child2w1];  
}

GameManager.prototype.swapMutation = function(childw1){
  var r = Math.random();
  var a = childw1[Math.round(Math.random()*30)];
  var b = childw1[Math.round(Math.random()*30)];
  var temp;
  
  if(r < 0.1){
    temp = a;
    a = b;
    b = temp;
    console.log("Mutation done: <br>" + a + "<br>" + b);
  }

}
//"weight1[" + i + "][" + j + "]" +