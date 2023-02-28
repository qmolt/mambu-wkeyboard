let cnv0;
let scales;	
let idxScale = 8;
let dated = true;

//touches/audio
let mouseAdded = false;
let audioOnce = false; 
let pTouchesId = [];
let playing;

//wkeyboard
let wKey; 		//ui
let polySynth;	//polyph
let k0sel;

//orientation
let ori = 'landscape'; 
let ori_angle;
let aa; //long side
let bb; //short side

//assets
let mambuIcon;
let wkeyImg;
let oscImg;
let envImg;
let filtImg;
let envFiltImg;

//synth
let oscN = 0;
let filtN = 0;

//buttons coord
let xyFs = [0.0125, 0.0125, 0.05, 0.05];
let xySeld = [0.2, 0.0125, 0.05, 0.05];
let xySelc = [0.25, 0.0125, 0.075, 0.05];
let xySelu = [0.325, 0.0125, 0.05, 0.05];
let xyOctd = [0.5, 0.0125, 0.05, 0.05];
let xyOctu = [0.57, 0.0125, 0.05, 0.05];
let xyTrnd = [0.75, 0.0125, 0.05, 0.05];
let xyTrnu = [0.82, 0.0125, 0.05, 0.05];

let xyOsc = [0.48, 0.125, 0.1, 0.3];
//------------------------------------------------------------------------------
function k0selectPrev(){
	idxScale = max(0, idxScale-1);
	wKey.changeScale(scales[idxScale].oct_div, scales[idxScale].struc);
	dated = true;
}
function k0selectNext(){
	idxScale = min(scales.length-1, idxScale+1);
	wKey.changeScale(scales[idxScale].oct_div, scales[idxScale].struc);
	dated = true;
}
function k0OctDown(){
	wKey.OctaveDown();
	dated = true;
}
function k0OctUp(){
	wKey.OctaveUp();
	dated = true;
}
function k0TrnDown(){ 
	wKey.TranspDown();
	dated = true;
}
function k0TrnUp(){
	wKey.TranspUp();
	dated = true;
}

//screen
function fullscreenEvent() {
	let fs = fullscreen();
    fullscreen(!fs);
    dated = true;
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	dated = true;
}
function orientationCorrection() {
	if(deviceOrientation === 'portrait'){
	//if(true){ //debug
		translate(width, 0);
		ori_angle = HALF_PI;
		aa = height;
		bb = width;
		ori = 'portrait';
	}
	else{
		ori_angle = 0;
		aa = width;
		bb = height;
		ori = 'landscape';
	}
}

//p5----------------------------------------------------------------------------
function preload(){
	scales = [
		{"oct_div": 4, "struc": [0, 1, 2, 3]},
		{"oct_div": 5, "struc": [0, 1, 2, 3, 4]},
		{"oct_div": 6, "struc": [0, 1, 2, 3, 4, 5]},
		{"oct_div": 7, "struc": [0, 1, 2, 3, 4, 5, 6]},
		{"oct_div": 8, "struc": [0, 1, 2, 3, 4, 5, 6, 7]},
		{"oct_div": 9, "struc": [0, 1, 2, 3, 4, 5, 6, 7, 8]},
		{"oct_div": 10, "struc": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]},
		{"oct_div": 11, "struc": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
		{"oct_div": 12, "struc": [0, 2, 4, 5, 7, 9, 11]},
		{"oct_div": 13, "struc": [0, 2, 4, 6, 8, 10, 12]},
		{"oct_div": 13, "struc": [0, 2, 4, 5, 7, 9, 10, 12]},
		{"oct_div": 14, "struc": [0, 2, 4, 5, 7, 8, 10, 11, 13]},
		{"oct_div": 15, "struc": [0, 2, 4, 6, 8, 10, 12, 14]},
		{"oct_div": 16, "struc": [0, 2, 4, 6, 8, 9, 11, 13, 15]},
		{"oct_div": 17, "struc": [0, 3, 6, 9, 12, 15]},
		{"oct_div": 18, "struc": [0, 3, 6, 8, 11, 13, 16]},
		{"oct_div": 19, "struc": [0, 3, 6, 9, 11, 14, 17]},
		{"oct_div": 20, "struc": [0, 3, 6, 9, 12, 15, 18]},
		{"oct_div": 21, "struc": [0, 3, 6, 8, 11, 14, 16, 19]},
		{"oct_div": 23, "struc": [0, 4, 8, 12, 16, 20]},
		{"oct_div": 25, "struc": [0, 4, 8, 11, 15, 18, 22]},
		{"oct_div": 26, "struc": [0, 4, 8, 12, 15, 19, 23]},
		{"oct_div": 27, "struc": [0, 4, 8, 12, 16, 20, 24]},
		{"oct_div": 29, "struc": [0, 5, 10, 15, 20, 25]},
		{"oct_div": 32, "struc": [0, 5, 10, 14, 19, 23, 28]},
		{"oct_div": 33, "struc": [0, 5, 10, 15, 19, 24, 29]},
		{"oct_div": 35, "struc": [0, 6, 12, 18, 24, 30]},
		{"oct_div": 39, "struc": [0, 6, 12, 17, 23, 28, 34]},
		{"oct_div": 41, "struc": [0, 7, 14, 21, 28, 35]},
		{"oct_div": 47, "struc": [0, 8, 16, 24, 32, 40]},
		{"oct_div": 53, "struc": [0, 9, 18, 27, 36, 45]},
		{"oct_div": 59, "struc": [0, 10, 20, 30, 40, 50]},
		{"oct_div": 65, "struc": [0, 11, 22, 33, 44, 55]}
	];

	mambuIcon = loadImage('assets/icon.png');
	wkeyImg = loadImage('assets/wkeyboard.png');
	oscImg = loadImage('assets/osc.png');
	envImg = loadImage('assets/env.png');
	filtImg = loadImage('assets/filter.png');
	envFiltImg = loadImage('assets/env.png');
}

