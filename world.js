class world(){
	constructor(){
		this.physEngine = Matter.Engine.Create();
		this.physWorld = this.physEngine.world;
		
		this.objList = [];
	}
	
	update(dt){
		Matter.Engine.update(this.physEngine, dt);
		for(var i = this.objList.length - 1; i >= 0; i--)
			objList[i].update(dt);
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
	
	draw(ctx){
		for(var i = this.objList.length - 1; i >= 0; i--)
			objList[i].draw(ctx);
	}
}