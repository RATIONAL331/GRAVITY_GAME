// HTML Option
var canvas_w = document.getElementById("canvas").width;
var wrapper_w = document.getElementById("wrapper").style.width;
wrapper_w = parseInt(wrapper_w);
var halfw = 480;
var half_F = 480;
var canvas_h = document.getElementById("canvas").height;

// Restrict option
var restrict_option_x = 50;
var restrict_option_y = 100;
var restrict_option_w = wrapper_w/3;
var restrict_option_h = 300;


// Reference to canvas context
var ctx = false;

// Update frequency
var fHz = 1000/60;

// Array of debris
var debris = [];

// Array of planets
var planets = [];

// Array of star
var star = [];

// Box2D World
var world = null;

// Pixel-to-Meter ratio
var PTM_RATIO = 30.0;

// Current mouse position
var mousePos = null;

// Position of the mouse on mousedown event
var startMousePos = null;

// king radius
var kingRadius = 0.5;

var totalscore = 1;

var clear = false;

var audio = document.getElementById("audio");

/*
 * reset
 * Resets the demo.
 */
function reset() {
	for ( var i = 0; i < debris.length; i++ ) {
		world.DestroyBody(debris[i]);
	}
	var debris_position = debris[0].GetWorldCenter();
	var x_res = b2p(debris_position.x);
	halfw = 480;
	

	if (x_res > halfw && (canvas_w - halfw) > x_res) {
	    
	    ctx.translate(x_res - halfw, 0);
	    ctx.save();
	    ctx.restore();
	}
	if ((canvas_w - halfw) < x_res) {
	

	    ctx.translate((half_F - halfw ), 0);
	    ctx.save();
	    ctx.restore();
	}
	half_F = 480;
	startMousePos = null;
	debris = [];
	$("#canvas").fadeIn('fast');

}
/*
 *
 */
function createKing(r, x, y, type){
	// Create the fixture definition
	var fixDef = new b2FixtureDef;
	
	fixDef.density = 1.0;	// Set the density
	fixDef.friction = 1.0;	// Set the friction
	fixDef.restitution = 0.1;	// Set the restitution - bounciness 
	
	// Define the shape of the fixture
	fixDef.shape = new b2CircleShape(r);
 
    // Create the body definition
	var bodyDef = new b2BodyDef;
	bodyDef.type = type;
	
	// Set the position of the body
	bodyDef.position.x = x;
	bodyDef.position.y = y;
   
	// Create the body in the box2d world
	var b = world.CreateBody(bodyDef);
	b.CreateFixture(fixDef);
   
	return b;
}


/*
 * createDebris
 * Create debris at the position pos with linear velocity defined
 * by v.
 */
function createDebris(pos, v) {
	var b = createKing(kingRadius, p2b(pos.x), p2b(pos.y), b2Body.b2_dynamicBody);
	b.SetLinearVelocity(v);
	debris.push(b);
}

/*
 * newPlanet
 * x - x coord
 * y - y coord
 * r - radius
 * g - gravitational force
 * gf - gravity factor; multiplied by r to get the reach of
 *		the gravitational force.
 */

function createPlanet(x, y, r, g, gf, img) {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 1.0;
	fixDef.restitution = 0.0
	

	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;

	fixDef.shape = new b2CircleShape(r);
	
	fixDef.isSensor = false;

	bodyDef.position.x = x;
	bodyDef.position.y = y;

	bodyDef.userData = {imgsrc : img,
						gravity: g,
						radius: r,
						gravity_factor: gf};

	var b = world.CreateBody(bodyDef);
	b.CreateFixture(fixDef);
	
	return b;
}

function newPlanet(x, y, type) {
    if(type == "LV1"){
		return createPlanet(p2b(x), p2b(y), p2b(20), 5, 3, "LV1.png");
    }else if(type == "LV2"){
		return createPlanet(p2b(x), p2b(y), p2b(35), 10, 3.5, "LV2.png");
    }else if(type == "LV3"){
		return createPlanet(p2b(x), p2b(y), p2b(50), 20, 4, "LV3.png");
    }else if(type == "LV4"){
		return createPlanet(p2b(x), p2b(y), p2b(75), 30, 4.5, "LV4.png");
	}else{
		return createPlanet(p2b(x), p2b(y), p2b(10), 1, 1, "LV5.png")
	}
	
}
/*
function newStar(x, y) {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 1.0;
	fixDef.restitution = 0.0
	

	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;

	fixDef.shape = new b2CircleShape(r);
	
	fixDef.isSensor = false;

	bodyDef.position.x = x;
	bodyDef.position.y = y;

	var b = world.CreateBody(bodyDef);
	b.CreateFixture(fixDef);
	
	return b;
}*/
/*
 * createPlanets
 */
