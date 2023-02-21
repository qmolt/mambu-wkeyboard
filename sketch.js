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
let screenFont;
let fontReady = false;
let mambuIcon;
let wkeyImg;
let mambuAa;

//buttons coord
let xyFs = [0.0125, 0.0125, 0.05, 0.05];
let xySeld = [0.2, 0.0125, 0.05, 0.05];
let xySelc = [0.25, 0.0125, 0.075, 0.05];
let xySelu = [0.325, 0.0125, 0.05, 0.05];
let xyOctd = [0.5, 0.0125, 0.05, 0.05];
let xyOctu = [0.57, 0.0125, 0.05, 0.05];
let xyTrnd = [0.75, 0.0125, 0.05, 0.05];
let xyTrnu = [0.82, 0.0125, 0.05, 0.05];

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
function fontRead(){
    fontReady = true;
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
}

function setup(){
	
	//canvas
	cnv0 = createCanvas(displayWidth, displayHeight);
	cnv0.style('display', 'block');
	cnv0.parent('sketch-holder');
	cnv0.mousePressed(playState);
	cnv0.touchStarted(playState);

	orientationCorrection();
	imageMode(CORNER);

	//keyboard 1----------------------------------
	wKey = new wKeyboard(scales[idxScale].oct_div, scales[idxScale].struc);
	
	//audio---------------------------------------
	polySynth = new polyVoices(10);
	
}
function draw(){
	if(windowWidth != width && windowHeight != height){windowResized();}
	orientationCorrection();
	
	if(dated){
		background(51);			

		//draw menu
		drawMenu();	

		//draw logo
		push();
		rotate(ori_angle);
		image(mambuIcon, 0.025*bb, 0.25*bb, 0.1*bb, 0.1*bb); 
		image(wkeyImg, 0.12*bb, 0.25*bb, 0.2*bb, 0.1*bb);
		pop();

		//draw wkeyboard
		push();
		rotate(ori_angle);
		noStroke();
		fill(60);
		rect(0.01*aa, 0.39*bb, 0.98*aa, 0.61*bb); 
		pop();

		wKey.setSize(0.015*aa, 0.4*bb, 0.97*aa, 0.5*bb, ori);
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
	rectMode(CORNER);
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
function mousePressed(){
	mouseAdded = true;

	if(mouseX > bb*xyFs[0] && mouseX < bb*(xyFs[0]+xyFs[2]) && mouseY > bb*xyFs[1] && mouseY < bb*(xyFs[1]+xyFs[3])){fullscreenEvent();}

	if(mouseX > bb*xySeld[0] && mouseX < bb*(xySeld[0]+xySeld[2]) && mouseY > bb*xySeld[1] && mouseY < bb*(xySeld[1]+xySeld[3])){k0selectPrev();}
	if(mouseX > bb*xySelu[0] && mouseX < bb*(xySelu[0]+xySelu[2]) && mouseY > bb*xySelu[1] && mouseY < bb*(xySelu[1]+xySelu[3])){k0selectNext();}

	if(mouseX > bb*xyOctd[0] && mouseX < bb*(xyOctd[0]+xyOctd[2]) && mouseY > bb*xyOctd[1] && mouseY < bb*(xyOctd[1]+xyOctu[3])){k0OctDown();}
	if(mouseX > bb*xyOctu[0] && mouseX < bb*(xyOctu[0]+xyOctu[2]) && mouseY > bb*xyOctu[1] && mouseY < bb*(xyOctu[1]+xyOctu[3])){k0OctUp();}

	if(mouseX > bb*xyTrnd[0] && mouseX < bb*(xyTrnd[0]+xyTrnd[2]) && mouseY > bb*xyTrnd[1] && mouseY < bb*(xyTrnd[1]+xyTrnd[3])){k0TrnDown();}
	if(mouseX > bb*xyTrnu[0] && mouseX < bb*(xyTrnu[0]+xyTrnu[2]) && mouseY > bb*xyTrnu[1] && mouseY < bb*(xyTrnu[1]+xyTrnu[3])){k0TrnUp();}
}
function mouseReleased(){
	mouseAdded = false;
	let idxT = touches.findIndex(o  => o.id === 99);
	touches.splice(idxT, 1);
}

//aux---------------------------------------------------------------------------
function zMod(x, mod){
	while(x < 0){ x += mod; }
	return (x % mod);
}
function fl_mtof(oct_div, midi_note){
	const oct_mult = 2.0;
	const freq0 = 261.625565300598;
	return freq0 * Math.pow(oct_mult, midi_note/oct_div - 5);
}
function fl_ftom(oct_div, frequency){
	const oct_mult = 2.0;
	const freq0 = 261.625565300598;
	return oct_div * (Math.log(frequency / freq0) / Math.log(oct_mult) + 5);
}