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
	
	getTimescale(){
		return this.physEngine.timing.timeScale;
	}
	setTimescale(ts){
		this.physEngine.timing.timeScale = ts;
	}
	
	update(dt){
		Matter.Engine.update(this.physEngine, dt);
		for(var i = this.objList.length - 1; i >= 0; i--)
			this.objList[i].update(this.getTimescale());
		for(var i = this.terrain.length - 1; i >= 0; i--)
			this.terrain[i].update(this.getTimescale());
	}
	
	add(obj){
		obj.preAdd();
		this.objList.push(obj);
		Matter.World.addComposite(this.physWorld, obj.composite);
	}
	remove(obj){
		obj.preRemove();
		Matter.World.remove(this.physWorld, obj);
		this.objList.splice(this.objList.indexOf(obj), 1);
	}
	
	addTerrain(obj){
		obj.preAdd();
		this.terrain.push(obj);
		Matter.World.addComposite(this.physWorld, obj.composite);
	}
	removeTerrain(obj){
		obj.preRemove();
		Matter.World.remove(this.physWorld, obj);
		this.terrain.splice(this.objList.indexOf(obj), 1);
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