function createPlanets(){
	
	//var planet1 = createPlanet(p2b(150), p2b(200), p2b(30), 10, 4);
	var planet1 = newPlanet(150, 200, "LV1")
	planets.push(planet1);
	/*
	//var planet2 = createPlanet(p2b(380), p2b(200), p2b(50), 13, 3.5);
	var planet2 = newPlanet(380, 200, "LV2")
	planets.push(planet2);

    //var planet3 = createPlanet(p2b(560), p2b(400), p2b(60), 15, 5);
	var planet3 = newPlanet(760, 300, "LV4")
	planets.push(planet3);*/

}

/*
 * getMousePos
 * Returns mouse position of an event within src_elem
 */
function getMousePos(event, src_elem){
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var x_pos = 0;
	var y_pos = 0;
	var currElement = src_elem;

	// IE, Chrome
	if ( event.offsetX !== undefined && event.offsetY !== undefined ) {
		x_pos = event.offsetX;
		y_pos = event.offsetY;
	}

	// Firefox
	else {
		do{
			totalOffsetX += currElement.offsetLeft - currElement.scrollLeft;
			totalOffsetY += currElement.offsetTop - currElement.scrollTop;
		}
		while(currElement = currElement.offsetParent)

		x_pos = event.pageX - totalOffsetX - document.body.scrollLeft; 
		y_pos = event.pageY - totalOffsetY - document.body.scrollTop;
	}
	
	return new b2Vec2(x_pos, y_pos);
}

function setRestrict(ctx, x, y, w, h){
	ctx.save();
	ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
	ctx.fillRect(x, y, w, h);
	ctx.restore();
}

function setDestination(ctx){
	ctx.save();
	ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
	ctx.fillRect(canvas_w-20, 0, 20, canvas_h);
	ctx.restore();

}
/*
 * setDebugDraw
 * Configure the Box2D debug draw.
 */
function setDebugDraw(w){
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
	debugDraw.SetDrawScale(PTM_RATIO); // Set draw scale
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	
	// set debug draw to the world
	w.SetDebugDraw(debugDraw); 
}


/*
 * update
 * Clears the canvas and calls the update and draw
 * function of elements in the explosions list.
 */
function resize(b2Body, radius){
	var fixture = b2Body.GetFixtureList();
	var shape = fixture.GetShape();
	shape.SetRadius(kingRadius);
}


