function handleCollisionStart(event){
	var pairs = event.pairs;
	for(var i = pairs.length - 1; i >= 0; i--){
		pairs[i].bodyA.gameObject.collisionStart(pairs[i].bodyA, pairs[i].bodyB, event);
		pairs[i].bodyB.gameObject.collisionStart(pairs[i].bodyB, pairs[i].bodyA, event);
	}
}
function handleCollisionActive(event){
	var pairs = event.pairs;
	for(var i = pairs.length - 1; i >= 0; i--){
		pairs[i].bodyA.gameObject.collisionActive(pairs[i].bodyA, pairs[i].bodyB, event);
		pairs[i].bodyB.gameObject.collisionActive(pairs[i].bodyB, pairs[i].bodyA, event);
	}
}
function handleCollisionEnd(event){
	var pairs = event.pairs;
	for(var i = pairs.length - 1; i >= 0; i--){
		pairs[i].bodyA.gameObject.collisionEnd(pairs[i].bodyA, pairs[i].bodyB, event);
		pairs[i].bodyB.gameObject.collisionEnd(pairs[i].bodyB, pairs[i].bodyA, event);
	}
}

// must be called during game initialization otherwise object.collisionStart/Active/End 
// will never fire
function startHandlingCollisions(engine){
	Matter.Events.on(engine, "collisionStart", handleCollisionStart);
	Matter.Events.on(engine, "collisionActive", handleCollisionActive);
	Matter.Events.on(engine, "collisionEnd", handleCollisionEnd);
}

// a physics object wrapper for Matter.Composite
class object {
	constructor(){
		this.composite = null;
		this.inWorld = false;
		this.parentWorld = null;
	}
	
	getAllBodies(){
		return Matter.Composite.allBodies(this.composite);
	}
	getFirstBody(){
		return this.composite.bodies[0];
	}
	setComposite(composite, keeppos = true){
		//if keeppos = true, keep the current object position, otherwise use the given composite's position
		var tpos = keeppos ? this.getPos() : null;
		this.composite = composite;
		
		if(tpos) this.setPos(tpos);
		return this;
	}
	addBody(body){
		if(this.composite)
			Matter.Composite.addBody(this.composite, body);
	}
	
