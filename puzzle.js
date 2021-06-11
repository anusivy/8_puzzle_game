/*
 * jQuery Puzzle
 */
(function($){

    $.fn.puzzle = function(options){
        //player is 'user' as default
        var dic = {
            player: options.player ? options.player : "user"
        };
        $.extend(dic, options);
        
        var $this = $(this);
        $this.css({
            "position": "relative",
            width: 300,
            height: 300,
            "display": "inline-block",
            "padding": 10
        });
        
        var rows_arr = [];
        rows_arr[0] = [];
        rows_arr[1] = [];
        rows_arr[2] = [];
        var n = 1;
        //var count= 0
        new_arr = clone(rows_arr);
        //creating boxes in the correct order
        
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                if ((row == 2) && (col == 2)) {
                    rows_arr[row][col] = 0
                    break;
                }
                else {
                
                    $('<div/>').css({
                        "position": "absolute",
                        "width": 83,
                        "height": 83,
                        "background-color": "aqua",
                        "border": "9px inset Turquoise",
                        "border-radius": 9,
                        "text-align": "center",
                        "font-family": "Comic Sans MS, cursive, sans-serif",
                        "font-weight": "bold",
                        "color": "black",
                        "font-size": 50,
                        "display": "inline-block",
                        "left": col * 100,
                        "top": row * 100
                    }).click(function(){
                        if (dic.player === "user") {
                        
                            var box_no = parseInt($(this).text());
                            move(this, box_no);
                            python_game();
                        }
                    }).text(n).appendTo($this);
                    n++;
                }
                
            }
        }
        shuffle(this);
		//Shuffling button
        $("#button_start").bind('click', function(){ shuffle($this);})
		
        function getRandom(min, max){
            //Generate number randomly without repeatition
            if (min > max) {
                return -1;
            }
            
            if (min == max) {
                return min;
            }
            
            var r;
            
            do {
                r = Math.random();
            }
            while (r == 1.0);
            
            return min + parseInt(r * (max - min + 1));
        }
        
        function random_arr(_this){
            // Creating a random array 
            var arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];
            var pos = {
                0: [1, 3],
                1: [0, 2, 4],
                2: [1, 5],
                3: [0, 4, 6],
                4: [1, 3, 5, 7],
                5: [2, 4, 8],
                6: [3, 7],
                7: [4, 6, 8],
                8: [5, 7]
            };
            var free = 8;
            for (var i = 0; i < 150; i++) {
                var l = pos[free].length;
                var r = getRandom(0, l - 1);
                var swap = arr[pos[free][r]];
                arr[pos[free][r]] = arr[free];
                arr[free] = swap;
                free = pos[free][r];
            }
            return arr;
        }
        
        function shuffle(_this){
            $('#win').hide();
            //Shuffling the boxes with random arr
			count = 0;
            var arr
            if (dic.player === "user") {
                arr = random_arr(_this);
				shuffle_process(arr, _this)
            }
            
            else 
                if (dic.player === "computer") {

                    arr = random_arr(_this);
                    shuffle_process(arr, _this)
                    
					//python will send a random arr 
                    $.ajax({
                        url: "/puzzle/random_arr",
                        type: "POST",
                        data: JSON.stringify({
                        
                            project_name: "puzzle"
                        }),
                        dataType: "json",
                        contentType: "application/json",
                        success: function(result){
                            if (result.status == "main.ok") {
                                arr = result.result;
								shuffle_process(arr, _this)   
                            }  
                        },
                        error: function(){
                            console.log("error");
                        }   
                    });
                }
        }
        function shuffle_process(arr, _this){
        
            for (var row = 0; row < 3; row++) {
                for (var col = 0; col < 3; col++) {
                    rows_arr[row][col] = arr[(row * 3) + col];
                  
                    
                    var box = _this.find($("div:contains(" + rows_arr[row][col] + ")"))
                    box.animate({
                        "left": col * 100 + 'px',
                        "top": row * 100 + 'px'
                    },"slow");
                }
            }
			  $this.data({
                        new_arr: rows_arr
                    });
            return rows_arr;
        }

        
        function python_game(){
            //Computer starts the game
            var parent = $(".game2");
            var parent_arr = parent.data(new_arr).new_arr;
            var new_arr = [];
            if (parent_arr) {
                    new_arr = parent_arr;
                
                    box_no = computer_play(new_arr);
                   // alert(box_no);
                    var box = $(".game2").find($("div:contains(" + box_no + ")"));
                    move(box, box_no);
                
                        }
                    }
                        
            //send new_arr to python
			if (count < 9) {
				$.ajax({
                   // url: "/puzzle.py/move",
					url: "/puzzle/move",
					type: "POST",
					data: JSON.stringify({
						new_arr: new_arr,
						//count: count,
						project_name: "puzzle"
					}),
					dataType: "json",
					contentType: "application/json",
					success: function(result){
						if (result.status == "main.ok") {
						
							//count = count + 1;
							box_no = result.result;
							var box = parent.find($("div:contains(" + box_no + ")"))
							move(box, box_no);
						}	
					},
					error: function(){
						console.log("error");
					}
					
				});
			} 
        
        function move(_this, box_no){
            // this function moves the boxes
            var win = false;
            var parent = $(_this).parent();
            if (parent.data(new_arr)) {
                var parent_arr = parent.data(new_arr).new_arr;
            }
            var new_arr = [];
            if (parent_arr) {
                new_arr = parent_arr;
            }
            
            var position = $(_this).position();
            for (var row = 0; row < 3; row++) {
                for (var col = 0; col < 3; col++) {
                    if (new_arr[row][col] == box_no) {
                        //checking the right side of the box
                        if (col > 0 && col - 1 >= 0 && new_arr[row][col - 1] == 0) {
                        
                            $(_this).css({
                                "left": position.left - 100
                            });
                            new_arr[row][col - 1] = box_no
                            new_arr[row][col] = 0
                            parent.data({
                                new_arr: new_arr
                            });
                        }
                        //checking the left side of the box
                        else 
                            if (col < 3 && col + 1 < 3 && new_arr[row][col + 1] == 0) {
                                $(_this).css({
                                    "left": position.left + 100
                                });
                                new_arr[row][col + 1] = box_no
                                new_arr[row][col] = 0
                                parent.data({
                                    new_arr: new_arr
                                });
                            }
                            //checking the top side of the box
                            else 
                                if (row > 0 && row - 1 >= 0 && new_arr[row - 1][col] == 0) {
                                    $(_this).css({
                                        "top": position.top - 100
                                    });
                                    new_arr[row - 1][col] = box_no
                                    new_arr[row][col] = 0
                                    parent.data({
                                        new_arr: new_arr
                                    });
                                }
                                //checking the botton side of the box
                                else 
                                    if (row < 3 && row + 1 < 3 && new_arr[row + 1][col] == 0) {
                                        $(_this).css({
                                            "top": position.top + 100
                                        });
                                        new_arr[row + 1][col] = box_no
                                        new_arr[row][col] = 0
                                        parent.data({
                                            new_arr: new_arr
                                        });
                                    }
                                    else {
                                        break;
                                    }
                        win = checkWin(new_arr, _this)
                        if (win) {
                            break
                        }
                        return;
                    }
                }
            }
        }
        function clone(rows_arr){
            //extend a 2D array (extend will work only with 1D array)
            var new_arr = new Array(3);
            for (var i in rows_arr) {
                new_arr[i] = $.extend([], rows_arr[i]);
            }
            return new_arr;
        }
        
        function checkWin(new_arr, _this){
			//checking the win condition
            var winner = true;
            var checker = [];
            checker[0] = [1, 2, 3];
            checker[1] = [4, 5, 6];
            checker[2] = [7, 8, 0];
            
            
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    if (new_arr[i][j] != checker[i][j]) {
                        winner = false
                        break;
                    }
                }
            }
            if (winner) {
                var parent = $(_this).parent();
				if(parent.get(0)!=$('.game2').get(0)){
                    $('#win').html("Congratulations! You've Won the game!").show();
					//alert("Congratulations! You've Won the game!");
					shuffle(parent);
				}
				else{
					$('#win').html("Sorry! You lose the game!").show();
				}
                
                return true
            }
            return false
        }
        
    }
    
    
})(jQuery);
