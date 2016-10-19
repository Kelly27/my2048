function AI(grid) {
  this.grid = grid;
  this.weight1 = this.setWeight1();
  this.weight2 = this.setWeight2();
//  this.input = this.setInput();
}

//setInput
AI.prototype.setInput = function(){
    var input =[];
      for(var i=0; i < 4; i++){
        //input[i] = new Array(4);
        for(var j=0; j < 4; j++){
          if(this.grid.cells[j][i] !== null){
            var v = this.grid.cells[j][i].value;
            console.log(v);
            input = input.concat(v);
          }
          else{
            v = 0;
            input = input.concat(v);
          }
        }
      }
    input = input.concat(1);
    console.log(input);
    return input;
}
    


AI.prototype.getInput=function(){
    return this.input;
}
AI.prototype.setWeight1 = function(){
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

AI.prototype.setWeight2 = function(){
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

AI.prototype.getWeight1 = function(){
    return this.weight1;
}

AI.prototype.getWeight2 = function(){
    return this.weight2;
}
//calculate r value for input-hidden
AI.prototype.calcRvalue1 = function(input, weight1) {
  var sum = new Array (30);

    console.log("r value:")
    for(var i =0; i<30; i++){
        var a = 0;
        for(var j=0; j<17; j++){
            a += Math.round((weight1[i][j] * input[j]) *100) / 100;
            sum[i] = a;
            
        }
        console.log(a);
    }
    return sum;
}
//calculate r value for hidden-output
AI.prototype.calcRvalue2 = function(hidden, weight2) {
  var sum = new Array (4);

    console.log("r value 2:")
    for(var i =0; i<4; i++){
        var a = 0;
        for(var j=0; j<30; j++){

            a += Math.round((weight2[i][j] * hidden[j]) *100) / 100;
            sum[i] = a;
            
        }
        console.log(a);
    }
    return sum;
}

AI.prototype.getBest = function() {
  var hidden = [];
  var output = [];

  var input = this.setInput();

  //r value in array for the equation 1/(1+e^-r) [input-hidden]
  var r = new Array(30);
  r = this.calcRvalue1(input, this.getWeight1());

  console.log("hidden value");
  //get hidden value where hidden = 1/(1+e^-r)
  for(var i=0; i < r.length; i++){
      hidden[i] = 1/(1+Math.exp(-r[i]));
      hidden[i] = Math.round(hidden[i]*100)/100;
      console.log(hidden[i]);
  }

  //console.log("r value(hidden)");

  //r value in array for the equation 1/(1+e^-r) [hidden-output]
  var r2 = new Array(4);
  r2= this.calcRvalue2(hidden, this.getWeight2());
  console.log(r2);

  console.log("output");
  //get output value where output = 1/(1+e^-r)
  for(var i=0; i < r2.length; i++){
      output[i] = 1/(1+Math.exp(-r[i]));
      output[i]=Math.round(output[i]*100)/100;
      console.log(output[i]);
  }

  ////direction-sort biggest value in array m
  var m = output.indexOf(Math.max(...output));
  console.log("max output: " + m);

  return {move:[m]}; //KELLY: change the array index to change direction
}
AI.prototype.translate = function(move) {
 return {
    0: 'up',
    1: 'right',
    2: 'down',
    3: 'left'
  }[move];
}
