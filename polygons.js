//Created by Isaiah Smith

var enumBooleanOp = {
		union: 0,		// or
		difference: 1,	// not
		intersect: 2,	// and
		xor: 3			// exclusive or
	};

/* class vec2:
	data structure used for storing vectors,
	also contains useful methods for doing vector math
*/
class vec2{
	constructor(x = 0, y = 0){
		this.x = x;
		this.y = y;
	}
	
	normalized(magnitude = 1){
		//returns a vector 2 with the same direction as this but
		//with a specified magnitude
		return this.multiply(magnitude / this.distance());
	}
	inverted(){
		//returns the opposite of this vector
		return this.multiply(-1);
	}
	multiply(factor){
		//returns this multiplied by a specified factor		
		return new vec2(this.x * factor, this.y * factor);
	}
	plus(vect2){
		//returns the result of this added to another specified vector2
		return new vec2(this.x + vect2.x, this.y + vect2.y);
	}
	minus(vect2){
		//returns the result of this subtracted by another specified vector2
		return this.plus(vect2.inverted());
	}
	equals(vect2, leniency = 0){
		//returns true if the difference between the two vectors is less than the specified leniency
		return (
			Math.abs(this.x - vect2.x) <= leniency) && (
			Math.abs(this.y - vect2.y) <= leniency);
	}
	
	static average(points = []){
		var p = new vec2();
		for(var i = points.length - 1; i >= 0; i--)
			p = p.plus(points[i]);
		p = p.multiply(1 / points.length);
		return p;
	}
	
	direction(){
		// returns the angle this vector is pointing in radians
		return Math.atan2(this.y, this.x);
	}
	directionTo(vec){
		// returns the angle at which this points to another vector
		return vec.minus(this).direction();
	}
	distance(vect2 = null){
		//returns the distance between this and a specified vector2
		if(vect2 === null)
			vect2 = new vec2();
		var d = Math.sqrt(
			Math.pow(this.x - vect2.x, 2) + 
			Math.pow(this.y - vect2.y, 2));
		return d;
	}
	
	clone(){
		return new vec2(this.x, this.y);
	}
	toAnonObj(){
		// returns an anonymous object with x and y fields
		return {x: this.x, y:this.y};
	}
	
	static fromAnonObj(vec){
		// returns a vec2 object given any object with x and y fields
		return new vec2(vec.x, vec.y);
	}
	static fromAng(angle, magnitude = 1){
		//returns a vector which points in the specified angle
		//and has the specified magnitude
		return new vec2(
			Math.cos(angle) * magnitude, 
			Math.sin(angle) * magnitude);
	}
	
	toString(){
		return "<" + this.x + "," + this.y + ">";
	}
}
class polygon{
	//type for drawing shapes and doing geometry calculations
	constructor(){
		this.parent = null; //for user data reference
		this._points = [];
		this._position = new vec2();
		this._scale = 1;
		this._rotation = 0;
		this._absVerts = [];
		this._boundingbox = null;
		this._flipped = false;
		this._rays = null;	//see 'ray.addPolygonRays(poly)'
	}
	