	setChildrenParent(){
		// set gameObject parent of bodies to this
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--)
			bods[i].gameObject = this;
		// set gameObject parent of composites to this
		var comps = Matter.Composite.allComposites(this.composite);
		for(var i = comps.length - 1;  i >= 0; i--)
			comps[i].gameObject = this;
		this.composite.gameObject = this;
	}
	
	worldAdd(world){
		if(this.inWorld) return;
		world.add(this);
	}
	worldRemove(){
		if(!this.inWorld) return;
		this.parentWorld.remove(this);
	}
	preAdd(world){
		this.setChildrenParent();
		this.parentWorld = world;
		this.inWorld = true;
	}
	preRemove(){
		this.parentWorld = null;
		this.inWorld = false;
	}
	
	setStatic(isstatic = true){
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--)
			Matter.Body.setStatic(bods[i], isstatic);
		return this;
	}
	setFriction(fric = null, air = null, staticf = null){
		// sets all the child bodies' friction to the specified values of 
		// friction, air friction, and static friction
		var setter = {}
		
		if(fric != null) 
			setter.friction = fric;
		if(air != null)
			setter.frictionAir = air;
		if(staticf != null)
			setter.frictionStatic = staticf;
		
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--)
			Matter.Body.set(bods[i], setter);
	}
	
	getPos(){
		//returns the centroid of all the bodies
		if(!this.composite) return null;
		var tpos = new vec2();
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--)
			tpos = tpos.plus(bods[i].position);
		return tpos.multiply(1 / bods.length);
	}
	setPos(pos){
		//sets all the bodies' positions around a specified centroid
		if(!this.composite) return;
		var opos = this.getPos();
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--){
			var off = vec2.fromAnonObj(bods[i].position).minus(opos);
			Matter.Body.setPosition(bods[i], pos.plus(off));
		}
		return this;
	}
	getVel(){
		if(!this.composite) return null;
		var tvel = new vec();
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--)
			tvel = tvel.plus(bods[i].velocity);
		return tvel.multiply(1 / bods.length);
	}
	setVel(vel){
		if(!this.composite) return;
		var ovel = this.getVel();
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--){
			var off = vec2.fromAnonObj(bods[i].velocity).minus(ovel);
			Matter.Body.setVelocity(bods[i], vel.plus(off));
		}
		return this;
	}
	getAng(){
		return this.getFirstBody().angle;
	}
	setAng(ang){
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--)
			Matter.Body.setAngle(bods[i], ang);
	}
	
	collisionStart(thisBody, otherBody, e){}
	collisionActive(thisBody, otherBody, e){}
	collisionEnd(thisBody, otherBody, e){}
	
	update(ts){}
	draw(ctx){
		if(!this.composite) return;
		
		var fillCol = "#000";
		var lineCol = "#fff";
		var lineWidth = 2;
		
		var bodies = this.getAllBodies();
		for(var i0 = bodies.length - 1; i0 >= 0; i0--){
			for(var i1 = bodies[i0].parts.length - 1; i1 >= 0; i1--){
				ctx.fillStyle = fillCol;
				ctx.strokeStyle = lineCol;
				ctx.lineWidth = lineWidth;
				ctx.beginPath();
				
				var start = bodies[i0].parts[i1].vertices[0];
				ctx.moveTo(start.x, start.y);
				for(var i2 = bodies[i0].parts[i1].vertices.length - 1; i2 >= 0; i2--){
					var vtx = bodies[i0].parts[i1].vertices[i2];
					ctx.lineTo(vtx.x, vtx.y);
				}
				ctx.closePath();
				ctx.fill();
			}
		}
		for(var i0 = bodies.length - 1; i0 >= 0; i0--){
			for(var i1 = bodies[i0].parts.length - 1; i1 >= 0; i1--){
				ctx.fillStyle = fillCol;
				ctx.strokeStyle = lineCol;
				ctx.lineWidth = lineWidth;
				ctx.beginPath();
				
				var start = bodies[i0].parts[i1].vertices[0];
				ctx.moveTo(start.x, start.y);
				for(var i2 = bodies[i0].parts[i1].vertices.length - 1; i2 >= 0; i2--){
					var vtx = bodies[i0].parts[i1].vertices[i2];
					ctx.lineTo(vtx.x, vtx.y);
				}
				ctx.closePath();
				ctx.stroke();
			}
		}
	}
	
	trackPreviousVelocities(){
		// if used, call this method at the very END of this.update()
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--){
			bods[i]._prevVel = { x: bods[i].velocity.x, y: bods[i].velocity.y };
		}
	}
	
	static empty(){
		var p = new object();
		p.composite = Matter.Composite.create();
		return p;
	}
	static default(){
		var r = new object();
		
		r.setComposite(object.composite_rectangle());
		
		return r;
	}
	static concat(objs = []){
		// creates a compund object out of a given array of objects
		var r = object.empty();
		for(var i = objs.length; i >= 0; i--)
			Matter.Composite.add(r.composite, objs[i].composite);
		return r;
	}
	
	static composite_fromBody(body){
		var r = Matter.Composite.create();
		Matter.Composite.addBody(r, body);
		return r;
	}
	static composite_rectangle(size = new vec2(50, 25)){
		var rect = Matter.Bodies.rectangle(0, 0, size.x, size.y);
		return object.composite_fromBody(rect);
	}
}

class destructable extends object{
	constructor(){
		super();
		this.threshold = 5;
	}
	
	update(ts){
		var acc = this.getBodyAcceleration();
		if(acc.distance() > this.threshold)
			this.destroy();
		
		this.trackPreviousVelocities();
	}
	
