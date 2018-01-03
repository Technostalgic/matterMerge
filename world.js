// A physics world structure
// contains a Matter.World and Matter.Engine object
class world{
	constructor(){
		this.physEngine = Matter.Engine.create();
		this.physWorld = this.physEngine.world;
		startHandlingCollisions(this.physEngine);
		
		this.terrain = [];
		this.objList = [];
	}
	
	getAllBodies(){
		return Matter.Composite.allBodies(this.physWorld);
	}
	
	getTimescale(){
		return this.physEngine.timing.timeScale;
	}
	setTimescale(ts){
		this.physEngine.timing.timeScale = ts;
	}
	
	update(dt){
		for(var i = this.objList.length - 1; i >= 0; i--)
			this.objList[i].update(this.getTimescale());
		for(var i = this.terrain.length - 1; i >= 0; i--)
			this.terrain[i].update(this.getTimescale());
		Matter.Engine.update(this.physEngine, dt);
	}
	
	add(obj){
		obj.preAdd(this);
		this.objList.push(obj);
		Matter.World.addComposite(this.physWorld, obj.composite);
	}
	remove(obj){
		obj.preRemove();
		Matter.World.remove(this.physWorld, obj.composite);
		this.objList.splice(this.objList.indexOf(obj), 1);
	}
	
	addTerrain(obj){
		obj.preAdd();
		this.terrain.push(obj);
		Matter.World.addComposite(this.physWorld, obj.composite);
	}
	removeTerrain(obj){
		obj.preRemove();
		Matter.World.remove(this.physWorld, obj.composite);
		this.terrain.splice(this.terrain.indexOf(obj), 1);
	}
	
	createConstraint(pointA, pointB, targetA, targetB){
		// creates a contstraint from pointA on targetA to pointB
		// if targetA or B are undefined, it will use whichever body is at the specified Point
		// if no body is at the specified point, the constraint will be attached to the background
		
		var bodchecks = this.getAllBodies();
		if(!targetA){
			var ptargs = Matter.Query.point(bodchecks, pointA);
			if(ptargs.length > 0)
				targetA = ptargs[0];
		}
		if(!targetB){
			var ptargs = Matter.Query.point(bodchecks, pointB);
			if(ptargs.length > 0)
				targetB = ptargs[0];
		}
		
		// if no bodies are selected, don't create a constraint
		if(!targetA && !targetB)
			return null;
		
		// create constraint settings
		var cset = {};
		if(targetA) {
			cset.bodyA = targetA;
			var tposA = pointA.minus(vec2.fromAnonObj(targetA.position));
			cset.pointA = tposA;
		}
		else cset.pointA = pointA;
		if(targetB) {
			cset.bodyB = targetB;
			var tposB = pointB.minus(vec2.fromAnonObj(targetB.position));
			cset.pointB = tposB;
		}
		else cset.pointB = pointB;
		
		// create and add constraint
		var cstr = Matter.Constraint.create(cset);
		if(targetA) targetA.gameObject.addConstraintRef(cstr);
		if(targetB) targetB.gameObject.addConstraintRef(cstr);
		Matter.World.addConstraint(this.physWorld, cstr);
		return cstr;
	}
	createWorldConstraint(target, offset, pointB){
		// creates a constraint from target with offset to the world's background at pointB
		var cstr = Matter.Constraint.create({
			bodyA: target,
			pointA: offset,
			pointB: pointB
		});
		target.gameObject.addConstraintRef(cstr);
		Matter.World.addConstraint(this.physWorld, cstr);
		return cstr;
	}
	removeConstraint(cstr){
		if(Matter.World.remove(physWorld, cstr).isModified) return true;
		if(cstr.bodyA)
			if(Matter.Composite.remove(cstr.bodyA.gameObject.composite, cstr).isModified) return true;
		if(cstr.bodyB)
			if(Matter.Composite.remove(cstr.bodyB.gameObject.composite, cstr).isModified) return true;
		return false;
	}
	
	draw(ctx){
		for(var i = this.objList.length - 1; i >= 0; i--)
			this.objList[i].draw(ctx);
		for(var i = this.terrain.length  - 1; i >= 0; i--)
			this.terrain[i].draw(ctx);
	}
	
	static withBounds(bounds, ceiling = true, walls = true){
		var r = new world();
		var thickness = 30;
		
		if(walls){
			r.addTerrain((new object()).setComposite(object.composite_rectangle(new vec2(thickness, bounds.height()))).setPos(new vec2(bounds.left(), bounds.center().y)).setStatic());
			r.addTerrain((new object()).setComposite(object.composite_rectangle(new vec2(thickness, bounds.height()))).setPos(new vec2(bounds.right(), bounds.center().y)).setStatic());
		}
		if(ceiling)
			r.addTerrain((new object()).setComposite(object.composite_rectangle(new vec2(bounds.width(), thickness))).setPos(new vec2(bounds.center().x, bounds.top())).setStatic());
		r.addTerrain((new object()).setComposite(object.composite_rectangle(new vec2(bounds.width(), thickness))).setPos(new vec2(bounds.center().x, bounds.bottom())).setStatic());
		
		return r;
	}
}