
Crafty.c("Learner", {
    required: "2D, Canvas, Color, Motion, Collision",
    events: {
        "Moved": function(evt){
            this.pain = 0; // pain is the immediate consequence of environment, iotw no residiual pain

            // Handle Hit
            var hitDatas = this.hit('wall');
            if( hitDatas){
                hitData = hitDatas[0];
  				if (hitData.type === 'SAT') { 
            		this.x -= hitData.overlap * hitData.normal.x;
            		this.y -= hitData.overlap * hitData.normal.y;
          		} else { 
            		this[evt.axis] = evt.oldValue;
          		}
				pain += this.velocity().magnitude();
            }

            // Handle hitting food
            this.hunger += 1
    
            var hitDatas = this.hit('food');
            if( hitDatas){
                hitData = hitDatas[0];
  				if (hitData.type === 'SAT') { 
            		this.x -= hitData.overlap * hitData.normal.x;
            		this.y -= hitData.overlap * hitData.normal.y;
          		} else { 
            		this[evt.axis] = evt.oldValue;
          		}
			    this.hunger = 0;	
            }
            if(this.hunger > 20){
                if(this.hunger > 100){ this.hunger = 100; }
                this.pain += this.hunger/10; // hunger pain threshold
            } 

            // look around
            var wall_view = [];
            var food_view = [] 
            for(var e=0; e < this.eyes.length; e++){
                // TODO rotate eye based on current rotation  
                var wall = Crafty.raycast( this.pos(), this.eyes[e], -1,"wall");
                if( wall.length > 0){
                    wall_view.push(wall[0].distance);
                }else{
                    wall_view.push(1000);
                }
                var food = Crafty.raycast( this.pos(), this.eyes[e], -1,"food");
                if( food.length > 0){
                    food_view.push(food[0].distance);
                }else{
                    food_view.push(1000);
                }
            }

            // Do our thought process
            this.think(this.pain,food_view,wall_view);
        }
    },
    init: function(){ 
        this.color("blue");
        this.w = 50;
        this.h = 50;
        this.speed = 1;
        this.inputs = null;

        // current feelings
        this.pain = 0;
        this.hunger = 0;
        this.eyes = [new Crafty.math.Vector2D(-4,1),
                     new Crafty.math.Vector2D(-2,1),
                     new Crafty.math.Vector2D(0,1),
                     new Crafty.math.Vector2D(2,1),
                     new Crafty.math.Vector2D(4,1)
        ]; // 4 eye-vectors?

        // Set us off in a random dir?
		var m_r = new Crafty.math.Matrix2D();
		m_r.rotate( Math.random() * (Math.PI*2) );
        v = this.velocity();
        v.x = -20;
        v.y = 0;
        m_r.apply(v);
    } ,
    place: function (x,y) {
        this.x = x;
        this.y = y;
        return this;
    },
    think: function(pain,food,wall){

        // Learn first? then act?
        var v = this.velocity();
   
        if(this.inputs != null){
            // back propagate pain and pleasure based upon last input layer
        }

        // update inputs on current conditions
        this.inputs = [v.x,v.y] + food + wall;

        // and forward through network to get new velocity vector
        v.x = v.x;  // SHOULD this be a delta ?
        v.y = v.y;  // 
    }
});



window.onload = function() {

    Crafty.init();

    var vw = Crafty.viewport.width;
    var vh = Crafty.viewport.height;

    // Add walls
	Crafty.e("2D, wall").attr({x:-1,y:0,w:1,h:vh});
	Crafty.e("2D, wall").attr({x:0,y:-1,w:vw,h:1});
	Crafty.e("2D, wall").attr({x:vw,y:0,w:1,h:vh});
	Crafty.e("2D, wall").attr({x:0,y:vh,w:vw,h:1});

    // Add some food
    var food = Crafty.e("2D, Canvas, Color, food")
        .attr({x:vw/2-10,y:vh/2-10,w:20,h:20})
        .color("white");

    var player = Crafty.e("Learner") //, Fourway")
        .place(100,100);
		//.fourway(50);

};
