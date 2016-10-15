function AI(grid) {
  this.grid = grid;
  this.weight = this.setWeight();
  this.input = this.setInput();
}

//setInput
AI.prototype.setInput = function(){
    var input = new Array(4);
    for(var i = 0; i<4; i++){
        input[i] = new Array (4);
    }

    for(var i=0;i<4;i++){
        for(var j=0;j<4;j++){
                input[j][i] = 0;
               /* var k =0;
                while(v>2){
                v >>=1;
                k+=1;*/
            }
        }
    input[0][0] = 2;
    input[3][3] = 2;

    return input;
}
    


AI.prototype.getInput=function(){
    return this.input;
}
AI.prototype.setWeight = function(){
    //generate weight
    var weight = new Array(30);
    for (var i = 0; i < 30; i++) {
        weight[i] = new Array(16);
    }
  
    for (var i = 0; i <30; i++) {
        for (var j = 0; j <16; j++) {
            weight[i][j] = Math.round((Math.random()*2-1) *100) / 100;
                console.log("weight: " + weight[i][j]);        
        }
    }
    return weight;   
}

AI.prototype.getWeight = function(){
    return this.weight;
}

//calculate r value for input-hidden
AI.prototype.calcRvalue1 = function(input, weight) {
  var sum = new Array (30);

    console.log("r value:")
    for(var i =0; i<30; i++){
        var a = 0;
        for(var j=0; j<16; j++){
            a += Math.round((weight[i][j] * input[i][j]) *100) / 100;
            sum[i] = a;
            
        }
        console.log(a);
    }
    return sum;
}
//calculate r value for hidden-output
AI.prototype.calcRvalue2 = function(hidden) {
  var sum = 0;
    for (var j = 0; j < hidden.length; j++) {
      sum = hidden[j]*  Math.round((Math.random()*2-1) *100) / 100;
      sum = Math.round(sum*100)/100;
    }     
  return sum;
}

AI.prototype.getBest = function() {
  var input = [2, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 2];
  var hidden = [];
  var output = [];

  this.setInput();

  //r value in array for the equation 1/(1+e^-r) [input-hidden]
  var r = new Array(30);
  r = this.calcRvalue1(this.getInput(), this.getWeight());

  console.log("hidden value");
  //get hidden value where hidden = 1/(1+e^-r)
  for(var i=0; i < r.length; i++){
      hidden[i] = 1/(1+Math.exp(-r[i]));
      hidden[i] = Math.round(hidden[i]*100)/100;
      console.log(hidden[i]);
  }

  console.log("r value(hidden)");

  //r value in array for the equation 1/(1+e^-r) [hidden-output]
  var r2 = new Array(4);
  for(var i=0; i < r2.length; i++){
      r2[i] = this.calcRvalue2(hidden);
      console.log(r2[i]);
  }

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
