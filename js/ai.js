function AI(grid,prevInput,weight1, weight2) {  //xiaoli(move)
  this.grid = grid;
  this.prevInput = prevInput;
  //this.weight1 = this.setWeight1();
  //this.weight2 = this.setWeight2();
  this.weight1 = weight1;
  this.weight2 = weight2;
  this.counterAfMax = 0;     //xiaoli(move)
}

AI.prototype.setInput = function(){
  var input =[];
    for(var i=0; i < 4; i++){
      for(var j=0; j < 4; j++){
        if(this.grid.cells[j][i] !== null){
          var v = this.grid.cells[j][i].value;
          //- console.log(v);
          input = input.concat(v);
        }
        else{
          v = 0;
          input = input.concat(v);
        }
      }
    }
  input = input.concat(1);
  // -console.log(input);
  return input;
}

// AI.prototype.setRandWeight1 = function(){

//   //generate weight
//   var weight1 = new Array(30);
//   for (var i = 0; i < 30; i++) {
//     weight1[i] = new Array(17);
//   }

//   for (var i = 0; i <30; i++) {
//     for (var j = 0; j <17; j++) {
//       weight1[i][j] = Math.round((Math.random()*2-1) *100) / 100;
//       console.log("weight1: " + weight1[i][j]);        
//     }
//   }
//   return weight1;   
// }

// AI.prototype.setRandWeight2 = function(){
//   //generate weight
//   var weight2 = new Array(4);
//   for (var i = 0; i < 4; i++) {
//     weight2[i] = new Array(30);
//   }

//   for (var i = 0; i <4; i++) {
//     for (var j = 0; j <30; j++) {
//       weight2[i][j] = Math.round((Math.random()*2-1) *100) / 100;
//       console.log("weight2: " + weight2[i][j]);        
//   }
//   }
//   return weight2;   
// }

AI.prototype.getWeight1 = function(){
  return this.weight1;
}

AI.prototype.getWeight2 = function(){
  return this.weight2;
}

//calculate r value for input-hidden
AI.prototype.calcRvalue1 = function(input, weight1) {
  var sum = new Array (30);
  // -console.log("r value:")
  for(var i =0; i<30; i++){
    var a = 0;
    for(var j=0; j<17; j++){
      a += Math.round((weight1[i][j] * input[j]) *100) / 100;
      sum[i] = a;        
    }
    // -console.log(a);
  }
  return sum;
}

//calculate r value for hidden-output
AI.prototype.calcRvalue2 = function(hidden, weight2) {
  var sum = new Array (4);
  // -console.log("r value 2:")
  for(var i =0; i<4; i++){
    var a = 0;
    for(var j=0; j<30; j++){
      a += Math.round((weight2[i][j] * hidden[j]) *100) / 100;
      sum[i] = a;
    }
    // -console.log(a);
  }
  return sum;
}

AI.prototype.checkValidMove = function(input, prevInput){ //////////////////////////////
  var flag = true;
  for (var i = 0; i < input.length; i++) {
    if (prevInput[i] !== input[i]){  //input different, valid move
      flag = true;
      // console.log("not same - prevInput["+i+"]: " + prevInput[i] + " ; input["+i+"]:" + input[i]);
      //console.log(flag);      xiaoli
      break;
    }
    else if (prevInput[i] === input[i]){
      flag = false;//invalid move
      // console.log("same - prevInput["+i+"]: " + prevInput[i] + " ; input["+i+"]:" + input[i]);
      //console.log(flag);    xiaoli

    }
  }
  return flag;
}

