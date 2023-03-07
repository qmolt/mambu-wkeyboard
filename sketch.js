let cnv0;
let scales;	
let idxScale = 8;
let dated = true;

//midi
let midi = null;
let midiState = 0;
let mInputs = [];
let mOutputs = [];
let mInId = '';
let mInLabel = '';
let mInSel = -1;
let mOutId = '';
let mOutLabel = '';
let mOutSel = -1;
let accumOffset;
let mInPG;
let mOutPG;
let midiPlaying = [];

//touches/audio
let xyiPressed = [];
let pTouchesId = [];
let onePressId = -1;
let dragId = -1;

//wkeyboard
let wKey; 		//ui
let polySynth;	//polyph
let k0sel;

//orientation
let ori = 'landscape'; 
let ori_angle;
let aa = 0; //long side
let bb = 0; //short side

//assets
let mambuIcon;
let wkeyImg;
let oscImg;
let envImg;
let filtImg;
let envFiltImg;

//synth
let oscN = -1;
let filtN = -1;
let dragSel = -1;

//buttons coord
let xyFs = [0, 0, 0, 0];
let xySeld = [0, 0, 0, 0];
let xySelc = [0, 0, 0, 0];
let xySelu = [0, 0, 0, 0];
let xyOctd = [0, 0, 0, 0];
let xyOctu = [0, 0, 0, 0];
let xyTrnd = [0, 0, 0, 0];
let xyTrnu = [0, 0, 0, 0];
let xyMidiI = [0, 0, 0, 0];
let xyMidiO = [0, 0, 0, 0];
let xyMidiL = [0, 0, 0, 0];

let xyOsc = [0, 0, 0, 0];
let xyEnv = [0, 0, 0, 0];
let xyFiltEnv = [0, 0, 0, 0];
let xyFilt = [0, 0, 0, 0];

let xySelOsc = [0, 0, 0, 0];
let xySelFilt = [0, 0, 0, 0];
let xySelDrag = [0, 0, 0, 0];

let dXY = [0, 0, 0, 0];
let dVal = 0;
let dLabel = '';
let dMin = '';
let dMax = '';
const limFQ = [0.1, 2.0];
const limFFreq = [-3, 3];
const limFGain = [-100.0, 0.0];
const limEA = [0.1, 2.];
const limED = [0.1, 2.];
const limES = [0.1, 0.9];
const limER = [0.1, 2.];
const limFEA = [0.1, 2.];
const limFED = [0.1, 2.];
const limFES = [0.1, 0.9];
const limFER = [0.1, 2.];

//MIDI--------------------------------------------------------------------------
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
	midi = midiAccess;

	//connection changes
	midi.onstatechange = onMIDIConnectChange;

	//copy io info
	updateIOMIDI();
}
function onMIDIFailure(msg) {
	midiState = -1;
}
function onMIDIConnectChange(event){
	//console.log(event.port.name, event.port.state);	//event.port.manufacturer
	updateIOMIDI();
	setMidiIn();
	//setMidiOut();
	mInSel = -1;
	mOutSel = -1;
	dated = true;
}

function parseMidiMessage(message) {
	return {
		command: message.data[0] >> 4,
		channel: message.data[0] & 0xf,
		note: message.data[1],
		velocity: message.data[2] / 127
	}
}
function onMIDIMessage(event){
	const{command, channel, note, velocity} = parseMidiMessage(event)

	if(command === 8){
		polySynth.releaseVoice(-note);

		let key = wKey.noteToKey(note);
		let found = midiPlaying.indexOf(key);
		if(found >= 0){midiPlaying.splice(found, 1);}

		dated = true;
	}
	else if(command === 9){
		let freq = fl_mtof(wKey.oct_div, note);
		polySynth.attackVoice(-note, freq);//, velocity);
		
		let key = wKey.noteToKey(note);
		midiPlaying.push(key);
		midiState = 1;

		dated = true;
	}
}
function nonSelectedMIDI(event){}
function updateIOMIDI(){
	mInputs.splice(0, mInputs.length);
	mOutputs.splice(0, mOutputs.length);
	let it = midi.inputs.values();
	for(let o=it.next(); !o.done; o=it.next()){mInputs.push(o.value);}
	it = midi.outputs.values();
	for(let o=it.next(); !o.done; o=it.next()){mOutputs.push(o.value);}	
		//mInputs[i].type, mInputs[i].id, mInputs[i].manufacturer, mInputs[i].name, mInputs[i].version		
}