function setup(){
	
	//canvas
	cnv0 = createCanvas(displayWidth, displayHeight);
	cnv0.style('display', 'block');
	cnv0.parent('sketch-holder');
	cnv0.mousePressed(playState);
	cnv0.touchStarted(playState);

	orientationCorrection();

	//keyboard 1----------------------------------
	wKey = new wKeyboard(scales[idxScale].oct_div, scales[idxScale].struc);
	
	//audio---------------------------------------
	polySynth = new polyVoices(10);
	
	//
	imageMode(CORNER);
	rectMode(CORNER);
}
function draw(){
	if(windowWidth != width && windowHeight != height){windowResized();}
	orientationCorrection();
	
	if(dated){
		background(51);			

		//draw menu
		drawMenu();	

		//draw imgs
		push();
		rotate(ori_angle);

		//logo
		image(mambuIcon, 0.015*aa, 0.3*bb, 0.1*bb, 0.1*bb); 
		image(wkeyImg, 0.12*bb, 0.3*bb, 0.2*bb, 0.1*bb);

		//synth prop
		stroke(220);
		strokeWeight(5);
		line(0.49*aa, 0.35*bb, aa, 0.35*bb);
		//line(0.85*aa, 0.25*bb, 0.85*aa, 0.275*bb);
		noStroke();
		fill(80);
		rect(0.48*aa, 0.125*bb, 0.1*bb, 0.3*bb); 	//osc
		//rect(0.57*aa, 0.275*bb, 0.27*bb, 0.15*bb); 	//env
		//rect(0.775*aa, 0.1*bb, 0.27*bb, 0.15*bb); 	//envfilt
		//rect(0.775*aa, 0.275*bb, 0.27*bb, 0.15*bb);	//filt

		fill(195, 180, 121);
		rect(0.48*aa+0.016*bb, 0.141*bb+0.067*bb*oscN, 0.067*bb, 0.067*bb);
		let filtNx = filtN%4;
		let filtNy = Math.trunc(filtN/4);
		//rect(0.775*aa+0.015*bb+0.06*bb*filtNx, 0.29*bb+0.03*bb*filtNy, 0.06*bb, 0.03*bb);

		image(oscImg, 0.48*aa, 0.125*bb, 0.1*bb, 0.3*bb); 		//1:3
		//image(envImg, 0.57*aa, 0.275*bb, 0.27*bb, 0.15*bb); 	//9:5
		//image(envFiltImg, 0.775*aa, 0.1*bb, 0.27*bb, 0.15*bb); 	//9:5
		//image(filtImg, 0.775*aa, 0.275*bb, 0.27*bb, 0.15*bb); 	//9:5
		pop();

		//draw wkeyboard
		push();
		rotate(ori_angle);
		noStroke();
		fill(60);
		rect(0.01*aa, 0.44*bb, 0.98*aa, 0.61*bb); 
		pop();

		wKey.setSize(0.015*aa, 0.45*bb, 0.97*aa, 0.5*bb, ori);
		wKey.drawKeyboard();

		dated = false;
	}
	
	//add mouse
	if(mouseAdded){
		let idxT = touches.findIndex(o  => o.id == 99);
		if(idxT<0){
			let mouseObj = {};
			mouseObj.x = mouseX;
			mouseObj.y = mouseY;
			mouseObj.winX = mouseX;
			mouseObj.winY = mouseY;
			mouseObj.id = 99;
			touches.push(mouseObj);
		}
		else{	
			touches[idxT].x = mouseX;
			touches[idxT].y = mouseY;
			touches[idxT].winX = mouseX;
			touches[idxT].winY = mouseY;
		}
	}

	//stopped touches
	let touchesId = [];
	for(let i=0; i<touches.length; i++){touchesId.push(touches[i].id);}
	let missingTouches = pTouchesId.filter(o => touchesId.indexOf(o)<0);
	for(let i=0; i<missingTouches.length; i++){
		polySynth.releaseVoice(missingTouches[i]);
	}
	pTouchesId.splice(0, pTouchesId.length);

	//touches
	for(let i=0; i<touches.length; i++){
		let note_pressed, key_pressed, pX, pY;
		let idxS, freq;

		if(ori==='landscape'){
			pX = touches[i].x; 
			pY = touches[i].y;
		}
		else{
			pX = touches[i].y;
			pY = bb - touches[i].x;
		}
		key_pressed = wKey.overKeyboard(pX, pY);
		if(key_pressed != null){
			note_pressed = wKey.keyToNote(key_pressed);
			freq = fl_mtof(wKey.oct_div, note_pressed);
			//sound
			idxS = polySynth.voiceIdx(touches[i].id);
			if(idxS < 0){
				if(polySynth.attackVoice(touches[i].id, freq)){
					idxS = polySynth.voiceIdx(touches[i].id);
					pTouchesId.push(polySynth.poly[idxS].id);
					//draw
					wKey.drawPressedNote(key_pressed);
					dated = true;
				}
			}
			else{
				if(polySynth.changeVoice(idxS, freq)){
					pTouchesId.push(polySynth.poly[idxS].id);
					//draw
					wKey.drawPressedNote(key_pressed);
					dated = true;
				}
			}
		}
	}

	//volume
	polySynth.autoVolume();	
}