	getBoundingBox(){
		if(this._boundingBox == null)
			this.updateBoundingBox();
		return this._boundingbox;
	}
	updateBoundingBox(){
		var absverts = this.getAbsVerts();
		if(absverts.length < 1)
			return new box(this._position.x, this._position.y);
		var l = absverts[0].x;
		var r = absverts[0].x;
		var t = absverts[0].y;
		var b = absverts[0].y;
		for(var i = 1; i < absverts.length; i += 1){
			l = Math.min(l, absverts[i].x);
			r = Math.max(r, absverts[i].x);
			t = Math.min(t, absverts[i].y);
			b = Math.max(b, absverts[i].y);
		}
		this._boundingbox = new box(l, t, r-l, b-t);
	}
	getAbsoluteVertices(){
		if(this._absVerts == null)
			this.updateAbsVerts();
		return this._absVerts;
	}
	getAbsVerts(){
		return this.getAbsoluteVertices();
	}
	updateAbsVerts(){
		this._absVerts = [];
		for(var i = 0; i < this._points.length; i++){
			var v = this._points[i];
			v.x *= this._flipped ? -1 : 1;
			
			var ang = v.direction();
			var mag = v.distance();
			v = vec2.fromAng(ang + this._rotation, mag);
			
			v = v.multiply(this._scale);
			v = v.plus(this._position);
			this._absVerts.push(v);
		}
		this._rays = null;	//reset so they have to be recalculated when next called for
		this.updateBoundingBox();
	}
	setVerts(vertices){
		this._points = vertices;
		this.updateAbsVerts();
	}
	getVerts(){
		return this._points;
	}
	setAbsVerts(absverts){
		this._points = [];
		for(var i = 0; i < absverts.length; i++){
			var v = absverts[i];
			v = v.plus(this._position.inverted());
			v = v.multiply(1 / this._scale);
			
			var ang = v.direction();
			var mag = v.distance();
			v = vec2.fromAng(ang - this._rotation, mag);
			
			v.x *= this._flipped ? -1 : 1;
			this._points.push(v);
		}
		this._absVerts = null;
		this._rays = null;
	}
	
	transformPoints(translate, scale = 1, rotate = 0){
		//transforms the point data of the polygon
		for(var i = 0; i < this._points.length; i += 1){
			var v = this._points[i];
			
			var ang = v.direction();
			var mag = v.distance();
			v = vec2.fromAng(ang + rotate, mag);
			
			v = v.multiply(scale);
			v = v.plus(translate);
			this._points[i] = v;
		}
		this._absVerts = null;
	}
	flipPoints(vertically = true, horizontally = false){
		// flips points along the relative axes
		// if vertically, flips ACROSS y-axis (x *= -1)
		// if horizontally, flips ACROSS x-axis (y *= -1)
		for(var i = 0; i < this._points.length; i += 1){
			var v = this._points[i];
			
			if(vertically) v.x *= -1;
			if(horizontally) v.y *= -1;
			
			this._points[i] = v;
		}
		this._absVerts = null;
	}
	movePos(translation){
		this._position = this._position.plus(translation);
		this._absVerts = null;
		return this;
	}	
	setPos(pos){
		this._position = pos;
		this._absVerts = null;
		return this;
	}
	getPos(){
		return this._position;
	}
	setScale(scale){
		this._scale = scale;
		this._absVerts = null;
		return this;
	}
	getScale(){
		return this._scale;
	}
	setRot(angle){
		this._rotation = angle;
		this._absVerts = null;
		return this;
	}
	getRot(){
		return this._rotation;
	}
	setFlipped(flip = true){
		this._flipped = flip;
		this._absVerts = null;
	}
	getFlipped(){
		return this._flipped;
	}
	getEdgeRays(){
		if(!this._rays)
			ray.addPolygonRays(this);
		return this._rays;
	}
	
	containsPoint(point, testAng = 0.01){
		//testAng rarely makes a difference, so don't worry about it, 
		//as long as you dont set it to a multiple of pi/2 (including 0) you'll be fine
		if(!this.getBoundingBox().containsPoint(point)) return false;
		
		var testRay = new ray(point, testAng);
		var cols = testRay.polygonIntersections(this);
		
		//returns true if the ray has an odd number of intersections
		return cols.length % 2 === 1;
	}
	worldPointToLocal(position){
		//transforms an absolute position to the same position in the scope of this polygon
		var v = position;
		
		v = v.minus(this.getPos());
		v = v.multiply(1 / this.getScale())
		
		var ang = v.direction();
		var mag = v.distance();
		v = vec2.fromAng(ang - this.getRotation(), mag);
		
		return v;
	}
	
