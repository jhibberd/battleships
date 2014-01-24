
var genFakeData = function(){
	var randBoard = [];
	// Generate random board
	var possibleMoves = []
	for(var a = 0; a < 100; a++){
		possibleMoves.push(a);
	}

	function getRandomInt (min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	for(var a = 0; a < 100; a++){
		var rand = getRandomInt(0, possibleMoves.length - 1);
		var slot = possibleMoves[rand];
		var val = Math.random() <= 0.5 ? -1 : 1;
		randBoard.push([slot, val]);
		var idx = possibleMoves.indexOf(slot);
		possibleMoves.splice(idx,1);
	}
	return randBoard;
}

var BoardManager = function(){
	var self = this;
	this.currentTick = 0;
	this.ticking = false;
	this.data = genFakeData();

	// TODO set up boards into an array to itterate though.
	// Initialize new board
	this.board = new Board(this.data, '#board', 400, true);
	
	// Default animation speed
	this.animationSpeedIdx = 2;
	this.animationSpeed = this.getAnimationSpeed();
	this.tick();

	$(".change-speed ul li a").click(function(){
		$(".change-speed > div").html($(this).text() + ' <span class="caret"></span>');
		self.animationSpeedIdx = $(this).data().val;
		self.animationSpeed = self.getAnimationSpeed();
	});

    $('.ship-show').on('click', function(){
    	var $this = $(this);
    	var show = $this.hasClass('show-ships');
    	if(show){
    		$this.text('Hide Ships');
    	} else {
    		$this.text('Show Ships');
    	}
		self.board.changeOverlayVisibility(show);
    	$this.toggleClass('show-ships');
    });

    $('.replay').on('click', function(){
    	self.currentTick = 0;
    	self.tick();
    });
}
BoardManager.prototype.OKToAnimate = true;

BoardManager.prototype.tick = function(){
	if(this.ticking){
		return
	} else {
		this.ticking = true;
	}
	var self = this;
	var numMovesTotal = this.data.length;
	var ticker = function(){
		if(self.currentTick < numMovesTotal){
			setTimeout(function(){
				self.board.tick(self.currentTick);
				self.currentTick++
				ticker();
			}, self.animationSpeed);
		} else {
			self.ticking = false;
		}
	}
	ticker();
}

BoardManager.prototype.animationSpeeds = [50, 250, 500];

BoardManager.prototype.getAnimationSpeed = function(){
	return this.animationSpeeds[this.animationSpeedIdx];
}

var Board = function(data, ele, dimension, shipVisibilty){

	this.data = data;
	this.shipPositions = this.getShipPositions();
	this.width = dimension;
	this.height = dimension;
	this.cellSize = dimension / 10;
	this.shipVisibilty = shipVisibilty;
	this.baseBoard = this.genBaseBoard();

	this.svg = d3.select("#board")
			  	.append("svg")
	          	.attr("width", this.width)
	          	.attr("height", this.height)
	          	.append("g");

   	this.renderBoard(this.baseBoard);
   	this.renderOverlay();
   	this.changeOverlayVisibility(this.shipVisibilty);
}

Board.prototype.reset = function(){
	this.svg.selectAll(".cell")
		.each(function(d){
			d.result = 0;
		})
		.attr('class', function(d, i){
		  	return 'cell empty bordered'
		});
}

Board.prototype.resultClasses = ['miss', 'empty', 'hit'];

Board.prototype.getShipPositions = function(){
	return _.reduce(this.data, function(acc, val, idx){
		if(val[1] === 1){
			acc.push(val[0]);
		}
		return acc;
	}, []);

}

Board.prototype.renderOverlay = function(){
	// Draw ship positions
	var cellSize = this.cellSize;
	var circleHeight = cellSize / 2;
	var self = this;
   	this.svg.selectAll(".ship")
	  .data(self.shipPositions)
	  .enter()
	  .append("rect")
	  .attr("x", function(d,i) { return self.baseBoard[d].xPos + cellSize / 2 / 2 })
	  .attr("y", function(d,i) { return self.baseBoard[d].yPos + cellSize / 2 / 2 })
	  .attr("rx", 4)
	  .attr("ry", 4)
	  .attr("class", 'ship')
	  .attr("width", circleHeight)
	  .attr("height", circleHeight)
}

Board.prototype.tick = function(idx){
	var self = this;
	var res = this.data[idx];

	var toApply = this.data.slice(0, idx + 1);

	_.each(this.baseBoard, function(d, i){
		d.result = 0;
	});

	_.each(toApply, function(res){
		self.baseBoard[res[0]].result = res[1];
	});

	this.renderBoard(this.baseBoard);
}

Board.prototype.genDefaultClasses = function(d){
	return "cell bordered " + this.resultClasses[d.result + 1];
}

Board.prototype.renderBoard = function(data){
	var self = this;
	var cells = this.svg.selectAll("rect.cell")
    	.data(data);

	cells
	  .enter()
	  .append("rect")
	  .attr("x", function(d) { return d.xPos })
	  .attr("y", function(d) { return d.yPos })
	  .attr("rx", 4)
	  .attr("ry", 4)
	  .attr("width", this.cellSize)
	  .attr("height", this.cellSize)

	cells.attr("class", function(d){
	  	return self.genDefaultClasses(d);
	  })
}

Board.prototype.changeOverlayVisibility = function(show){
	this.svg.selectAll(".ship")
		.classed('hide', function(d) { return !show })
}

Board.prototype.genBaseBoard = function(){
	var baseBoard = [];
	for(var a = 0; a < 10; a++){
		for(var b = 0; b < 10; b++){
			baseBoard.push({
				'xPos': b * this.cellSize,
				'yPos': a * this.cellSize,
				'result': 0
			});
		}
	}
	return baseBoard;
}

$(document).ready(function() {
    // http://bl.ocks.org/tjdecke/5558084


    var board = new BoardManager()
});