class world{
	constructor(){
		this.physEngine = Matter.Engine.create();
		this.physWorld = this.physEngine.world;
		
		this.terrain = [];
		this.objList = [];
	}
	
	getTimeScale(){
		return this.physEngine.timing.timeScale;
	}
	setTimeScale(ts){
		this.physEngine.timing.timeScale = ts;
	}
	
	update(dt){
		Matter.Engine.update(this.physEngine, dt);
		for(var i = this.objList.length - 1; i >= 0; i--)
			this.objList[i].update(dt);
		for(var i = this.terrain.length - 1; i >= 0; i--)
			this.terrain[i].update(dt);
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
		console.log(this.terrain);
	}
	removeTerrain(obj){
		obj.preRemove();
		Matter.World.remove(this.physWorld, obj);
		this.terrain.splice(this.objList.indexOf(obj), 1);
	}
	
	draw(ctx){
		for(var i = this.terrain.length  - 1; i >= 0; i--)
			this.terrain[i].draw(ctx);
		for(var i = this.objList.length - 1; i >= 0; i--)
			this.objList[i].draw(ctx);
	}
	
	static withGround(groundY = 500, groundWidth = 10000){
		var r = new world();
		
		var terrain = new object();
		terrain.setComposite(object.composite_rectangle(new vec2(groundWidth, 100))).setPos(new vec2(0, groundY));
		terrain.setStatic();
		terrain.setPos(new vec2(0, groundY));
		r.addTerrain(terrain);
		
		return r;
	}
}