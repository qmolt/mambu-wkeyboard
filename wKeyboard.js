class wKeyboard {
	constructor(octDiv, struc) {
		
		//size
		this.x0 = 0;
		this.y0  = 0;
		this.w = 1200;
		this.h = 220;
		this.ori = 'landscape';
		this.ori_angle = (ori === 'portrait')?HALF_PI:0;
		
		//ui
		this.n_oct = 3;
		this.c4oct = 1;
		//notes
		this.oct_div = octDiv;
		this.struc = struc;
		this.n_tonic = struc.length;
		this.t_notes = this.n_oct * this.oct_div + 1;
		//ui
		this.note_w = this.w / this.t_notes;
		this.note_h = this.h;
	}

	OctaveDown() {
		this.n_oct = max(1, this.n_oct-1); 
		this.updateKeySize();
	}
	OctaveUp() {
		this.n_oct = max(1, this.n_oct+1); 
		this.updateKeySize();
	}
	TranspDown() {
		this.c4oct = this.c4oct+1;
	}
	TranspUp() {
		this.c4oct = this.c4oct-1;
	}
	changeScale(octDiv, struc){
		this.oct_div = octDiv;
		this.struc = [];
		this.struc = struc;
		this.n_tonic = struc.length;
		this.updateKeySize();
	}
	setSize(x0, y0, w0, h0, orientation = 'landscape'){
		this.x0 = x0;
		this.y0 = y0;
		this.w = w0;
		this.h = h0;
		this.ori = orientation;
		this.ori_angle = (ori === 'portrait')?HALF_PI:0;
		this.updateKeySize();
	}
	updateKeySize(){
		this.t_notes = this.n_oct * this.oct_div + 1;
		this.note_w = this.w / this.t_notes;
		this.note_h = this.h;
	}
	drawKey(noteIdx, keyIdx){
		stroke(125);
		strokeWeight(2);

		if(noteIdx >= 0){ //white
			let note = keyIdx % this.oct_div;
			let idx_prev = zMod(noteIdx-1, this.n_tonic);
			let idx_next = zMod(noteIdx+1, this.n_tonic);
			let note_prev = this.struc[idx_prev];
			let note_next = this.struc[idx_next];

			let posx = this.x0 + this.note_w * keyIdx;
			let posy = this.y0;
			let posx_prev = (0.5 * this.note_w * zMod(note-note_prev-1, this.oct_div)); 
			let posx_next = (0.5 * this.note_w * zMod(note_next-note-1, this.oct_div)); 
			if(keyIdx == 0){posx_prev = 0;}
			if(keyIdx == this.t_notes - 1){posx_next = 0;}

			push();
			rotate(this.ori_angle);
			beginShape();
			vertex(posx, posy);
			vertex(posx, posy + 0.66 * this.note_h);
			//prev
			vertex(posx - posx_prev, posy + 0.66 * this.note_h);
			vertex(posx - posx_prev, posy + this.note_h);
			//----
			vertex(posx, posy + this.note_h);
			vertex(posx + this.note_w, posy + this.note_h);
			//next
			vertex(posx + this.note_w + posx_next, posy + this.note_h);
			vertex(posx + this.note_w + posx_next, posy + 0.66 * this.note_h);
			//----
			vertex(posx + this.note_w, posy + 0.66 * this.note_h);
			vertex(posx + this.note_w, posy)
			endShape(CLOSE);
			pop();
			
			if(noteIdx == 0){
				push();
				rotate(this.ori_angle);

				let cposx = posx + (this.note_w + posx_next - posx_prev) * 0.5;
				//noFill();
				//ellipse(cposx, posy + 0.85 * this.note_h, 5, 5);

				let oct = Math.trunc(this.keyToNote(keyIdx) / this.oct_div);
				textAlign(CENTER);
				noStroke();
				fill(240);
				textFont('Helvetica');
				textSize(18);
				text(`${oct}`, cposx, posy + this.note_h + 20);
				
				pop();
			}
		}else{ //black
			let posx = this.x0 + this.note_w * keyIdx;
			let posy = this.y0;
			let sq_w = this.note_w;
			let sq_h = 0.66 * this.note_h;

			push();
			rotate(this.ori_angle);
			rect(posx, posy, sq_w, sq_h);
			pop();
		}
	}
	drawKeyboard(){
		for(let i=0; i<this.t_notes; i++){
			let note = i % this.oct_div;
			let idx = this.struc.indexOf(note);

			if(idx<0){fill(31);}
			else{fill(225);}

			this.drawKey(idx, i);
		}
	}

	drawPressedNote(sel_key) {
		let note = sel_key % this.oct_div;
		let idx = this.struc.indexOf(note);

		noStroke();
		fill(127);
		this.drawKey(idx, sel_key);
	}

	overKeyboard(mX, mY) {
		let pX0 = this.x0;
		let pY0 = this.y0;
		
		if(mX>pX0 && mX<(pX0+this.w) && 
			mY>pY0 && mY<(pY0+this.h)){
			
			let sel_notey = Math.trunc((mY - pY0) / (0.66 * this.note_h)); //0 up, 1 down
			let sel_notex = Math.trunc((mX - pX0) / this.note_w);
			let note_side = Math.trunc((mX - pX0) / (0.5 * this.note_w))%2; //0 left, 1 right
			let overKey;

			if(sel_notey == 1){ //down
				let note = zMod(sel_notex, this.oct_div);
				let idx = this.struc.indexOf(note);

				if(idx >= 0){ //white
					overKey = sel_notex; 
				}else{ //down

					let note_next = this.struc.find(val => val > note);
					if(note_next == null){ note_next = 0; }
					let idx_next = this.struc.indexOf(note_next);
					let idx_prev = zMod(idx_next-1, this.n_tonic);
					let note_prev = this.struc[idx_prev];

					let count_prev = zMod(note-note_prev, this.oct_div); 
					let count_next = zMod(note_next-note, this.oct_div); 
					
					if (count_prev == count_next) {
						if (note_side) { overKey = sel_notex + count_next; }
						else { overKey = sel_notex - count_prev; }
					}
					else if (count_prev < count_next) { overKey = sel_notex - count_prev; }
					else { overKey = sel_notex + count_next; }
				}
			}else{ //up
				overKey = sel_notex;
			}
			return overKey;
		}
		else { return; }
	}

	keyToNote(keyPressed) {
		return keyPressed + this.oct_div * (5 - this.c4oct);
	}
}