	polygonIntersections(poly){
		//returns the intersections between this and another
		//polygon
		if(!box.testOverlap(this.getBoundingBox(), poly.getBoundingBox()))
			return [];
		var cols = [];
		var edges = this.getEdgeRays();
		var oEdges = poly.getEdgeRays();
		for(var i = 0;i < edges.length;i += 1){
			cols = cols.concat(edges[i].polygonCollision(poly));
		}
		return cols;
	}
	
	drawOutline(ctx, color = "#888", thickness = 1){
		var absverts = this.getAbsVerts();
		if(absverts.length < 2)
			return;
		ctx.strokeStyle = color;
		ctx.lineWidth = thickness;
		ctx.beginPath();
		ctx.moveTo(absverts[0].x, absverts[0].y);
		for(var i = 0; i < absverts.length; i += 1){
			var i2 = i + 1;
			if(i2 >= absverts.length)
				i2 = 0;
			ctx.lineTo(absverts[i2].x, absverts[i2].y);
		}
		ctx.stroke();
	}
	drawFill(ctx, color = "#888"){
		var absverts = this.getAbsVerts();
		if(absverts.length < 3)
			return;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(absverts[0].x, absverts[0].y);
		for(var i = 0; i < absverts.length; i += 1){
			var i2 = i + 1;
			if(i2 >= absverts.length)
				i2 = 0;
			ctx.lineTo(absverts[i2].x, absverts[i2].y);
		}
		ctx.fill();
	}
	
	static Rectangle(width, height = width){
		var p = new polygon();
		var verts = [
			new vec2(width / -2, height / -2),
			new vec2(width / -2, height / 2),
			new vec2(width / 2, height / 2),
			new vec2(width / 2, height / -2)
		];
		p.setVerts(verts);
		return p;
	}
	static Circle(radius, segments = 12){
		var p = new polygon();
		var verts = [];
		for (var i = 0; i < segments; i += 1){
			var ang = (i / segments) * (Math.PI * 2);
			var vec = vec2.fromAng(ang, radius);
			verts.push(vec);
		}
		p.setVerts(verts);
		return p;
	}
	
	toString(){
		return "polygon: " + this._points.toString();
	}
}
class box{
	//axis aligned bounding box
	constructor(x = 0, y = 0, w = 0, h = 0){
		this.position = new vec2(x, y);
		this.size = new vec2(w, h);
	}
	
	top(){
		return this.position.y;
	}
	bottom(){
		return this.position.y + this.size.y;
	}
	left(){
		return this.position.x;
	}
	right(){
		return this.position.x + this.size.x;
	}
	topLeft(){
		return this.position;
	}
	bottomRight(){
		return this.position.plus(this.size);
	}
	center(){
		return new vec2( (this.left() + this.right()) / 2, (this.top() + this.bottom()) / 2 );
	}
	
	width(){
		return this.size.x;
	}
	height(){
		return this.size.y;
	}
	
	drawOutline(ctx, color = "#888", thickness = 1){
		ctx.strokeStyle = color;
		ctx.lineWidth = thickness;
		ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
	}
	drawFill(ctx, color = "#888"){
		ctx.fillStyle = color;
		ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
	}
	