	destroy(){
		var shards = destructable.getBodyShards(this.getFirstBody());
		shards.worldAdd(this.parentWorld);
		this.worldRemove();
	}
	static getBodyShards(body, keepVel = true){
		if(!body) body = this.getFirstBody();
		
		var container = object.empty();
		
		// the vector to set each shard's velocity to
		var velset = new vec2();
		if(keepVel){
			if(body._prevVel) velset = vec2.fromAnonObj(body._prevVel);
			else velset = vec2.fromAnonObj(body.velocity);
		}
		
		//if the body is a compound body
		var perBod = body.parts > 1;
		
		// add all the parts of the compund body to the container
		if(perBod)
			for(var i = body.parts.length - 1; i >= 0; i--)
				container.addBody(body.parts[i]);
		
		// make a new body from each vertex and add it to the container
		else{
			
			// center point of body
			var bodcent = new vec2(
				(body.bounds.max.x + body.bounds.min.x) / 2,
				(body.bounds.max.y + body.bounds.min.y) / 2);
			
			// iterate through each vertext and create new body piece for each vertex
			for(var i = body.vertices.length - 1; i >= 0; i --){
				var v0 = body.vertices[i]
				var v1 = body.vertices[wrapValue(i + 1, body.vertices.length)];
				
				//vertices of the body to create
				var verts = [v0, v1, bodcent];
				
				var shardcent = vec2.average([v0, v1, bodcent]);
				var bod = Matter.Bodies.fromVertices(shardcent.x, shardcent.y, verts);
				container.addBody(bod);
			}
		}
		
		//set the velocity of the shards
		var cbods = container.getAllBodies();
		for(var i = cbods.length - 1; i >= 0; i--)
			Matter.Body.setVelocity(cbods[i], velset.clone());
		
		return container;
	}
	
	getBodyAcceleration(body){
		if(!body) body = this.getFirstBody();
		if(!body._prevVel) return new vec2();
		return vec2.fromAnonObj(body.velocity).minus(vec2.fromAnonObj(body._prevVel));
	}
	
	collisionActive(thisBody, otherBody, e){
	}
	
	draw(ctx){
		if(!this.composite) return;
		
		var fillCol = this.col;
		var lineCol = "#fff";
		var lineWidth = 2;
		
		var bodies = this.getAllBodies();
		for(var i0 = bodies.length - 1; i0 >= 0; i0--){
			for(var i1 = bodies[i0].parts.length - 1; i1 >= 0; i1--){
				ctx.fillStyle = fillCol;
				ctx.strokeStyle = lineCol;
				ctx.lineWidth = lineWidth;
				ctx.beginPath();
				
				var start = bodies[i0].parts[i1].vertices[0];
				ctx.moveTo(start.x, start.y);
				for(var i2 = bodies[i0].parts[i1].vertices.length - 1; i2 >= 0; i2--){
					var vtx = bodies[i0].parts[i1].vertices[i2];
					ctx.lineTo(vtx.x, vtx.y);
				}
				ctx.closePath();
				ctx.fill();
			}
		}
		for(var i0 = bodies.length - 1; i0 >= 0; i0--){
			for(var i1 = bodies[i0].parts.length - 1; i1 >= 0; i1--){
				ctx.fillStyle = fillCol;
				ctx.strokeStyle = lineCol;
				ctx.lineWidth = lineWidth;
				ctx.beginPath();
				
				var start = bodies[i0].parts[i1].vertices[0];
				ctx.moveTo(start.x, start.y);
				for(var i2 = bodies[i0].parts[i1].vertices.length - 1; i2 >= 0; i2--){
					var vtx = bodies[i0].parts[i1].vertices[i2];
					ctx.lineTo(vtx.x, vtx.y);
				}
				ctx.closePath();
				ctx.stroke();
			}
		}
	}
	
	static default(){
		var r = new destructable();
		
		r.setComposite(object.composite_rectangle());
		
		return r;
	}
}