let cnv0;
let scales;	

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

//DOM---------------------------------------------------------------------------
function k0selectEvent(){
	wKey.scale = scales[k0sel.value()];
	wKey.oct_div = wKey.scale.oct_div;
	wKey.struc = wKey.scale.struc;
	wKey.n_tonic = wKey.scale.struc.length;
	wKey.dated = true;
}
function k0OctDown(){wKey.OctaveDown();}
function k0OctUp(){wKey.OctaveUp();}
function k0TrnDown(){ wKey.TranspDown();}
function k0TrnUp(){wKey.TranspUp();}

//screen
function fullscreenEvent() {
	let fs = fullscreen();
    fullscreen(!fs);
}
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	wKey.dated = true;
}
function orientationCorrection() {
	let isSame = (deviceOrientation === ori)?true:false;
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
	return isSame;
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

	screenFont = loadFont('assets/Gest-Regular.otf', fontRead);

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

	//DOM
	fscreenb = createButton('□');
  	fscreenb.position(10, 10);
  	fscreenb.mousePressed(fullscreenEvent);

	//keyboard 1----------------------------------
	wKey = new wKeyboard(scales[8]);
	//select scale menu
	k0sel = createSelect();
	k0sel.position(120, 10);
	for(let i=0; i<scales.length; i++){
	k0sel.option(`${scales[i].oct_div} | ${scales[i].struc.length}`, i);
	}
	k0sel.selected(8);
	k0sel.changed(k0selectEvent);
	//buttons
	k0boct_d = createButton('-1 oct');
	k0boct_d.position(300, 10);
	k0boct_d.mousePressed(k0OctDown);
	k0boct_u = createButton('+1 oct');
	k0boct_u.position(350, 10);
	k0boct_u.mousePressed(k0OctUp);
	k0btrn_d = createButton('← oct');
	k0btrn_d.position(500, 10);
	k0btrn_d.mousePressed(k0TrnDown);
	k0btrn_u = createButton('→ oct');
	k0btrn_u.position(550, 10);
	k0btrn_u.mousePressed(k0TrnUp);
	
	//audio---------------------------------------
	polySynth = new polyVoices(10);
	
}
function draw(){
	if(windowWidth != width && windowHeight != height){windowResized();}
	orientationCorrection();

	//draw wkeyboard
	if(wKey.dated){
		mambuAa = 0.1*bb;

		background(51);

		push();
		rotate(ori_angle);
		noStroke();
		fill(31);
		rect(0, 0, aa, 40);
		image(mambuIcon, 0.025*bb, 0.075*bb, mambuAa, mambuAa); 
		image(wkeyImg, 0.12*bb, 0.075*bb, 2*mambuAa, mambuAa)
		pop();

		//textAlign(CENTER);
		//textSize(30);
		//noStroke();
		//fill(200);
		//if(fontReady == 'false'){textFont('Helvetica');}
		//textFont(screenFont);
		//text('wKeyboard', 0.23*bb, 0.125*bb+0.25*mambuAa);

		wKey.setSize(20, 0.25*bb, aa-40, 0.5*bb, ori);
		wKey.drawKeyboard();
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
					wKey.dated = true;
				}
			}
			else{
				if(polySynth.changeVoice(idxS, freq)){
					pTouchesId.push(polySynth.poly[idxS].id);
					//draw
					wKey.drawPressedNote(key_pressed);
					wKey.dated = true;
				}
			}
		}
	}	
}

function playState(){

	Tone.start();
	Tone.Transport.loop = false;
	Tone.Transport.start();
}
function mousePressed(){
	mouseAdded = true;
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