	extended(other){
		//extends the boundaries of this box to encase another box
		var maxX = Math.max(this.left(), this.right(), other.left(), other.right());
		var maxY = Math.max(this.top(), this.bottom(), other.top(), other.bottom());
		var minX = Math.min(this.left(), this.right(), other.left(), other.right());
		var minY = Math.min(this.top(), this.bottom(), other.top(), other.bottom());
		return box.fromSides(minX, maxX, minY, maxY);
	}
	containsPoint(point){
		return (
			point.x >= this.position.x &&
			point.x <= this.right() &&
			point.y >= this.position.y &&
			point.y <= this.bottom());
	}
	testIntersect(testray){
		if(this.containsPoint(testray.getPos()))
			return true;
		if(testray._isVertical){
			var testy = testray._m > 0 ? this.position.y : this.bottom();
			return (
				testray._origin.x >= this.position.x &&
				testray._origin.x <= this.right() &&
				testy <= testray.length);
		}
		
		//test points on edges
		var x_t = testray.getEndPos().x;
		var xmin = Math.min(testray._origin.x, x_t);	//for making sure the intersect
		var xmax = Math.max(testray._origin.x, x_t);	//is in range of the ray
		var yal = testray.getY(this.position.x); //y at left
		if(yal >= this.position.y && yal <= this.bottom())
			if(xmin <= this.position.x && this.position.x <= xmax)
				return true;
		var yar = testray.getY(this.right());
		if(yar >= this.position.y && yar <= this.bottom())
			if(xmin <= this.right() && this.right() <= xmax)
				return true;
		var xat = testray.getX(this.position.y); //x at top
		if(xat >= this.position.x && xat <= this.right())
			if(xmin <= xat && xat <= xmax)
				return true;
		var xab = testray.getX(this.bottom());
		if(xab >= this.position.x && xab <= this.right())
			return xmin <= xab && xab <= xmax;
		return false;
	}
	
	static testOverlap(boxA, boxB){
		return !(
				boxB.left() > boxA.right() ||
				boxB.right() < boxA.left() ||
				boxB.top() > boxA.bottom() ||
				boxB.bottom() < boxA.top());
	}
	static fromSides(l, r, t, b){
		return new box(l, t, r-l, b-t);
	}
	static canvasBounds(canvas){
		return box.fromSides(0, canvas.width, 0, canvas.height);
	}
	
	toString(){
		return "box: l:" + this.left() +
			" r:" + this.right() + 
			" t:" + this.top() + 
			" b:"	+ this.bottom();
	}
}
class ray{
	constructor(pos = new vec2(), angle = 0, length = Infinity){
		this.length = length;
		//do not directly modify _private _variables:
		this._parentPoly = null;
		this._origin = pos;
		this._m = 0;
		this._b = 0;
		this._isVertical = false;
		this._angle = 0;
		
		this.setAngle(angle);
		//would normally need to call this.recalculate but since it is
		//already called inside of this.setAngle, it would be redundant
	}
	
	getPos(){
		return this._origin;
	}
	setPos(pos){
		this._origin = pos;
		this.recalculate();
	}
	getEndPos(){
		var mag = this.length;
		if(mag == Infinity)
			mag = 999999;
		return this._origin.plus(vec2.fromAng(this._angle).multiply(mag));
	}
	setEndPos(pos){
		var mag = this._origin.distance(pos);
		var dir = pos.minus(this._origin).direction();
		this.length = mag;
		this._angle = dir;
		this.recalculate();
	}
	getAngle(){
		return this._angle;
	}
	setAngle(angle){
		//sets the angle that the ray points in
		//ensures that any given angle is wrapped between (-pi, pi]
		if(Math.abs(angle) > Math.PI)
			angle = angle % Math.PI * -1;
		if(angle == -Math.PI)
			angle = Math.PI;
		
		this._angle = angle;
		this.recalculate();
	}
	getSlope(){
		if(this._isVertical)
			return this._m * Infinity;
		return this._m;
	}
	getOffsetY(){
		if(this._isVertical)
			return this._m * -1 * Infinity;
		return this._b;
	}
	getY(x){
		//returns the y value that lies on the ray, given x
		if(this._isVertical){
			return x >= this.origin.x ? 
				this._m * Infinity : 
				this._m * -Infinity;
		}
		//the ray is stored as a simple formula in slope intercept form: 
		//y = m * x + b
		return this._m * x + this._b;
	}
	getX(y){
		//returns x of ray, given y
		if(this._m === 0)
			return this._origin.y;
		//x = (y-b)/m
		return (y - this._b) / this._m;
	}
	isHorizontal(){
		return this._m === 0;
	}
	recalculate(){
		//recalculate the rays slope intercept formula variables
		if(Math.abs(Math.abs(this._angle) - Math.PI / 2)
				<= 0.0000001){										//if the angle is vertical,
			this._m = Math.sign(this._angle);	 //_m stores the direction that
			this._b = 0;												//the ray is pointing in, while
			this._isVertical = true;						//_b is truncated
		}
		else{																 //if the angle is not vertical
			this._m = Math.tan(this._angle);//convert the angle to a slope
			this._b = this._origin.y - (this._m * this._origin.x);	//and find 
			this._isVertical = false;					 //the line's vertical offset
		}
	}
	
