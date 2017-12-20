class object {
	constructor(){
		this.composite = null;
		this.inWorld = false;
	}
	
	getAllBodies(){
		return Matter.Composite.allBodies(this.composite);
	}
	setComposite(composite, keeppos = true){
		//if keeppos = true, keep the current object position, otherwise use the given composite's position
		var tpos = keeppos ? this.getPos() : null;
		this.composite = composite;
		
		if(tpos) this.setPos(tpos);
		return this;
	}
	
	setChildrenParent(){
		// set gameObject parent of bodies
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--)
			bods[i].gameObject = this;
		// set gameObject parent of composites
		var comps = Matter.Composite.allComposites(this.composite);
		for(var i = comps.length - 1;  i >= 0; i--)
			comps[i].gameObject = this;
		this.composite.gameObject = this;
	}
	
	preAdd(){
		this.setChildrenParent();
		this.inWorld = true;
	}
	preRemove(){
		this.inWorld = false;
	}
	
	setStatic(isstatic = true){
		var bods = this.getAllBodies();
		for(var i = bods.length - 1; i >= 0; i--)
			Matter.Body.setStatic(bods[i], isstatic);
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
	
	update(dt){}
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
	
	static empty(){
		return new object();
	}
	static default(){
		var r = new object();
		
		var comp = Matter.Composite.create();
		Matter.Composite.add(comp, Matter.Bodies.rectangle(0, 0, 10, 10));
		r.setComposite(comp);
		
		return r;
	}
}