function drawMenu(){

	push();
	rotate(ori_angle);
	noStroke();
	
	fill(31);
	rect(0, 0, aa, bb*(xyFs[3]+0.025));
		
	fill(210);
 	rect(bb*xyFs[0], bb*xyFs[1], bb*xyFs[2], bb*xyFs[3]);
	rect(bb*xySelc[0], bb*xySelc[1], bb*xySelc[2], bb*xySelc[3]);
	rect(bb*xyOctd[0], bb*xyOctd[1], bb*xyOctd[2], bb*xyOctd[3]);
	rect(bb*xyOctu[0], bb*xyOctu[1], bb*xyOctu[2], bb*xyOctu[3]);
	rect(bb*xyTrnd[0], bb*xyTrnd[1], bb*xyTrnd[2], bb*xyTrnd[3]);
	rect(bb*xyTrnu[0], bb*xyTrnu[1], bb*xyTrnu[2], bb*xyTrnu[3]);

	textAlign(CENTER, CENTER);
	textSize(0.02*bb);
	noStroke();
	fill(40);
	textFont('Helvetica');

	text('□', bb*xyFs[0], bb*xyFs[1], bb*xyFs[2], bb*xyFs[3]);
	text(`${scales[idxScale].oct_div} | ${scales[idxScale].struc.length}`, 
		bb*xySelc[0], bb*xySelc[1], bb*xySelc[2], bb*xySelc[3]);
	text('-', bb*xyOctd[0], bb*xyOctd[1], bb*xyOctd[2], bb*xyOctu[3]);
	text('+', bb*xyOctu[0], bb*xyOctu[1], bb*xyOctu[2], bb*xyOctu[3]);
	text('←', bb*xyTrnd[0], bb*xyTrnd[1], bb*xyTrnd[2], bb*xyTrnd[3]);
	text('→', bb*xyTrnu[0], bb*xyTrnu[1], bb*xyTrnu[2], bb*xyTrnu[3]);

	fill(210);
	text('<', bb*xySeld[0], bb*xySeld[1], bb*xySeld[2], bb*xySeld[3]);
	text('>', bb*xySelu[0], bb*xySelu[1], bb*xySelu[2], bb*xySelu[3]);
	pop();
}