	containsPoint(point, leniency = 0.01){
		// returns true if the point lies on the ray
		if(point.distance(this.getPos()) > this.length) return false;
		
		// FIX make less likely to have logical leniency error
		var pointDir = this._origin.directionTo(point);
		return Math.abs(pointDir - this.getAngle()) <= leniency;
	}
	intersection(otherRay){
		//returns the intesection point between this and specified
		//ray if there is one, otherwise returns null
		if(this._angle === otherRay._angle ||	 //impossible collisions
			this.getPos().distance(otherRay.getPos()) > this.length + otherRay.length)
			return null;
		
		//optomize for vertical / horizontal raycasts
		if(this._isVertical) return this.intersect_vertical(otherRay);
		if(otherRay._isVertical) return otherRay.intersect_vertical(this);
		//FIX
		//if(this.isHorizontal()) return this.intersect_horizontal(otherRay);
		//if(otherRay.isHorizontal()) return otherRay.intersect_horizontal(this);
		
		var intersect = new vec2();
		//calculate intersection
		intersect.x = (otherRay._b - this._b) / (this._m - otherRay._m);
		intersect.y = this._m * intersect.x + this._b;
		
		return this._intersectRayCheck(intersect, otherRay) ? intersect : null;
	}
	intersect_vertical(otherRay){
		//parallel rays never intersect
		if(otherRay._isVertical) return null;
		
		//calculate vertical intersection
		var intersect = new vec2();
		
		if(otherRay.isHorizontal()){
			//optomize calculation for horizontal vs vertical intersection
			intersect.x = this._origin.x;
			intersect.y = otherRay._origin.y;
		}
		else{
			intersect.x = this._origin.x;
			intersect.y = otherRay.getY(intersect.x);
		}
		
		return this._intersectRayCheck(intersect, otherRay) ? intersect : null;
	}
	intersect_horizontal(otherRay){
		//parallel rays never intersect
		if(otherRay.isHorizontal()) return null;
		
		//calculate vertical intersection
		var intersect = new vec2();
		
		if(otherRay.isVertical()){
			//optomize calculation for vertical vs horizontal intersection
			intersect.y = this._origin.y;
			intersect.x = otherRay._origin.x;
		}
		else{
			intersect.y = this._origin.y;
			intersect.x = otherRay.getX(intersect.y);
		}
		
		return this._intersectRayCheck(intersect, otherRay) ? intersect : null;
	}
	_intersectRayCheck(intersect, otherRay){
		return this.containsPoint(intersect) && otherRay.containsPoint(intersect);
	}
	
	polygonIntersections(poly){
		if(!poly.getBoundingBox().testIntersect(this))
			return [];
		var cols = [];
		for(var i = 0; i < poly.getEdgeRays().length; i += 1){
			var col = this.intersection(poly._rays[i]);
			if(col != null)
				cols.push(new rayCollision(col, this, poly._rays[i], poly, i));
		}
		return cols;
	}
	rayCast(polygonList){
		var cols = [];
		for(var pol = 0; pol < polygonList.length; pol += 1){
			cols = cols.concat(this.polygonCollision(polygonList[pol]));
		}
		return cols;
	}
	