function setMidiIn(){
	let nIn = mInputs.length;
	if(nIn > 0){
		mInSel = (mInSel+1)%nIn;
		mInLabel = mInputs[mInSel].name;
		mInId = mInputs[mInSel].id;
	}
	else{
		mInSel = -1;
		mInLabel = '-none-';
		mInId = '';
	}

	//midi input data
	if(midi!=null){
		midi.inputs.forEach((entry) => {
			if(mInSel >= 0){
				if(entry.id === mInputs[mInSel].id){entry.onmidimessage = onMIDIMessage;}
				else{entry.onmidimessage = nonSelectedMIDI;}
			}
		});
	}
	//menu text
	mInPG.clear();
	mInPG.noStroke();
	//mInPG.rect(0, 0, mInPG.width, mInPG.height);
	mInPG.textAlign(LEFT, CENTER);
	mInPG.textSize(10);
	mInPG.text(`[${mInLabel}] [${mInLabel}] [${mInLabel}] [${mInLabel}] `, 0, 10);
	accumOffset = -20;

	dated = true;
}
function setMidiOut(){}

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
function fullscreenEvent(){
	let fs = fullscreen();
    fullscreen(!fs);
    dated = true;
}
function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	
	ori = (windowWidth>windowHeight)?'landscape':'portrait';
	if(ori === 'portrait'){
		aa = height;
		bb = width;
	}
	else{
		aa = width;
		bb = height;
	}
	
	setXYArrays();

	overOsc(oscN, true);
	overFilterType(filtN, true);
	selDragElem(dragSel);
	
	dated = true;
}
function orientationCorrection(){
	if(ori === 'portrait'){
		translate(width, 0);
		ori_angle = HALF_PI;
	}
	else{
		ori_angle = 0;
	}
}
function setXYArrays(){
	xyFs[0] = 0.01*aa; xyFs[1] = 0.0125*bb; xyFs[2] = 0.05*bb; xyFs[3] = 0.05*bb;
	
	xySeld[0] = 0.15*aa-0.06*bb; xySeld[1] = 0.0125*bb; xySeld[2] = 0.05*bb; xySeld[3] = 0.05*bb;
	xySelc[0] = 0.15*aa; xySelc[1] = 0.02*bb; xySelc[2] = 0.075*bb; xySelc[3] = 0.04*bb;
	xySelu[0] = 0.15*aa+0.085*bb; xySelu[1] = 0.0125*bb; xySelu[2] = 0.05*bb; xySelu[3] = 0.05*bb;
	
	xyOctd[0] = 0.3*aa; xyOctd[1] = 0.0125*bb; xyOctd[2] = 0.05*bb; xyOctd[3] = 0.05*bb;
	xyOctu[0] = 0.3*aa+0.07*bb; xyOctu[1] = 0.0125*bb; xyOctu[2] = 0.05*bb; xyOctu[3] = 0.05*bb;
	
	xyTrnd[0] = 0.45*aa; xyTrnd[1] = 0.0125*bb; xyTrnd[2] = 0.05*bb; xyTrnd[3] = 0.05*bb;
	xyTrnu[0] = 0.45*aa+0.07*bb; xyTrnu[1] = 0.0125*bb; xyTrnu[2] = 0.05*bb; xyTrnu[3] = 0.05*bb;

	xyMidiI[0] = 0.7*aa; xyMidiI[1] = 0.02*bb; xyMidiI[2] = 0.15*bb; xyMidiI[3] = 0.04*bb;
	xyMidiO[0] = 0.7*aa+0.16*bb; xyMidiO[1] = 0.02*bb; xyMidiO[2] = 0.15*bb; xyMidiO[3] = 0.04*bb;
	xyMidiL[0] = 0.7*aa-0.06*bb; xyMidiL[1] = 0.0125*bb; xyMidiL[2] = 0.05*bb; xyMidiL[3] = 0.05*bb;

	xyOsc[0] = 0.48*aa; xyOsc[1] = 0.125*bb; xyOsc[2] = 0.1*bb; xyOsc[3] = 0.3*bb;
	xyEnv[0] = 0.57*aa; xyEnv[1] = 0.275*bb; xyEnv[2] = 0.27*bb; xyEnv[3] = 0.15*bb;
	xyFiltEnv[0] = 0.775*aa; xyFiltEnv[1] = 0.1*bb; xyFiltEnv[2] = 0.27*bb; xyFiltEnv[3] = 0.15*bb;
	xyFilt[0] = 0.775*aa; xyFilt[1] = 0.275*bb; xyFilt[2] = 0.27*bb; xyFilt[3] = 0.15*bb;

	dXY[0] = 0.1*aa; dXY[1] = 0.17*bb; dXY[2] = 0.4*aa; dXY[3] = 0.17*bb;
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
	cnv0 = createCanvas(windowWidth, windowHeight);
	cnv0.style('display', 'block');
	cnv0.parent('sketch-holder');
	cnv0.mousePressed(playState);
	cnv0.touchStarted(playState);

	mInPG = createGraphics(200, 20);
	//mOutPG = createGraphics(200, 20);
	accumOffset = -20;

	if(windowWidth>windowHeight){
		ori = 'landscape';
		aa = width;
		bb = height;
	}
	else{
		ori = 'portrait'
		aa = height;
		bb = width;
	}
	orientationCorrection();
	setXYArrays();
	
	//keyboard------------------------------------
	wKey = new wKeyboard(scales[idxScale].oct_div, scales[idxScale].struc);
	polySynth = new polyVoices(10);
	overOsc(0);
	overFilterType(0);
	selDragElem(0);
	setMidiIn();
	
	//
	imageMode(CORNER);
	rectMode(CORNER);
	textAlign(CENTER, CENTER);
	textFont('Helvetica');
}
function draw(){

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
		image(wkeyImg, 0.075*aa, 0.3*bb, 0.2*bb, 0.1*bb);

		//synth prop
		stroke(220);
		strokeWeight(5);
		line(0.49*aa, 0.35*bb, aa, 0.35*bb);
		line(0.85*aa, 0.25*bb, 0.85*aa, 0.275*bb);
		noStroke();
		fill(80);
		rect(xyOsc[0], xyOsc[1], xyOsc[2], xyOsc[3]); 					//osc
		rect(xyEnv[0], xyEnv[1], xyEnv[2], xyEnv[3]); 					//env
		rect(xyFiltEnv[0], xyFiltEnv[1], xyFiltEnv[2], xyFiltEnv[3]); 	//envfilt
		rect(xyFilt[0], xyFilt[1], xyFilt[2], xyFilt[3]);				//filt

		//selected--------------------------------
		fill(195, 180, 121); 
		rect(xySelOsc[0], xySelOsc[1], xySelOsc[2], xySelOsc[3]); 		//osc
		rect(xySelFilt[0], xySelFilt[1], xySelFilt[2], xySelFilt[3]); 	//filter

		fill(85, 148, 174);
		rect(xySelDrag[0], xySelDrag[1], xySelDrag[2], xySelDrag[3]); 	//env

		image(oscImg, xyOsc[0], xyOsc[1], xyOsc[2], xyOsc[3]);
		image(envImg, xyEnv[0], xyEnv[1], xyEnv[2], xyEnv[3]);
		image(envFiltImg, xyFiltEnv[0], xyFiltEnv[1], xyFiltEnv[2], xyFiltEnv[3]);
		image(filtImg, xyFilt[0], xyFilt[1], xyFilt[2], xyFilt[3]);

		//drag element
		stroke(180);
		strokeWeight(0.03*bb);
		line(dXY[0], dXY[1], dXY[2], dXY[3]);
		fill(85, 148, 174);
		ellipseMode(RADIUS);
		noStroke();
		let dXVal = map(dVal, dMin, dMax, dXY[0], dXY[2], true);
		ellipse(dXVal, dXY[1], 0.03*bb, 0.03*bb); //debug

		textSize(0.02*bb);
		noStroke();
		fill(220);
		text(dLabel, 0.5*(dXY[0]+dXY[2]),dXY[1]+0.05*bb);
		text(dMin, dXY[0], dXY[1]+0.05*bb);
		text(dMax, dXY[2], dXY[1]+0.05*bb);

		//draw keyboard
		noStroke();
		fill(60);
		rect(0.01*aa, 0.44*bb, 0.98*aa, 0.61*bb); 

		pop();

		wKey.setSize(0.015*aa, 0.45*bb, 0.97*aa, 0.5*bb, ori);
		wKey.drawKeyboard();

		dated = false;
	}
	
	//copy all touches
	xyiPressed.splice(0, xyiPressed.length);	
	if(mouseIsPressed){
		let mouseObj = {};
		mouseObj.coord = true;
		mouseObj.x = mouseX;
		mouseObj.y = mouseY;
		mouseObj.id = 99;
		xyiPressed.push(mouseObj);
	}
	for(let i=0; i<touches.length; i++){
		let touchObj = {};
		touchObj.coord = true;
		touchObj.x = touches[i].x;
		touchObj.y = touches[i].y;
		touchObj.id = touches[i].id;
		xyiPressed.push(touchObj)
	}

	//midi buttons
	push();
	rotate(ori_angle);
	//draw menu midi text
	let mIOOffset = max(0, min(mInPG.width-xyMidiI[2], accumOffset));
	fill(220);
	rect(xyMidiI[0], xyMidiI[1], xyMidiI[2], xyMidiI[3]);
	image(mInPG, xyMidiI[0], xyMidiI[1], xyMidiI[2], xyMidiI[3], mIOOffset, 0, mInPG.width, mInPG.height, COVER, LEFT, CENTER);
	//rect(xyMidiO[0], xyMidiO[1], xyMidiO[2], xyMidiO[3]);
	//img moutpg
	accumOffset+=0.2;
	if(accumOffset > mInPG.width){accumOffset = -20;}
	pop();

	//stopped touches
	let touchesId = [];
	for(let i=0; i<xyiPressed.length; i++){touchesId.push(xyiPressed[i].id);}
	let missingTouches = pTouchesId.filter(o => touchesId.indexOf(o)<0);
	for(let i=0; i<missingTouches.length; i++){
		polySynth.releaseVoice(missingTouches[i]);
		onePressId = -1;
		dragId = -1;
	}
	pTouchesId.splice(0, pTouchesId.length);

	//touches
	for(let i=0; i<xyiPressed.length; i++){
		let note_pressed, key_pressed, pX, pY, pId;
		let idxS, freq;

		if(ori === 'landscape'){pX = xyiPressed[i].x; pY = xyiPressed[i].y;}
		else{pX = xyiPressed[i].y; pY = bb - xyiPressed[i].x;}
		pId = xyiPressed[i].id;

		//menu
		if(onePressId < 0){
			if(onePressEvent(pX, pY)){
				onePressId = pId;
				continue;
			}	
		}

		//drag elem
		if(pId == dragId || dragId < 0){
			if(dragEvent(pX, pY)){
				dragId = pId;
				continue;
			}
		}

		//pressed keys
		key_pressed = wKey.overKeyboard(pX, pY);
		if(key_pressed != null){
			note_pressed = wKey.keyToNote(key_pressed);
			freq = fl_mtof(wKey.oct_div, note_pressed);
			//sound
			idxS = polySynth.voiceIdx(pId);
			if(idxS < 0){
				if(polySynth.attackVoice(pId, freq)){
					idxS = polySynth.voiceIdx(pId);
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

	//midi notes
	for(let i=0; i<midiPlaying.length; i++){wKey.drawPressedNote(midiPlaying[i]);}
	
	//midi state
	if(midiState < 0){fill(220, 0, 0);}
	else{
		if(midiPlaying.length == 0){fill(220, 220, 220);}
		else{fill(0, 220, 0);}
	}
	push();
	rotate(ori_angle);
	noStroke();
	ellipse(xyMidiL[0]+0.5*xyMidiL[2], xyMidiL[1]+0.75*xyMidiL[3], 0.4*xyMidiL[2], 0.4*xyMidiL[3]);
	pop();

	//volume
	polySynth.autoVolume();	
}

function drawMenu(){
	push();
	rotate(ori_angle);
	noStroke();
	
	fill(31);
	rect(0, 0, aa, xyFs[3]+0.025*bb);
		
	fill(210);
 	rect(xyFs[0], xyFs[1], xyFs[2], xyFs[3]);
	rect(xySeld[0], xySeld[1], xySeld[2], xySeld[3]);
	rect(xySelu[0], xySelu[1], xySelu[2], xySelu[3]);
	rect(xyOctd[0], xyOctd[1], xyOctd[2], xyOctd[3]);
	rect(xyOctu[0], xyOctu[1], xyOctu[2], xyOctu[3]);
	rect(xyTrnd[0], xyTrnd[1], xyTrnd[2], xyTrnd[3]);
	rect(xyTrnu[0], xyTrnu[1], xyTrnu[2], xyTrnu[3]);
	
	textAlign(CENTER, CENTER);
	textSize(0.025*bb);
	noStroke();
	fill(40);
	textFont('Helvetica');

	text('□', xyFs[0], xyFs[1], xyFs[2], xyFs[3]);
	text('-', xyOctd[0], xyOctd[1], xyOctd[2], xyOctu[3]);
	text('+', xyOctu[0], xyOctu[1], xyOctu[2], xyOctu[3]);
	text('←', xyTrnd[0], xyTrnd[1], xyTrnd[2], xyTrnd[3]);
	text('→', xyTrnu[0], xyTrnu[1], xyTrnu[2], xyTrnu[3]);
	text('<', xySeld[0], xySeld[1], xySeld[2], xySeld[3]);
	text('>', xySelu[0], xySelu[1], xySelu[2], xySelu[3]);

	fill(210);
	textSize(0.023*bb);
	text(`${scales[idxScale].oct_div} | ${scales[idxScale].struc.length}`, xySelc[0], xySelc[1], xySelc[2], xySelc[3]);
	textSize(0.015*bb);
	text('MIDI', xyMidiL[0], xyMidiL[1], xyMidiL[2], 0.5*xyMidiL[3]);

	pop();
}

function playState(){
	Tone.start();
	Tone.Transport.loop = false;
	Tone.Transport.start();
}

function touchStarted(){}
function touchMoved(){}
function touchEnded(){}

function mousePressed(){
	let mX, mY;
	if(ori==='landscape'){mX = mouseX; mY = mouseY;}
	else{mX = mouseY; mY = bb - mouseX;}
	
	onePressEvent(mX, mY);
}
function mouseReleased(){}

function onePressEvent(mX, mY){
	if(mY < xyFs[3]+bb*0.025){ //menu
		if(mX > xyFs[0] && mX < xyFs[0]+xyFs[2] && mY > xyFs[1] && mY < xyFs[1]+xyFs[3]){fullscreenEvent(); return true;}
		else if(mX > xySeld[0] && mX < xySeld[0]+xySeld[2] && mY > xySeld[1] && mY < xySeld[1]+xySeld[3]){k0selectPrev(); return true;}
		else if(mX > xySelu[0] && mX < xySelu[0]+xySelu[2] && mY > xySelu[1] && mY < xySelu[1]+xySelu[3]){k0selectNext(); return true;}
		else if(mX > xyOctd[0] && mX < xyOctd[0]+xyOctd[2] && mY > xyOctd[1] && mY < xyOctd[1]+xyOctu[3]){k0OctDown(); return true;}
		else if(mX > xyOctu[0] && mX < xyOctu[0]+xyOctu[2] && mY > xyOctu[1] && mY < xyOctu[1]+xyOctu[3]){k0OctUp(); return true;}
		else if(mX > xyTrnd[0] && mX < xyTrnd[0]+xyTrnd[2] && mY > xyTrnd[1] && mY < xyTrnd[1]+xyTrnd[3]){k0TrnDown(); return true;}
		else if(mX > xyTrnu[0] && mX < xyTrnu[0]+xyTrnu[2] && mY > xyTrnu[1] && mY < xyTrnu[1]+xyTrnu[3]){k0TrnUp(); return true;}

		else if(mX > xyMidiI[0] && mX < xyMidiI[0]+xyMidiI[2] && mY > xyMidiI[1] && mY < xyMidiI[1]+xyMidiI[3]){setMidiIn(); return true;}
		//else if(mX > xyMidiO[0] && mX < xyMidiO[0]+xyMidiO[2] && mY > xyMidiO[1] && mY < xyMidiO[1]+xyMidiO[3]){setMidiOut(); return true;}
	}
	else if(mY < 0.45*bb && mX > 0.47*aa){ //synth params
		if(mX > xyOsc[0]+0.1666*xyOsc[2] && mX < xyOsc[0]+0.8333*xyOsc[2] && 
			mY > xyOsc[1]+0.0555*xyOsc[3] && mY < xyOsc[1]+0.9444*xyOsc[3]){
			let oscNum = Math.trunc((mY-xyOsc[1]-0.0555*xyOsc[3])/(0.2222*xyOsc[3]));
			overOsc(oscNum);
			return true;
		}
		
		else if(mX > xyEnv[0]+0.0556*xyEnv[2] && mX < xyEnv[0]+0.2777*xyEnv[2] && 
			mY > (xyEnv[1]+0.1*xyEnv[3]) && mY < xyEnv[1]+0.9*xyEnv[3]){overEnv(0); return true;}
		else if(mX > xyEnv[0]+0.2778*xyEnv[2] && mX < xyEnv[0]+0.4259*xyEnv[2] && 
			mY > (xyEnv[1]+0.1*xyEnv[3]) && mY < xyEnv[1]+0.9*xyEnv[3]){overEnv(1); return true;}
		else if(mX > xyEnv[0]+0.4259*xyEnv[2] && mX < xyEnv[0]+0.7222*xyEnv[2] &&
			mY > (xyEnv[1]+0.1*xyEnv[3]) && mY < xyEnv[1]+0.9*xyEnv[3]){overEnv(2); return true;}
		else if(mX > xyEnv[0]+0.7222*xyEnv[2] && mX < xyEnv[0]+0.9444*xyEnv[2] && 
			mY > (xyEnv[1]+0.1*xyEnv[3]) && mY < xyEnv[1]+0.9*xyEnv[3]){overEnv(3); return true;}
		
		else if(mX > xyFiltEnv[0]+0.0556*xyFiltEnv[2] && mX < xyFiltEnv[0]+0.2777*xyFiltEnv[2] &&
			mY > (xyFiltEnv[1]+0.1*xyFiltEnv[3]) && mY < xyFiltEnv[1]+0.9*xyFiltEnv[3]){overFiltEnv(0); return true;}
		else if(mX > xyFiltEnv[0]+0.2778*xyFiltEnv[2] && mX < xyFiltEnv[0]+0.4259*xyFiltEnv[2] &&
			mY > (xyFiltEnv[1]+0.1*xyFiltEnv[3]) && mY < xyFiltEnv[1]+0.9*xyFiltEnv[3]){overFiltEnv(1); return true;}
		else if(mX > xyFiltEnv[0]+0.4259*xyFiltEnv[2] && mX < xyFiltEnv[0]+0.7222*xyFiltEnv[2] &&
			mY > (xyFiltEnv[1]+0.1*xyFiltEnv[3]) && mY < xyFiltEnv[1]+0.9*xyFiltEnv[3]){overFiltEnv(2); return true;}
		else if(mX > xyFiltEnv[0]+0.7222*xyFiltEnv[2] && mX < xyFiltEnv[0]+0.9444*xyFiltEnv[2] && 
			mY > (xyFiltEnv[1]+0.1*xyFiltEnv[3]) && mY < xyFiltEnv[1]+0.9*xyFiltEnv[3]){overFiltEnv(3); return true;}

		else if(mX > xyFilt[0]+0.1111*xyFilt[2] && mX < xyFilt[0]+0.3333*xyFilt[2] &&
			mY > (xyFilt[1]+0.6*xyFilt[3]) && mY < xyFilt[1]+0.9*xyFilt[3]){overFilterParam(0); return true;}
		else if(mX > xyFilt[0]+0.3888*xyFilt[2] && mX < xyFilt[0]+0.6111*xyFilt[2] &&
			mY > (xyFilt[1]+0.6*xyFilt[3]) && mY < xyFilt[1]+0.9*xyFilt[3]){overFilterParam(1); return true;}
		else if(mX > xyFilt[0]+0.6666*xyFilt[2] && mX < xyFilt[0]+0.8888*xyFilt[2] &&
			mY > (xyFilt[1]+0.6*xyFilt[3]) && mY < xyFilt[1]+0.9*xyFilt[3]){overFilterParam(2); return true;}		

		else if(mX > xyFilt[0]+0.0555*xyFilt[2] && mX < xyFilt[0]+0.9444*xyFilt[2] && 
			mY > xyFilt[1]+0.1*xyFilt[3] && mY < xyFilt[1]+0.5*xyFilt[3]){
			let filtNumX = Math.trunc((mX-xyFilt[0]-0.0555*xyFilt[2])/(0.2222*xyFilt[2]));
			let filtNumY = Math.trunc((mY-xyFilt[1]-0.1*xyFilt[3])/(0.2*xyFilt[3]));
			let filtNum = filtNumX+filtNumY*4;
			overFilterType(filtNum);
			return true;
		}
	}
	return false;
}

function overOsc(oscNum, bypass = false){ //1:3 	
	if(oscNum == oscN && !bypass){return false;}
	oscN = oscNum;

	xySelOsc[0] = xyOsc[0]+0.1667*xyOsc[2];					//xyOsc[0] + (1/6)*xyOsc[2]
	xySelOsc[1] = (xyOsc[1]+(0.0556+0.2223*oscN)*xyOsc[3]); //(xyOsc[1] + (1/18)*xyOsc[3] + (4/18)*xyOsc[3]*oscN)
	xySelOsc[2] = 0.6667*xyOsc[2]; 							//(4/6)*xyOsc[2]
	xySelOsc[3] = 0.2223*xyOsc[3];							//(4/18)*xyOsc[3]

	if(oscN == 0){polySynth.setOscType('sine');}
	else if(oscN == 1){polySynth.setOscType('triangle');}
	else if(oscN == 2){polySynth.setOscType('sawtooth');}
	else if(oscN == 3){polySynth.setOscType('square');}
	dated = true;

	return true;
}
function overEnv(envNum){ //9:5
	//w->3:6*2:4*2:8*2:6*2:3=54 //h->3:12*2:3=30
	if(envNum == 0){
		xySelDrag[0] = xyEnv[0]+0.0556*xyEnv[2];	//xyEnv[0]+(3/54)*xyEnv[2]
		xySelDrag[1] = xyEnv[1]+0.1*xyEnv[3];		//(xyEnv[1]+(3/30)*xyEnv[3])
		xySelDrag[2] = 0.2223*xyEnv[2]; 			//(12/54)*xyEnv[2]
		xySelDrag[3] = 0.8*xyEnv[3]; 				//(24/30)*xyEnv[3]

		dragSel = 0;
		dLabel = 'Attack (Amplitude)';
		dMin = limEA[0];
		dMax = limEA[1];
		dVal = polySynth.getEnvA(0);

		dated = true;
		return true;
	}
	else if(envNum == 1){
		xySelDrag[0] = xyEnv[0]+0.2778*xyEnv[2];	//xyEnv[0]+(15/54)*xyEnv[2]
		xySelDrag[1] = xyEnv[1]+0.1*xyEnv[3];		//(xyEnv[1]+(3/30)*xyEnv[3])
		xySelDrag[2] = 0.1481*xyEnv[2];				//(8/54)*xyEnv[2]
		xySelDrag[3] = 0.8*xyEnv[3]; 				//(24/30)*xyEnv[3]

		dragSel = 1;
		dLabel = 'Decay (Amplitude)';
		dMin = limED[0];
		dMax = limED[1];
		dVal = polySynth.getEnvD(0);

		dated = true;
		return true;
	}
	else if(envNum == 2){
		xySelDrag[0] = xyEnv[0]+0.4259*xyEnv[2];	//xyEnv[0]+(23/54)*xyEnv[2]
		xySelDrag[1] = xyEnv[1]+0.1*xyEnv[3];		//xyEnv[1]+(3/30)*xyEnv[3]
		xySelDrag[2] = 0.2963*xyEnv[2]; 			//(16/54)*xyEnv[2]
		xySelDrag[3] = 0.8*xyEnv[3]; 				//(24/30)*xyEnv[3]

		dragSel = 2;
		dLabel = 'Sustain (Amplitude)';
		dMin = limES[0];
		dMax = limES[1];
		dVal = polySynth.getEnvS(0);

		dated = true;
		return true;
	}
	else if(envNum == 3){
		xySelDrag[0] = xyEnv[0]+0.7222*xyEnv[2];	//xyEnv[0]+(39/54)*xyEnv[2]
		xySelDrag[1] = xyEnv[1]+0.1*xyEnv[3];		//(xyEnv[1]+(3/30)*xyEnv[3])
		xySelDrag[2] = 0.2223*xyEnv[2]; 			//(12/54)*xyEnv[2]
		xySelDrag[3] = 0.8*xyEnv[3]; 				//(24/30)*xyEnv[3]

		dragSel = 3;
		dLabel = 'Release (Amplitude)';
		dMin = limER[0];
		dMax = limER[1];
		dVal = polySynth.getEnvR(0);

		dated = true;
		return true;
	}
	return false;
}
function overFiltEnv(filtEnvNum){ //9:5
	//w->3:6*2:4*2:8*2:6*2:3=54 //h->3:12*2:3 = 30
	if(filtEnvNum == 0){
		xySelDrag[0] = xyFiltEnv[0]+0.0556*xyFiltEnv[2];
		xySelDrag[1] = xyFiltEnv[1]+0.1*xyFiltEnv[3];
		xySelDrag[2] = 0.2223*xyFiltEnv[2];
		xySelDrag[3] = 0.8*xyFiltEnv[3];

		dragSel = 4;
		dLabel = 'Attack (Frequency)';
		dMin = limFEA[0];
		dMax = limFEA[1];
		dVal = polySynth.getFiltEnvA(0);

		dated = true;
		return true;
	}
	else if(filtEnvNum == 1){
		xySelDrag[0] = xyFiltEnv[0]+0.2778*xyFiltEnv[2];
		xySelDrag[1] = xyFiltEnv[1]+0.1*xyFiltEnv[3];
		xySelDrag[2] = 0.1481*xyFiltEnv[2];
		xySelDrag[3] = 0.8*xyFiltEnv[3];

		dragSel = 5;
		dLabel = 'Decay (Frequency)';
		dMin = limFED[0];
		dMax = limFED[1];
		dVal = polySynth.getFiltEnvD(0);

		dated = true;
		return true;
	}
	else if(filtEnvNum == 2){
		xySelDrag[0] = xyFiltEnv[0]+0.4259*xyFiltEnv[2];
		xySelDrag[1] = xyFiltEnv[1]+0.1*xyFiltEnv[3];
		xySelDrag[2] = 0.2963*xyFiltEnv[2];
		xySelDrag[3] = 0.8*xyFiltEnv[3];

		dragSel = 6;
		dLabel = 'Sustain (Frequency)';
		dMin = limFES[0];
		dMax = limFES[1];
		dVal = polySynth.getFiltEnvS(0);

		dated = true;
		return true;
	}
	else if(filtEnvNum == 3){
		xySelDrag[0] = xyFiltEnv[0]+0.7222*xyFiltEnv[2];
		xySelDrag[1] = xyFiltEnv[1]+0.1*xyFiltEnv[3];
		xySelDrag[2] = 0.2223*xyFiltEnv[2]; 
		xySelDrag[3] = 0.8*xyFiltEnv[3];

		dragSel = 7;
		dLabel = 'Release (Frequency)';
		dMin = limFER[0];
		dMax = limFER[1];
		dVal = polySynth.getFiltEnvR(0);

		dated = true;
		return true;
	}
	return false;
}
function overFilterType(filtNum, bypass = false){
	if(filtNum == filtN && !bypass){return false;}
	filtN = filtNum;

	let filtNx = filtN%4;
	let filtNy = Math.trunc(filtN/4);
	xySelFilt[0] = xyFilt[0]+(0.0556+0.2223*filtNx)*xyFilt[2];	//xyFilt[0] + (1/18)*xyFilt[2] + (4/18)*xyFilt[2]*filtNx
	xySelFilt[1] = xyFilt[1]+(0.1+0.2*filtNy)*xyFilt[3];		//xyFilt[1] + (1/10)*xyFilt[3] + (2/10)*xyFilt[3]*filtNy
	xySelFilt[2] = 0.2223*xyFilt[2]; 							//(4/18)*xyFilt[2]
	xySelFilt[3] = 0.2*xyFilt[3]; 								//(2/10)*xyFilt[3]
	
	if(filtN == 0){polySynth.setFilterType('allpass');}
	else if(filtN == 1){polySynth.setFilterType('lowpass');}
	else if(filtN == 2){polySynth.setFilterType('highshelf');}
	else if(filtN == 3){polySynth.setFilterType('notch');}
	else if(filtN == 4){polySynth.setFilterType('bandpass');}
	else if(filtN == 5){polySynth.setFilterType('highpass');}
	else if(filtN == 6){polySynth.setFilterType('lowshelf');}
	else if(filtN == 7){polySynth.setFilterType('peaking');}
	dated = true;

	return true;
}
function overFilterParam(filtParam){ //9:5
	//w->1:4x4:1=18 //2:4:1:4:1:4:2=18 //h->1:2x2:1:3:1 = 10
	if(filtParam == 0){
		xySelDrag[0] = xyFilt[0]+0.1112*xyFilt[2];	//xyFilt[0]+((2/18)*xyFilt[2]+((1/18)+(4/18))*xyFilt[2]*fSel)
		xySelDrag[1] = xyFilt[1]+0.6*xyFilt[3];		//xyFilt[1]+(6/10)*xyFilt[3])
		xySelDrag[2] = 0.2223*xyFilt[2]; 				//(4/18)*xyFilt[2]
		xySelDrag[3] = 0.3*xyFilt[3]; 					//(3/10)*xyFilt[3]

		dragSel = 8;
		dLabel = 'Q';
		dMin = limFQ[0];
		dMax = limFQ[1];
		dVal = polySynth.getFilterQ(0);

		dated = true;	
		return true;
	}
	else if(filtParam == 1){	
		xySelDrag[0] = xyFilt[0]+0.3888*xyFilt[2];	//xyFilt[0]+((2/18)*xyFilt[2]+((1/18)+(4/18))*xyFilt[2]*fSel)
		xySelDrag[1] = xyFilt[1]+0.6*xyFilt[3];			//xyFilt[1]+(6/10)*xyFilt[3])
		xySelDrag[2] = 0.2223*xyFilt[2]; 					//(4/18)*xyFilt[2]
		xySelDrag[3] = 0.3*xyFilt[3]; 						//(3/10)*xyFilt[3]

		dragSel = 9;
		dLabel = 'Gain';
		dMin = limFGain[0];
		dMax = limFGain[1];
		dVal = polySynth.getFilterGain(0);

		dated = true;	
		return true;
	}
	else if(filtParam == 2){
		xySelDrag[0] = xyFilt[0]+0.6666*xyFilt[2];	//xyFilt[0]+((2/18)*xyFilt[2]+((1/18)+(4/18))*xyFilt[2]*fSel)
		xySelDrag[1] = xyFilt[1]+0.6*xyFilt[3];					//xyFilt[1]+(6/10)*xyFilt[3])
		xySelDrag[2] = 0.2223*xyFilt[2]; 							//(4/18)*xyFilt[2]
		xySelDrag[3] = 0.3*xyFilt[3]; 								//(3/10)*xyFilt[3]

		dragSel = 10;
		dLabel = 'Octaves Envelope';
		dMin = limFFreq[0];
		dMax = limFFreq[1];
		dVal = polySynth.getFilterFreq(0);

		dated = true;	
		return true;
	}
	return false;
}

function dragEvent(mX, mY){
	if(mY < 0.45*bb && mX < 0.47*aa){
		if(mX > dXY[0]-0.05*bb && mX < dXY[2]+0.05*bb && 
			mY > dXY[1]-0.05*bb && mY < dXY[1]+0.05*bb){
			let elemValue = map(mX, dXY[0], dXY[2], dMin, dMax, true);
			dVal = elemValue;
			dragElemValue(elemValue, dragSel);
			dated = true;

			return true;
		}
	}
	return false;
}
function dragElemValue(value, selParam){
	if(selParam == 0){polySynth.setEnvA(max(limEA[0],min(limEA[1],value)));}
	else if(selParam == 1){polySynth.setEnvD(max(limED[0],min(limED[1],value)));}
	else if(selParam == 2){polySynth.setEnvS(max(limES[0],min(limES[1],value)));}
	else if(selParam == 3){polySynth.setEnvR(max(limER[0],min(limER[1],value)));}
	else if(selParam == 4){polySynth.setFiltEnvA(max(limFEA[0],min(limFEA[1],value)));}
	else if(selParam == 5){polySynth.setFiltEnvD(max(limFED[0],min(limFED[1],value)));}
	else if(selParam == 6){polySynth.setFiltEnvS(max(limFES[0],min(limFES[1],value)));}
	else if(selParam == 7){polySynth.setFiltEnvR(max(limFER[0],min(limFER[1],value)));}
	else if(selParam == 8){polySynth.setFilterQ(max(limFQ[0],min(limFQ[1],value)));}
	else if(selParam == 9){polySynth.setFilterGain(max(limFGain[0],min(limFGain[1],value)));}
	else if(selParam == 10){polySynth.setFilterFreq(max(limFFreq[0],min(limFFreq[1],value)));}
}
function selDragElem(selDrag){
	if(selDrag == 0){overEnv(0);}
	else if(selDrag == 1){overEnv(1);}
	else if(selDrag == 2){overEnv(2);}
	else if(selDrag == 3){overEnv(3);}
	else if(selDrag == 4){overFiltEnv(0);}
	else if(selDrag == 5){overFiltEnv(1);}
	else if(selDrag == 6){overFiltEnv(2);}
	else if(selDrag == 7){overFiltEnv(3);}
	else if(selDrag == 8){overFilterParam(0);}
	else if(selDrag == 9){overFilterParam(1);}
	else if(selDrag == 10){overFilterParam(2);}	
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