AI.prototype.getBest = function() {
  var hidden = [];
  var output = [];
  var input = this.setInput();
  //var prevInput = [];
  // -console.log("Counter: "+this.counterAfMax);  //xiaoli(move)
  //r value in array for the equation 1/(1+e^-r) [input-hidden]
  var r = new Array(30);
  r = this.calcRvalue1(input, this.getWeight1());

  // -console.log("hidden value");
  //get hidden value where hidden = 1/(1+e^-r)
  for(var i=0; i < r.length; i++){
    hidden[i] = 1/(1+Math.exp(-r[i]));
    hidden[i] = Math.round(hidden[i]*100)/100;
    // -console.log(hidden[i]);
  }

  //console.log("r value(hidden)");

  //r value in array for the equation 1/(1+e^-r) [hidden-output]
  var r2 = new Array(4);
  r2= this.calcRvalue2(hidden, this.getWeight2());
  // -console.log(r2)

  console.log("output");
  //get output value where output = 1/(1+e^-r)
  for(var i=0; i < r2.length; i++){
      output[i] = 1/(1+Math.exp(-r2[i]));
      output[i]=Math.round(output[i]*100)/100;
      console.log(output[i]);
  }
  
  //check next valid move
  if(this.prevInput== null|| this.checkValidMove(input, this.prevInput) == true){ //valid move
    // console.log("Valid move");
    // console.log("previous input: " + this.prevInput + "(null or not same)");
    this.prevInput = input;
    // console.log("new previous input: " + this.prevInput);
    ////direction-sort biggest value in array m
    var m = output.indexOf(Math.max.apply(null, output));
    // console.log("max output: " + m);
    this.counterAfMax = 0;   //xiaoli(move)
    return {move:[m]};
  }
  else if(this.checkValidMove(input, this.prevInput) == false && this.counterAfMax == 0){ // invalid move, attempt 2nd biggest output
    // console.log("invalid move");
    // console.log("previous input: " + this.prevInput + " is same with input: " + input);
    var maxIndex = output.indexOf(Math.max.apply(null, output));   //take the index of max
    output[maxIndex] = -Infinity; //replace the max to -infinity
    var m2 = output.indexOf(Math.max.apply(null, output)); // get the 2nd max
    // console.log("2nd max output: " + m2);
    this.counterAfMax++;   //xiaoli(move)
    return {move:[m2]};
  }
  else if(this.checkValidMove(input, this.prevInput) == false && this.counterAfMax == 1){
    // console.log("invalid move");
    // console.log("previous input: " + this.prevInput + " is same with input: " + input);
    var maxIndex = output.indexOf(Math.max.apply(null, output));   //take the index of max
    output[maxIndex] = -Infinity; //replace the max to -infinity
    maxIndex = output.indexOf(Math.max.apply(null, output)); //take the index of 2nd max
    output[maxIndex] = -Infinity; //replace the 2nd max to -infinity
    var m3 = output.indexOf(Math.max.apply(null, output)); // get the 3th max
    // console.log("3rd max output: " + m3);
    this.counterAfMax++;
    return {move:[m3]};
  }
  else if(this.checkValidMove(input, this.prevInput) == false && this.counterAfMax == 2){
    // console.log("invalid move");
    // console.log("previous input: " + this.prevInput + " is same with input: " + input);
    var maxIndex = output.indexOf(Math.max.apply(null, output));   //take the index of max
    output[maxIndex] = -Infinity; //replace the max to -infinity
    maxIndex = output.indexOf(Math.max.apply(null, output)); //take the index of 2nd max
    output[maxIndex] = -Infinity; //replace the 2nd max to -infinity
    maxIndex = output.indexOf(Math.max.apply(null, output)); //take the index of 3th max
    output[maxIndex] = -Infinity; //replace the 3th max to -infinity
    var m4 = output.indexOf(Math.max.apply(null, output)); // get the 4th max
    // console.log("4th max output: " + m4);
    this.counterAfMax = 0;
    return {move:[m4]};
  }
}


AI.prototype.translate = function(move) {
 return {
    0: 'up',
    1: 'right',
    2: 'down',
    3: 'left'
  }[move];
}


/*
temp = a;
a = b; 
b = temp;
*/