	draw(ctx, color = "#f00", width = 1){
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(this.getPos().x, this.getPos().y);
		var end = this.getEndPos();
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	}
	drawDebug(ctx, color = "#f00", width = 1){
		ctx.lineWidth = width * 2;
		ctx.beginPath();
		ctx.moveTo(this.getPos().x, this.getPos().y);
		var end = this.getPos().plus(vec2.fromAng(this.getAngle(), this.length / 4));
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
		
		this.draw(ctx, color, width);
	}
	
	static addPolygonRays(poly){
		//calculates the specified polygon's _rays from it's vertices
		var absVerts = poly.getAbsoluteVertices();
		poly._rays = [];
		for(var i = 0; i < absVerts.length; i += 1){
			var i2 = i + 1;
			if(i2 >= absVerts.length)
				i2 = 0;
			
			var r = ray.fromPoints(absVerts[i], absVerts[i2]);
			r._parentPoly = poly;
			poly._rays.push(r);
		}
	}
	static rayData(m, b, length = Infinity){
		var r	= new ray();
		r._angle = null;
		r._m = m;
		r._b = b;
		r.length = length;
		r._origin = new vec2();
		return r;
	}
	static fromPoints(start, end){
		var ang = end.minus(start).direction();
		var length = end.distance(start);
		var r = new ray(start, ang, length);
		return r;
	}
}
class rayCollision{
	constructor(collisionPoint, rayCasted = null, rayTarget = null, polyTarget = null, vertIndex = null){
		this.polygonTarget = polyTarget;
		this.rayCasted = rayCasted;
		this.rayTarget = rayTarget;
		this.intersection = collisionPoint;
		this.vertexIndex = vertIndex;
	}
}

class booleanOperation{
	constructor(subject, mask, operation = enumBooleanOp.union){
		this.subject = subject;
		this.mask = mask;
		this.operation = operation;
	}
	
	getResult(){
		switch(this.operation){
			case enumBooleanOp.union: return booleanOperation.union(this.subject, this.mask);
			case enumBooleanOp.difference:  return booleanOperation.difference(this.subject, this.mask);
			case enumBooleanOp.intersect:  return booleanOperation.intersect(this.subject, this.mask);
			case enumBooleanOp.xor: return  booleanOperation.xor(this.subject, this.mask);
		}
	}
	
	static union_plus(subject, mask){
		//crawling vertex algorithm
		var r = new polygon();
		var nVerts = [];
		
		var aabb_ext = subject.getBoundingBox().extended(mask.getBoundingBox());
		var crawlRayStart = ray.fromPoints(aabb_ext.topLeft(), aabb_ext.bottomRight());
		var crsX = crawlRayStart.polygonIntersections(subject).concat(crawlRayStart.polygonIntersections(mask));
		crsX.sort(function(a,b) {
			return a.intersection.distance(crawlRayStart.getPos()) - b.intersection.distance(crawlRayStart.getPos());
		});
		var crawlStart = crsX[0];
		var csIndex = crawlStart.vertexIndex;
		var currentVerts = crawlStart.rayTarget._parentPoly.getAbsVerts(); // absolute vertices of poly currently crawling on
		var ncp = crawlStart.rayTarget._parentPoly == subject ? mask : subject; // the poly not currently crawling on
		var csIndex_next = wrapValue(csIndex + 1, currentVerts.length); //index of next vertex to crawl to
		var currentRay = ray.fromPoints(crawlStart.intersection, currentVerts[csIndex_next]);
		
		var ncpX = currentRay.polygonIntersections(ncp);
		ncpX.sort(function(a,b){
			return a.intersection.distance(currentRay.getPos()) - b.intersection.distance(currentRay.getPos());
		});
		ncpX = ncpX.length > 0 ? ncpX[0] : null;
		var k = 0;
		do{
			if(ncpX){
				currentVerts = ncp.getAbsVerts();
				ncp = ncp == subject ? mask : subject;
				csIndex = ncpX.vertexIndex;
				csIndex_next = wrapValue(csIndex + 1, currentVerts.length);
				currentRay = ray.fromPoints(ncpX.intersection, currentVerts[csIndex_next]);
			} else {
				csIndex = wrapValue(csIndex + 1, currentVerts.length);
				csIndex_next = wrapValue(csIndex_next + 1, currentVerts.length);
				currentRay = ray.fromPoints(currentVerts[csIndex], currentVerts[csIndex_next]);
			}
			nVerts.push(currentRay.getPos().clone());
			
			ncpX = currentRay.polygonIntersections(ncp);
			ncpX.sort(function(a,b){
				return a.intersection.distance(currentRay.getPos()) - b.intersection.distance(currentRay.getPos());
			});
			ncpX = ncpX.length > 0 ? ncpX[0] : null;
			if(ncpX)
				currentRay.length = ncpX.intersection.distance(currentRay.getPos());
			k++;
		} while(!currentRay.containsPoint(crawlStart.intersection) && k < 1000);
		
		nVerts.push(currentVerts[csIndex]);
		
		r.setVerts(nVerts);
		return r;
	}
	static union(subject, mask){
		var r = new polygon();
		
