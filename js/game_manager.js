function GameManager(size, InputManager, Actuator, fitness, gameArray, child1w1, child2w1) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.indexGame = 0;
  this.generation = 1;

  this.popSize = 2;
  this.genSize = 3;

  this.fitness = [];
  this.parentFitness = [];
  this.childFitness = [];
  this.survivalFitness = [];

  this.gameArray = new Array (this.popSize);
  this.parentArray = new Array (this.popSize);
  this.childArray = new Array (this.popSize);;

  this.Parent = [];
  this.child1 = [];
  this.child2 = [];
  this.child3 = [];
  this.child4 = [];
  this.child5 = [];
  this.child6 = [];
  this.child7 = [];
  this.child8 = [];
  this.child9 = [];
  this.child10 = [];

  this.running      = false;
  this.gen1         = false;
  this.isParent     = true; //this.isParent = false; >>means child

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
  this.message = " ";
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
  this.grid = new Grid(this.size);
  this.grid.addStartTiles();
  console.log("Game number: " + this.indexGame + " Generation: " + this.generation);

  var w1, w2;
  if(this.generation == 1) { // if (this.gen1 = true)
    w1 = this.setRandWeight1();
    w2 = this.setRandWeight2();   
  }
  else if (this.isParent == true){
    w1 = this.childArray[this.indexGame][0];
    w2 = this.childArray[this.indexGame][1];
  }
  else if (this.isParent == false) {
    w1 = this.Parent[this.indexGame][0];
    w2 = this.Parent[this.indexGame][1];
  }

  this.ai = new AI(this.grid, null, w1, w2);

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
    //console.log("Check array: " + this.gameArray[this.indexGame]);
    this.fitness[this.indexGame] = this.setFitness(this.indexGame);
    this.indexGame++;

    if(this.indexGame <= (this.popSize - 1)){ // stop at 10th game
      var self = this;
      setTimeout(function(){self.restart();}, 3000);// game restart by its own 
      //this.parentArray = this.gameArray;
    }
    //parent selection
    if(this.indexGame == this.popSize && this.isParent == true){ //1 generation ends and produce child
      for (var i = 0; i < this.fitness.length; i++) {
        this.parentFitness[i] = this.fitness[i]
      };
       
      this.parentArray = this.gameArray;
      console.log("parentArray: " + this.parentArray);
      var x = this.crossOver();
      this.child1 = x[0];
      this.child2 = x[1];
      // var x1 = this.crossOver();
      // this.child3 = x1[0];
      // this.child4 = x1[1];
      // var x2 = this.crossOver();
      // this.child5 = x2[0];
      // this.child6 = x2[1];
      // var x3= this.crossOver();
      // this.child7 = x3[0];
      // this.child8 = x3[1];
      // var x4= this.crossOver();
      // this.child9 = x4[0];
      // this.child10 = x4[1];
      
      this.childArray = this.setChildArray(); 
      //print to html when finish one generation
      var ms = " ";
      ms = "Generation: " + this.generation + " Parent Fitness: " + this.parentFitness;
      this.actuator.myConsole1(ms);
      this.fitness = [];
      this.indexGame = 0;
      this.isParent = false;

      
      var self = this;
      setTimeout(function(){self.restart();}, 3000);// game restart by its own 
    }

    if(this.indexGame == 2 && this.isParent == false && this.generation < this.genSize){ 
      //do survival selection among parent and child
      for (var i = 0; i < this.fitness.length; i++) {
        this.childFitness[i] = this.fitness[i]
      };
      this.childArray = this.gameArray;
      console.log("parentArray: " + this.parentArray + "childArray: " + this.childArray);
      var survivalArr = []; //survivalArr - combination of parent array and child array
      survivalArr = this.parentArray;
      survivalArr = survivalArr.concat(this.childArray);
      console.log("survivalArr: " + survivalArr);

      var survived = new Array(this.popSize);
      survived = this.survialSelection(this.parentFitness, this.childFitness);

      var individual = new Array(this.popSize); //those individual survived only

      for(var i = 0; i < this.popSize ; i++){
        var index = survived[i];
        individual[i] = survivalArr[index];
        console.log("individual[i]: " + individual[i]);
      }
      // this.Parent = this.setParentArray(individual);
      this.Parent = individual;

      this.indexGame = 0;
      this.generation++;
      console.log("generation: " + this.generation);

      this.isParent = true;
      //print to html when finish one generation
      var ms1 = "Generation: " + this.generation + " Parent Fitness: " + this.parentFitness + " Child Fitness" + this.childFitness;
      this.actuator.myConsole2(ms1);
      var self = this;
      setTimeout(function(){self.restart();}, 3000);// game restart by its own 
    }
    //stop the EA
    //if(this.generation == this.genSize ) this.actuator.myConsole10("Generation " + this.generation + "<br>EA is finished");

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

GameManager.prototype.setRandWeight1 = function(){

  //generate weight
  var weight1 = new Array(30);
  for (var i = 0; i < 30; i++) {
    weight1[i] = new Array(17);
  }

  for (var i = 0; i <30; i++) {
    for (var j = 0; j <17; j++) {
      weight1[i][j] = Math.round((Math.random()*2-1) *100) / 100;
      console.log("weight1: " + weight1[i][j]);        
    }
  }
  return weight1;   
}

