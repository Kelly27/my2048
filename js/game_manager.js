function GameManager(size, InputManager, Actuator, fitness, gameArray, child1w1, child2w1) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.indexGame = 0;
  this.generation = 1;

  this.popSize = 10;
  this.genSize = 50;

  this.fitness = [];
  this.parentFitness = [];
  this.childFitness = [];
  this.survivalFitness = [];

  this.gameArray = new Array (this.popSize);
  this.parentArray = new Array (this.popSize);
  this.childArray = new Array (this.popSize); // dont score with score
  this.childArray2 = new Array(this.popSize); //store with score

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
  this.isFirstGen     = true; //this.isFirstGen = false; >>means child

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
Math.seed = 7;
Math.seededRandom = function() {

    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
 
    return rnd;
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
  if(this.generation == 1 && this.isFirstGen == true) { // if (this.generation 1  = true)
    w1 = this.setRandWeight1();
    w2 = this.setRandWeight2();   
  }
  else if (this.generation == 1 && this.isFirstGen == false) {
    w1 = this.childArray[this.indexGame][0];
    w2 = this.childArray[this.indexGame][1];
    console.log("This is Child.");
    console.log("Check child Array: " + "["+this.indexGame+"]" + this.childArray[this.indexGame]);
  }
  else if (this.generation >= 1 && this.generation <= this.genSize && this.isFirstGen == false) {
    w1 = this.childArray[this.indexGame][0];
    w2 = this.childArray[this.indexGame][1];
    console.log("This is Child.");
    console.log("Check child Array: " + "["+this.indexGame+"]" + this.childArray[this.indexGame]);
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
    if(this.indexGame == this.popSize && this.generation == 1 && this.isFirstGen == true){ //1 generation ends and produce child

      for (var i = 0; i < this.fitness.length; i++) {
        this.parentFitness[i] = this.fitness[i]
      };
      
      for (var i = 0; i < this.popSize; i++) {
        this.parentArray[i] = this.gameArray[i]
      };

      console.log("parentArray: " + this.parentArray);

      var s = " ";
      for(var i = 0; i < this.popSize ; i++){
        s += "[" + i + "]" + this.parentArray[i][2];
      }

      var sum = 0;
      for(var i = 0; i < this.popSize ; i++){
        sum+= this.parentArray[i][2];
      }
      var av = sum/this.popSize;

      if(this.generation == 1) this.actuator.myConsole1("Generation: " + this.generation + "current (fitness): " + s + "Average fitness: " + av);

      var x = this.crossOver(this.parentFitness, this.parentArray); //modify here if number of population is not 10
      this.child1 = x[0];
      this.child2 = x[1];
      var x1 = this.crossOver(this.parentFitness, this.parentArray);
      this.child3 = x1[0];
      this.child4 = x1[1];
      var x2 = this.crossOver(this.parentFitness, this.parentArray);
      this.child5 = x2[0];
      this.child6 = x2[1];
      var x3= this.crossOver(this.parentFitness, this.parentArray);
      this.child7 = x3[0];
      this.child8 = x3[1];
      var x4= this.crossOver(this.parentFitness, this.parentArray);
      this.child9 = x4[0];
      this.child10 = x4[1];

      this.childArray = this.setChildArray(this.parentFitness, this.parentArray); 

      this.fitness = [];
      this.indexGame = 0;
      this.isFirstGen = false;
      this.gameArray = new Array(this.popSize);
      var self = this;
      setTimeout(function(){self.restart();}, 3000);// game restart by its own 
    }

    if(this.indexGame == this.popSize && this.generation>= 1 && this.generation < this.genSize){ //do parent selection among parent and child, then select the next generation parent
      //do survival selection among parent and child
      for (var i = 0; i < this.fitness.length; i++) {
        this.childFitness[i] = this.fitness[i]
      };
      for (var i = 0; i < this.popSize; i++) {
        this.childArray2[i] = this.gameArray[i];
      };
      console.log("parentArray: " + this.parentArray + "childArray: " + this.childArray2);

      var survivalArr = new Array(this.popSize*2); //survivalArr - combination of parent array and child array
      for (var i = 0; i < this.popSize; i++) {
        survivalArr[i] = this.parentArray[i];
      };
      for (var i = this.popSize; i < this.popSize*2; i++) {
        survivalArr[i] = this.childArray2[i-this.popSize];
      };
      // survivalArr = (this.parentArray).concat(this.childArray2);
      
      for (var i = 0; i < survivalArr.length; i++) {
        console.log("survivalArr[" + i + "]: " + survivalArr[i]);
      };

      var survived = new Array(this.popSize);
      survived = this.survivalSelection(this.parentFitness, this.childFitness);

      var individual = new Array(this.popSize); //those individual survived only

      var ms2 = " ";
      for(var i = 0; i < this.popSize ; i++){
        ms2 += " [" + i + "] " + this.childArray2[i][2];
      }
      //print to html when finish one generation
      var ms = " ";
      ms = "Generation: " + this.generation + "Child(Fitness): " + ms2;
      this.actuator.myConsole1(ms);

      for(var i = 0; i < this.popSize ; i++){
        var index = survived[i];
        individual[i] = survivalArr[index];
        console.log("individual[i]: " + individual[i]);
      }

      for (var i = 0; i < individual.length; i++) {
        this.parentArray[i] = individual[i];
        this.parentFitness[i] = this.parentArray[i][2];
        console.log("parentArray[" + i + "]: " + this.parentArray[i]);
      };

      var s = " ";
      for(var i = 0; i < this.popSize ; i++){
        s += "[" + i + "]" + this.parentArray[i][2];
      }

      var q1 = this.crossOver(this.parentFitness, this.parentArray); //modify here if number of population is not 10
      this.child1 = q1[0];
      this.child2 = q1[1];
      var q2 = this.crossOver(this.parentFitness, this.parentArray);
      this.child3 = q2[0];
      this.child4 = q2[1];
      var q3 = this.crossOver(this.parentFitness, this.parentArray);
      this.child5 = q3[0];
      this.child6 = q3[1];
      var q4= this.crossOver(this.parentFitness, this.parentArray);
      this.child7 = q4[0];
      this.child8 = q4[1];
      var q5= this.crossOver(this.parentFitness, this.parentArray);
      this.child9 = q5[0];
      this.child10 = q5[1];

      this.childArray = this.setChildArray(); 

      this.generation++;
      console.log("next generation: " + this.generation);

      var mss = " ";
      for(var i = 0; i < this.popSize ; i++){
        mss += " [" + i + "]: " + this.parentArray[i][2];
      }
      var sum = 0;
      for(var i = 0; i < this.popSize ; i++){
        sum+= this.parentArray[i][2];
      }
      var av = sum/this.popSize;

      //print to html when finish one generation
      //var ms1 = "Generation: " + this.generation + " Parent Fitness: " + individual[this.indexGame][2] + " Child Fitness" + this.childFitness;
      var ms1 = "Generation: " + this.generation + " new Fitness: " + mss + "Average fitness: " + av;
      this.actuator.myConsole1(ms1);
      this.indexGame = 0;
      this.gameArray = new Array(this.popSize);

      this.isFirstGen = false;

      var self = this;
      setTimeout(function(){self.restart();}, 3000);// game restart by its own 
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

GameManager.prototype.setRandWeight1 = function(){

  //generate weight
  var weight1 = new Array(30);
  for (var i = 0; i < 30; i++) {
    weight1[i] = new Array(17);
  }

  for (var i = 0; i <30; i++) {
    for (var j = 0; j <17; j++) {
      weight1[i][j] = Math.round((Math.seededRandom()*2-1) *100) / 100;
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
      weight2[i][j] = Math.round((Math.seededRandom()*2-1) *100) / 100;
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
  };
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
  console.log("fitness array: "+fitness);
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

GameManager.prototype.crossOver = function (fitness, arr){
  var parent1 = this.rouletteSelect(fitness);
  var parent2 = this.rouletteSelect(fitness);

  while(parent2 == parent1) parent2 = this.rouletteSelect(fitness); //make sure the parent are different.
  console.log("Parent1 = " + parent1);
  console.log("Parent2 = " + parent2);

  var p1weight1 = new Array(30);
  var p2weight1 = new Array(30);
  var p1weight2 = new Array(4);
  var p2weight2 = new Array(4);

  for (var i = 0; i < 30; i++) {
    p1weight1[i] = arr[parent1][0][i];
    p2weight1[i] = arr[parent2][0][i];
  };

  for (var i = 0; i < 4; i++) {
    p1weight2[i] = arr[parent1][1][i];
    p2weight2[i] = arr[parent2][1][i];
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
  this.swapMutation1(child1w1);
  this.swapMutation2(child1w2);
  this.swapMutation1(child2w1);
  this.swapMutation2(child2w2);

  var child1 = [child1w1, child1w2];
  var child2 = [child2w1, child2w2];

  return [child1, child2];  
}

GameManager.prototype.swapMutation1 = function(child){
  var r = Math.random();
  var r1 = Math.round(Math.random()*29);
  var r2 = Math.round(Math.random()*29);
  var temp;
  
  if(r < 0.05){
    console.log("Before mutation: " + child);
    temp = child[r1];
    child[r1] = child[r2];
    child[r2] = temp;
    console.log("r1 value: " + r1 + "r2 value: " + r2 );
    for(var i = 0; i < child.length; i++){
      console.log("After mutation ["+ i + "]: " + child[i]); 
      } 
  }
}
GameManager.prototype.swapMutation2 = function(child){
  
  var r = Math.random();
  var r1 = Math.round(Math.random()*3);
  var r2 = Math.round(Math.random()*3);
  var temp;
  
  if(r < 0.05){
    console.log("Before mutation: " + child);
    temp = child[r1];
    child[r1] = child[r2];
    child[r2] = temp;
    console.log("r1 value: " + r1 + "r2 value: " + r2 );
    for(var i = 0; i < child.length; i++){
      console.log("After mutation ["+ i + "]: " + child[i]); 
      } 
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

GameManager.prototype.survivalSelection = function(parentFitness, childFitness){
  var survivalFitness = [];
  survivalFitness = parentFitness.concat(childFitness);
  console.log("survivalFitness: " + survivalFitness)
  var survived = new Array(this.popSize);
  for(var i = 0; i < this.popSize ; i++){
    survived[i] = this.rouletteSelect(survivalFitness);
  }
  console.log("before sort: " + survived);
  var j = 0;
  while(j < this.popSize){
    survived.sort();
    if(survived[j] == survived[j-1]) {
      console.log("After sort: " + survived);
      survived[j] = this.rouletteSelect(survivalFitness);
      j = 1;
    }
    j++
  }
  console.log("survived: " + survived);
  return survived;
}
//"weight1[" + i + "][" + j + "]" +
//if gen=1, gameindex=1, weight1 and weight2 is random number