		// vertex index info
		var mAV = mask.getAbsVerts();
		var sAV = subject.getAbsVerts();
		var mFI = null;					//mask first colliding intersect
		var mLI = null;					//mask last colliding intersect
		var mFV = null;					//mask first colliding vertex
		var mLV = null;					//mask last colliding vertex
		var sFV = null;					//subject first colliding vertex
		var sLV = null;					//subject last colliding vertex
		
		//iterate through each mask vertex but start iteration on a vertex that isn't inside the subject
		var off = 0;
		while(subject.containsPoint(mAV[off])) off++;
		for(var i = mAV.length - 1; i >= 0; i--){
			var i0 = wrapValue(off + i, mAV.length);
			var i1 = wrapValue(i0 - 1, mAV.length);
			var cv0 = mAV[i0];
			var cv1 = mAV[i1];
			
			var cRay = ray.fromPoints(mAV[i0], mAV[i1]);
			var cX = cRay.polygonIntersections(subject);
			cX.sort(function(a,b){
				return a.intersection.distance(cRay.getPos()) - b.intersection.distance(cRay.getPos());
			});
			
			//on ray intersection
			if(cX.length > 0){
				if(!mFV) {
					mFI = cX[0].intersection;
					mFV = i0;
					sFV = cX[0].vertexIndex;
				}
				mLI = cX[cX.length - 1].intersection;
				sLV = wrapValue(cX[cX.length - 1].vertexIndex + 1, sAV.length);
				
				// mLV remains null if there is no mask vertices between the max and min intersections
				mLV = i0;
			}
		}
		
		// make shape to be extended on to subject
		var mAV_ext = [mFI];
		for(var i = mFV; i != wrapValue(mLV, mAV.length); i = wrapValue(i + 1, mAV.length))
			mAV_ext.push(mAV[i]);
		mAV_ext.push(mLI);
		
		// make shape to be extended from
		var sAV_ext = [];
		for(var i = sLV; i != sFV; i = wrapValue(i + 1, sAV.length))
			sAV_ext.push(sAV[i]);
		sAV_ext.push(sAV[sFV]);
		
		// make combined shape
		var verts = [];
		for(var i = 0; i < mAV_ext.length; i++){
			verts.push(mAV_ext[i].clone());
		}
		for(var i = 0; i < sAV_ext.length; i++){
			verts.push(sAV_ext[i].clone());
		}
		
		r.setVerts(verts);
		return r;
	}
	static difference(subject, mask){
		var r = new polygon();
		
		return r;
	}
	static intersect(subject, mask){
		var r = new polygon();
		
		return r;
	}
	static xor(subject, mask){
		var r = new polygon();
		
		return r;
	}
}

function wrapValue(value, max){
	if(value < 0)
		return max + (value % max);
	if(value >= max)
		return value % max;
	return value;
}