function playState(){
	Tone.start();
	Tone.Transport.loop = false;
	Tone.Transport.start();
}
function touchStarted(){

	//prevent dflt
	return false;
}
function mousePressed(){
	let pX, pY;

	if(ori==='landscape'){
		pX = mouseX; 
		pY = mouseY;
	}
	else{
		pX = mouseY;
		pY = bb - mouseX;
	}

	if(pY < bb*(xyFs[3]+0.025)){
		if(pX > bb*xyFs[0] && pX < bb*(xyFs[0]+xyFs[2]) && pY > bb*xyFs[1] && pY < bb*(xyFs[1]+xyFs[3])){fullscreenEvent();}
		else if(pX > bb*xySeld[0] && pX < bb*(xySeld[0]+xySeld[2]) && pY > bb*xySeld[1] && pY < bb*(xySeld[1]+xySeld[3])){k0selectPrev();}
		else if(pX > bb*xySelu[0] && pX < bb*(xySelu[0]+xySelu[2]) && pY > bb*xySelu[1] && pY < bb*(xySelu[1]+xySelu[3])){k0selectNext();}
		else if(pX > bb*xyOctd[0] && pX < bb*(xyOctd[0]+xyOctd[2]) && pY > bb*xyOctd[1] && pY < bb*(xyOctd[1]+xyOctu[3])){k0OctDown();}
		else if(pX > bb*xyOctu[0] && pX < bb*(xyOctu[0]+xyOctu[2]) && pY > bb*xyOctu[1] && pY < bb*(xyOctu[1]+xyOctu[3])){k0OctUp();}
		else if(pX > bb*xyTrnd[0] && pX < bb*(xyTrnd[0]+xyTrnd[2]) && pY > bb*xyTrnd[1] && pY < bb*(xyTrnd[1]+xyTrnd[3])){k0TrnDown();}
		else if(pX > bb*xyTrnu[0] && pX < bb*(xyTrnu[0]+xyTrnu[2]) && pY > bb*xyTrnu[1] && pY < bb*(xyTrnu[1]+xyTrnu[3])){k0TrnUp();}
	}
	else if(pY < 0.45*bb){
		if(overOsc(pX, pY)){return;}
		//if(overEnv(pX, pY)){return;}
		//if(overFiltEnv(pX, pY)){return;}
		//if(overFilter(pX, pY)){return;}
	}
	else{mouseAdded = true;}
}
function mouseReleased(){
	mouseAdded = false;
	let idxT = touches.findIndex(o  => o.id === 99);
	touches.splice(idxT, 1);
}

function overOsc(mX, mY){ //1:3 
	let pX0 = aa*xyOsc[0];	
	let pY0 = bb*xyOsc[1];
	let sqW = bb*xyOsc[2]/6;	//1:4:1 = 6
	let sqH = bb*xyOsc[3]/18;	//1:4x4:1 = 18

	if(mX > pX0+sqW && mX < pX0+5*sqW && mY > pY0+sqH && mY < pY0+17*sqH){
		oscN = Math.trunc((mY-pY0-sqH)/(4*sqH));
		
		if(oscN == 0){polySynth.setOscType('sine');}
		else if(oscN == 1){polySynth.setOscType('triangle');}
		else if(oscN == 2){polySynth.setOscType('sawtooth');}
		else if(oscN == 3){polySynth.setOscType('square');}
		dated = true;
		
		return true;
	}
	return false;
}
function overEnv(mX, mY){ //9:5
	let pX0;
	let pY0;
	let sqW = oscW/54;	//3:6*2:4*2:8*2:6*2:3 = 54
	let sqH = oscH/30;	//3:12*2:3 = 30
}
function overFiltEnv(mX, mY){ //9:5
	let pX0;
	let pY0;
	let sqW = oscW/54;	//3:6*2:4*2:8*2:6*2:3 = 54
	let sqH = oscH/30;	//3:12*2:3 = 30
}
function overFilter(mX, mY){ //9:5
	let pX0;
	let pY0;
	let sqW = oscW/18;	//1:4x4:1 = 18 //2:4:1:4:1:4:2 = 18
	let sqH = oscH/10;	//1:2:2:1:3:1 = 10
}

//aux---------------------------------------------------------------------------
function zMod(x, mod){
	while(x < 0){ x += mod; }
	return (x % mod);
}
function fl_mtof(oct_div, midi_note){
	return 8.175798915643687 * Math.pow(2.0, midi_note/oct_div);
}
function fl_ftom(oct_div, frequency){
	return oct_div * (Math.log(frequency) * 1.442695040889 - 3.031359713524656);
}