function update() {
	// Update the world simulation
	world.Step(
		  1 / 60,   //frame-rate
		  10,       //velocity iterations
		  10        //position iterations
	);
	
	world.ClearForces();
	
	// Draw debug data on the canvas
	world.DrawDebugData();

	// Set Restrict
	setRestrict(ctx, restrict_option_x, restrict_option_y, restrict_option_w, restrict_option_h);

	// Set Destination
	setDestination(ctx);

	for ( var i = 0; i < debris.length; i++ ) {
		var debris_position = debris[i].GetWorldCenter();

		resize(debris[i]);

		for ( var j = 0; j < planets.length; j++ ) {
			var planet_position = planets[j].GetWorldCenter();
			var planet_data = planets[j].GetUserData();
			var radius = b2p(kingRadius);
			var imgObj = new Image(radius, radius);
			imgObj.src = "ab.png";
  			ctx.save();
			ctx.translate(b2p(debris_position.x), b2p(debris_position.y));
			ctx.drawImage(imgObj, -radius, -radius, radius * 2, radius * 2);
			
			ctx.rotate(debris[i].GetAngle());
			ctx.restore();


			// Vector that is used to calculate the distance
			// of the debris to the planet and what force
			// to apply to the debris.
			var planet_distance = new b2Vec2(0,0);

			// Add the distance to the debris
			planet_distance.Add(debris_position);
			
			// Subtract the distance to the planet's position
			// to get the vector between the debris and the planet.
			planet_distance.Subtract(planet_position);

			if(Normalize2(planet_distance).toFixed(2) == (kingRadius + planet_data.radius).toFixed(2)){
				$("#canvas").fadeOut();
				$("#wrapper").css("background-image", "url(gameover.png)");
			
			}
			// Calculate the magnitude of the force to apply to the debris.
			// This is proportional to the distance between the planet and 
			// the debris. The force is weaker the further away the debris.
			var force = (planet_data.gravity * debris[i].GetMass()) / Math.pow(planet_distance.Length(), 2);
			
			// Check if the distance between the debris and the planet is within the reach
			// of the planet's gravitational pull.
			if ( planet_distance.Length() < planet_data.radius * planet_data.gravity_factor ) {
				// Change the direction of the vector so that the force will be
				// towards the planet.
				planet_distance.NegativeSelf();
				
				// Multiply the magnitude of the force to the directional vector.
				planet_distance.Multiply(force)
				debris[i].ApplyForce(planet_distance, 
									 debris[i].GetWorldCenter());
				
				// Draw gravitational force on the debris
				ctx.save();
				/*ctx.strokeStyle = 'rgba(0,0,255,1)';
				ctx.lineWidth = 1;
		
				ctx.beginPath();
		
				ctx.moveTo(b2p(debris_position.x), b2p(debris_position.y));
				ctx.lineTo(b2p(debris_position.x) + b2p(planet_distance.x), 
						   b2p(debris_position.y) + b2p(planet_distance.y));
				ctx.stroke();
		
				ctx.fill();*/
				
				ctx.restore();
			}

		}

		// Draw linear velocity for the debris
		ctx.save();
		ctx.strokeStyle = 'rgba(255,255,0,1)';
		ctx.lineWidth = 1;

		ctx.beginPath();
		var linear_velocity = debris[i].GetLinearVelocity();
		ctx.moveTo(b2p(debris_position.x), b2p(debris_position.y));
		ctx.lineTo(b2p(debris_position.x) + b2p(linear_velocity.x), 
				   b2p(debris_position.y) + b2p(linear_velocity.y));
		ctx.stroke();

		ctx.fill();
		ctx.restore();
	}
  	// Draw image of each planet
  	for ( var j = 0; j < planets.length; j++ ) {
  		var ud = planets[j].GetUserData()
  		var radius = b2p(ud.radius);
  		var planet_position = planets[j].GetWorldCenter();
		var imgObj = new Image(radius, radius);
		imgObj.src = ud.imgsrc;
  		ctx.save();
		ctx.translate(b2p(planet_position.x), b2p(planet_position.y));
		ctx.drawImage(imgObj, -radius, -radius, radius*2, radius*2);
		ctx.restore();
	}

  	// Draw gravitational field of each planet
  	for ( var j = 0; j < planets.length; j++ ) {
  		var ud = planets[j].GetUserData()
  		var radius = b2p(ud.radius) * ud.gravity_factor;
  		var planet_position = planets[j].GetWorldCenter();
  		ctx.save();
  		ctx.beginPath();
      	ctx.arc(b2p(planet_position.x), b2p(planet_position.y), radius, 0, 2 * Math.PI, false);
      	ctx.fillStyle = 'rgba(100,100,100,0.3)';
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#666666';
		ctx.stroke();
		ctx.restore();
	}
	
	// Draw firing vector of debris
	if ( startMousePos ) {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'rgba(181,201,200,0.5)';
		ctx.strokeStyle = '#CCCCCC'
		ctx.lineWidth = 1;
		ctx.arc(startMousePos.x, startMousePos.y, kingRadius * 30 , 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
		
		ctx.beginPath();
		ctx.strokeStyle = '#FF0000';
		ctx.moveTo(startMousePos.x, startMousePos.y);
		ctx.lineTo(mousePos.x, mousePos.y);
		ctx.stroke();
		ctx.restore();

	}

	var debris_position = debris[0].GetWorldCenter();
	var x_res = b2p(debris_position.x);
	var y_res = b2p(debris_position.y);

	//set camera option
	if (x_res > halfw && (canvas_w - halfw) > x_res) {
	    ctx.translate(-(x_res - half_F), 0);
	    ctx.save();
	    ctx.restore();
	    half_F = x_res;
	} 

	//set restriction
	if ((y_res < 0 || y_res > canvas_h || x_res < 0) && clear == false) {
	    $("#canvas").fadeOut();
		$("#wrapper").css("background-image", "url(gameover.png)");

	}
	//set Destination
	if((x_res > canvas_w - 15) && ((y_res < canvas_h) && ( y_res > 0 ))){
		clear = true;
		$("#canvas").fadeOut();
		$("#wrapper").css("background-image", "url(finished.png)");
		setTimeout("location.href='test2.html'",2000);
	}
}

/*
 * The init function called when the page loads.
 * It setup up the event listener for mouseup
 * events and sets the interval to call the update
 * function.
 */
function init(){

	//
	// Create the box2d world
	//
	world = new b2World(
						new b2Vec2(0, 0),   //gravity is zero in space
						true                //allow sleep
					   );
	
	//
	// Configure debug draw
	//
	setDebugDraw(world);
	
	var canvas = document.getElementById('canvas');
	
	ctx = canvas.getContext('2d');

	audio.play();
	audio.volume = 0.3


	//canvas.addEventListener('click', function(e) {
	canvas.addEventListener('mouseup', function(e) {
		if(debris.length == 0 && e.offsetX < restrict_option_x+restrict_option_w && e.offsetX > restrict_option_x && e.offsetY > restrict_option_y && e.offsetY < restrict_option_y+restrict_option_h){
		// The mouse position of the event
		mousePos = getMousePos(e, this);
		var endMousePos = mousePos.Copy();
		
		if ( startMousePos ) {
			var linear_velocity = new b2Vec2(0,0);
			linear_velocity.Add(endMousePos);
			linear_velocity.Subtract(startMousePos);
			linear_velocity.Multiply(1/PTM_RATIO);
			createDebris(startMousePos, linear_velocity);
			startMousePos = null;
		}}
		
	}, false);

	canvas.addEventListener('mousedown', function(e) {
		if(debris.length == 0 && e.offsetX < restrict_option_x+restrict_option_w && e.offsetX > restrict_option_x && e.offsetY > restrict_option_y && e.offsetY < restrict_option_y+restrict_option_h){
		// The mouse position of the event
		mousePos = getMousePos(e, this);
		startMousePos = mousePos;}
	}, false);
	
	canvas.addEventListener('mousemove', function(e) {
		if(debris.length == 0 && e.offsetX < restrict_option_x+restrict_option_w && e.offsetX > restrict_option_x && e.offsetY > restrict_option_y && e.offsetY < restrict_option_y+restrict_option_h){
		// The mouse position of the event
		mousePos = getMousePos(e, this);}
	}, false);

	canvas.addEventListener('mousewheel', function(e) {
		// The mouse position of the event
		if(e.wheelDelta >= 120){
			if(kingRadius <1.2){
				kingRadius += 0.02;
			}
		}else if(e.wheelDelta <= -120 && kingRadius > 0.3){
			kingRadius -= 0.02;
		}else{
			kingRadius = 0.3;
		}
	}, false);


	// The reset button.

	window.addEventListener('keydown', function(e){
		if(e.keyCode == 82){
			reset();
		}
	}, true);

	createPlanets();
	
	
	window.setInterval(update, fHz);
}


var b2Vec2 = Box2D.Common.Math.b2Vec2
  , b2AABB = Box2D.Collision.b2AABB
  ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
  ,	b2Body = Box2D.Dynamics.b2Body
  ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
  ,	b2Fixture = Box2D.Dynamics.b2Fixture
  ,	b2World = Box2D.Dynamics.b2World
  ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
  ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
  ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
  , b2BuoyancyController = Box2D.Dynamics.Controllers.b2BuoyancyController
  , b2ContactListener = Box2D.Dynamics.b2ContactListener;
  ;
  

/*
 * Converts from degrees to radians.
 */
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

/*
 * Converts from radians to degrees.
 */
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

/*
 * randomFloat
 * Augments the Math library with a function
 * to generate random float values between
 * a given interval.
 */
Math.randomFloat = function(min, max){
	return min + Math.random()*(max-min);
};

/*
 * Normalize2
 * Returns the normal of the vector b.
 */
function Normalize2(b) {
	return Math.sqrt(b.x * b.x + b.y * b.y);
}

//-----------------------------
 // Converts from radians to degrees.
 Math.degrees = function(radians) {
   return radians * 180 / Math.PI;
 };
 
//-----------------------------
 // Returns the determinant for two two-dimensional vectors
 Math.determinant = function(v1,v2){
 	return v1.x * v2.y - v1.y * v2.x;
 };
 
//-----------------------------
 // Returns the dot products of two two-dimensional vectors
 Math.dot = function(v1, v2){
 	return v1.x * v2.x + v1.y*v2.y;
 };
 
//-----------------------------
 // Returns the magnitude of a vector
 Math.magnitude = function(v1){
 	return Math.sqrt(v1.x * v1.x + v1.y * v1.y);
 };
 
//-----------------------------
 Math.vectorAngle = function(v1, v2){
 	var dot_prod = Math.dot(v1, v2);
 	//console.log("dot_prod: " + dot_prod);
 	var cross_prod = Math.determinant(v1,v2);
 	//console.log("cross_prod: " + cross_prod);
 	var v1_mag = Math.magnitude(v1);
 	//console.log("v1_mag: " + v1_mag);
 	var v2_mag = Math.magnitude(v2);
 	//console.log("v2_mag: " + v2_mag);
 	var tmp = dot_prod/(v1_mag * v2_mag);
 	var angle = Math.acos(tmp.toPrecision(4)); // rounding errors seem to make this >1 or <-1 sometimes..
 	
 	return cross_prod < 0 ? angle * -1 : angle;
 };
 
//-----------------------------
 Math.arcLength = function(radians, radius){
 	return radians * radius;
 };

/*
 * p2b
 * Helper function to convert pixels to 
 * Box2D metrics.
 */
function p2b(pixels) {
	return pixels / PTM_RATIO;
}

function b2p(meters) {
	return meters * PTM_RATIO;
}