GameManager.prototype.setRandWeight2 = function(){
  //generate weight
  var weight2 = new Array(4);
  for (var i = 0; i < 4; i++) {
    weight2[i] = new Array(30);
  }

  for (var i = 0; i <4; i++) {
    for (var j = 0; j <30; j++) {
      weight2[i][j] = Math.round((Math.random()*2-1) *100) / 100;
      console.log("weight2: " + weight2[i][j]);        
    }
  }
  return weight2;   
}
GameManager.prototype.setGameArr = function() {

  var game = new Array (this.popSize);
  for (var i = 0; i < this.popSize; i++) { 
    game[i] = new Array(3);
  };
  var weight1 = this.ai.getWeight1();
  var weight2 = this.ai.getWeight2();
  var score = this.score; 
  for (var i = 0; i <this.popSize; i++) {
    game[i][0] = weight1;
    game[i][1] = weight2;
    game[i][2] = score;
  }
  //console.log("Check this.gameArray: " + game[0]);
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
  //console.log("fitness array: "+fitness);
  var fitness_sum = 0;
  //calculate sum of all fitness
  for (var i = 0; i <fitness.length; i++) {
    if (fitness[i] == null) fitness[i] = 0;
    fitness_sum +=fitness[i];
    console.log("sum = "+fitness_sum);
  }
  
  // get random value
  var r = Math.random()*fitness_sum;
  console.log("random" + r);
  
  var F = fitness[0];
  var k = 0;

  while (F < r){
    k++;
    F += fitness[k];
  }

  var parent = k;
  return parent;
}

GameManager.prototype.crossOver = function (){
  var parent1 = this.rouletteSelect(this.fitness);
  var parent2 = this.rouletteSelect(this.fitness);

  while(parent2 == parent1) parent2 = this.rouletteSelect(this.fitness); //make sure the parent are different.
  console.log("Parent1 = " + parent1);
  console.log("Parent2 = " + parent2);

  var p1weight1 = new Array(30);
  var p2weight1 = new Array(30);
  var p1weight2 = new Array(4);
  var p2weight2 = new Array(4);

  for (var i = 0; i < 30; i++) {
    p1weight1[i] = this.gameArray[parent1][0][i];
    p2weight1[i] = this.gameArray[parent2][0][i];
  };

  for (var i = 0; i < 4; i++) {
    p1weight2[i] = this.gameArray[parent1][1][i];
    p2weight2[i] = this.gameArray[parent2][1][i];
  };
  console.log("p1weight1: " + p1weight1); 
  console.log("p2weight1: " + p2weight1); 
  console.log("p1weight2: " + p1weight2); 
  console.log("p2weight2: " + p2weight2); 

  var p1w1c2 = p1weight1.splice(15); //get out the other half of weight 1
  var p1w1c1 = p1weight1;//let the remainder of weight 1 be the chromosome 1
  var p2w1c2 = p2weight1.splice(15);
  var p2w1c1 = p2weight1; 

  var p1w2c2 = p1weight2.splice(2); //get out the other half of weight 1
  var p1w2c1 = p1weight2;//let the remainder of weight 1 be the chromosome 1
  var p2w2c2 = p2weight2.splice(2);
  var p2w2c1 = p2weight2; 

  console.log("p1w1c1: " + p1w1c1);
  console.log("p1w1c2: " + p1w1c2);
  console.log("p2w1c1: " + p2w1c1);
  console.log("p2w1c2: " + p2w1c2);

  console.log("p1w2c1: " + p1w2c1);
  console.log("p1w2c2: " + p1w2c2);
  console.log("p2w2c1: " + p2w2c1);
  console.log("p2w2c2: " + p2w2c2);

  child1w1 = p1w1c1.concat(p2w1c2);
  child1w2 = p1w2c1.concat(p2w2c2);
  child2w1 = p2w1c1.concat(p1w1c2);
  child2w2 = p2w2c1.concat(p1w2c2);

  //do mutation
  this.swapMutation(child1w1);
  this.swapMutation(child1w1);
  this.swapMutation(child2w1);
  this.swapMutation(child2w2);

  var child1 = [child1w1, child1w2];
  var child2 = [child2w1, child2w2];

  return [child1, child2];  
}

GameManager.prototype.swapMutation = function(childw1){
  var r = Math.random();
  var a = childw1[Math.round(Math.random()*30)];
  var b = childw1[Math.round(Math.random()*30)];
  var temp;
  
  if(r < 0.05){
    temp = a;
    a = b;
    b = temp;
    console.log("Mutation done: <br>" + a + "<br>" + b);//////////////problem here
  }

}

//set the retrieve child into an array
GameManager.prototype.setChildArray = function(){
  var child = new Array (10);
  for (var i = 0; i < 10; i++) { 
    child[i] = new Array(2);
  };
  child[0] = this.child1;
  child[1] = this.child2;
  child[2] = this.child3;
  child[3] = this.child4;
  child[4] = this.child5;
  child[5] = this.child6;
  child[6] = this.child7;
  child[7] = this.child8;
  child[8] = this.child9;
  child[9] = this.child10;

  return child;
}

//setParentArray retrieved parent from move 
GameManager.prototype.setParentArray = function(individual){
  var parent = [];
  for (var i = 0; i < parent.length; i++) {
    parent[i] = individual[i];
    console.log("Parent: " + parent[i]);
  };
  return parent;
}
GameManager.prototype.getParentArray = function(){

}

GameManager.prototype.survialSelection = function(parentFitness, childFitness){
  var survivalFitness = [];
  survivalFitness = parentFitness.concat(childFitness);
  console.log("survivalFitness: " + survivalFitness)
  var survived = new Array(this.popSize);
  for(var i = 0; i < this.popSize ; i++){
    survived[i] = this.rouletteSelect(survivalFitness);
  }
  console.log("survived: " + survived);
  return survived;
}
//"weight1[" + i + "][" + j + "]" +
//if gen=1, gameindex=1, weight1 and weight2 is random number
