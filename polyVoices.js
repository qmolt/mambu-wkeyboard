class Voice {
	constructor(id){
		this.id = id;
		this.status = 'free';
		this.synth = new Tone.MonoSynth({
			oscillator: { 
				type: "sine" //"sine", "square", "sawtooth", "triangle"
			},
			envelope: { //adsr dflt: 0.1 0.1 0.9 0.5
				attack: 0.1,
				decay: 0.1,
				sustain: 0.9,
				release: 0.5
			},
			filter: { //dflt 1 0 0
				type: 'allpass', //"lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking".
				Q: 1.,
				gain: 0
			},
			filterEnvelope: { //asdr dflt: 0.6 0.2 0.5 2.
				attack: 0.1,
				decay: 0.1,
				sustain: 0.9,
				release: 2.0,
				baseFrequency: 200,
				octaves:3
			}
		});	
	}
}

class polyVoices {
	constructor(voices){
		this.poly = [];
		this.voices = voices;
		this.chan = new Tone.Channel({
			pan: 0.,
			volume: 0.
		}).toDestination();
		this.w = 0.1;
		this.mean = 1;

		for(let i=0; i<this.voices; i++){
			this.poly.push(new Voice(i));
			this.poly[i].synth.connect(this.chan);  
		}
	}

	voiceIdx(id){
		return this.poly.findIndex(o => o.id == id);
	}
	countAttack(){
		let count = 0;
		for(let i=0; i<this.poly.length; i++){
			if(this.poly[i].status === 'attack'){count++;}
		}
		return count;
	}
	availableVoices(){
		found = this.poly.find(o => o.status === 'free')
		if(found){return true;}
		return false;
	}
	attackVoice(id, freq){
		let idx = this.poly.findIndex(o => o.status === 'free')
		if(idx < 0){return false;}
		else{
			this.poly[idx].synth.triggerAttack(freq);
			this.poly[idx].status = 'attack';
			this.poly[idx].id = id;
			this.poly[idx].synth.filterEnvelope.baseFrequency = freq;
			return true;
		}
	}
	changeVoice(idx, freq){
		if(this.poly[idx].status === 'attack'){
			this.poly[idx].synth.setNote(freq);
			return true;
		}
		return false;		
	}
	releaseVoice(id){
		let idx = this.voiceIdx(id);
		if(idx >= 0){
			if(this.poly[idx].status === 'attack'){
				this.poly[idx].synth.triggerRelease();
				this.poly[idx].status = 'release'; 
				this.poly[idx].id = -1;
				let time = `+${this.poly[idx].synth.envelope.release}`;
				Tone.Transport.scheduleOnce((time) => {
					this.poly[idx].status = 'free';
				}, time);
				return true;
			}
		}
		return false;
	}
	autoVolume(){
		let activeVoices = this.countAttack();
		let s0 = Math.max(1., activeVoices);

 		//exp avg		 
		this.mean = this.w * s0 + (1-this.w) * this.mean;
		this.chan.volume.value = 10*Math.log10(1.0/this.mean);
	}

	//--------------------------------------------
	setOscType(oscType){ for(let i=0; i<this.poly.length; i++){this.poly[i].synth.oscillator.type = oscType;}}

	setFilterType(filtType){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.filter.type = filtType;}}
	setFilterQ(Q){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.filter.Q.value = Q;}}
	setFilterFreq(oct){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.filterEnvelope.octaves = oct;}}
	setFilterGain(gain){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.filter.gain.value = gain;}}

	setEnvA(attack){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.envelope.attack = attack;}}	
	setEnvD(decay){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.envelope.decay = decay;}}	
	setEnvS(sustain){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.envelope.sustain = sustain;}}	
	setEnvR(release){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.envelope.release = release;}}	

	setFiltEnvA(attack){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.filterEnvelope.attack = attack;}}	
	setFiltEnvD(decay){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.filterEnvelope.decay = decay;}}	
	setFiltEnvS(sustain){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.filterEnvelope.sustain = sustain;}}	
	setFiltEnvR(release){for(let i=0; i<this.poly.length; i++){this.poly[i].synth.filterEnvelope.release = release;}}

	//--------------------------------------------
	getOscType(i){if(i<this.poly.length){return this.poly[i].synth.oscillator.type;} return;}

	getFilterType(i){if(i<this.poly.length){return this.poly[i].synth.filter.type;}return;}
	getFilterQ(i){if(i<this.poly.length){return this.poly[i].synth.filter.Q.value;}return;}
	getFilterFreq(i){if(i<this.poly.length){return this.poly[i].synth.filterEnvelope.octaves;}return;}
	getFilterGain(i){if(i<this.poly.length){return this.poly[i].synth.filter.gain.value;}return;}

	getEnvA(i){if(i<this.poly.length){return this.poly[i].synth.envelope.attack;}return;}	
	getEnvD(i){if(i<this.poly.length){return this.poly[i].synth.envelope.decay;}return;}	
	getEnvS(i){if(i<this.poly.length){return this.poly[i].synth.envelope.sustain;}return;}	
	getEnvR(i){if(i<this.poly.length){return this.poly[i].synth.envelope.release;}return;}	

	getFiltEnvA(i){if(i<this.poly.length){return this.poly[i].synth.filterEnvelope.attack;}return;}	
	getFiltEnvD(i){if(i<this.poly.length){return this.poly[i].synth.filterEnvelope.decay;}return;}	
	getFiltEnvS(i){if(i<this.poly.length){return this.poly[i].synth.filterEnvelope.sustain;}return;}	
	getFiltEnvR(i){if(i<this.poly.length){return this.poly[i].synth.filterEnvelope.release;}return;}
}