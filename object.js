class object {
	constructor(){
		this.composite = null;
	}
	
	setMatter(composite){
		var tpos = this.getPos();
		this.composite = composite;
		this.setPos(tpos);
	}
	
	getPos(){
		if(!this.composite) return null;
	}
	setPos(vec){
		if(!this.composite) return;
		return this;
	}
	getVel(){
		if(!this.composite) return null;
	}
	setVel(vec){
		if(!this.composite) return null;
		return this;
	}
	
	update(dt){
		
	}
	draw(ctx){
		
	}
	
	static empty(){
		return new object();
	}
	static default(){
		var r = new object();
		
		
		
		return r;
	}
}