class Voice {
	constructor(id) {
		this.id = id;
		this.status = 'free';
		this.synth = new Tone.MonoSynth({
			oscillator: { //oscillator, envelope, filter, filterEnvelope
				type: "square" //"sine", "square", "sawtooth", "triangle"
			},
			envelope: { //adsr dflt: 0.1 0.1 0.9 0.5
				attack: 0.1,
				decay: 0.1,
				sustain: 0.9,
				release: 0.5
			},
			filter: { //dflt 1 0 0
				type: 'bandpass', //"lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking".
				Q: 2.,
				frequency: 1000,
				gain: 0
			},
			filterEnvelope: { //asdr dflt: 0.6 0.2 0.5 2.
				attack: 0.1,
				decay: 0.1,
				sustain: 0.9,
				release: 2.0
			}
		});	
	}
}

class polyVoices {
	constructor(voices) {
		this.poly = [];
		this.voices = voices;
		this.chan = new Tone.Channel({
			pan: 0.,
			volume: 0.
		}).toDestination();
		this.w = 0.1;
		this.mean = 1;

		for(let i=0; i<this.voices; i++) {
			this.poly.push(new Voice(i));
			this.poly[i].synth.connect(this.chan);  
		}
	}

	voiceIdx(id) {
		return this.poly.findIndex(o => o.id == id);
	}
	countAttack() {
		let count = 0;
		for(let i=0; i<this.poly.length; i++){
			if(this.poly[i].status === 'attack'){count++;}
		}
		return count;
	}
	availableVoices() {
		found = this.poly.find(o => o.status === 'free')
		if(found){return true;}
		return false;
	}
	attackVoice(id, freq) {
		let idx = this.poly.findIndex(o => o.status === 'free')
		if(idx < 0){return false;}
		else{
			this.poly[idx].synth.triggerAttack(freq);
			this.poly[idx].status = 'attack';
			this.poly[idx].id = id;
			return true;
		}
	}
	changeVoice(idx, freq) {
		if(this.poly[idx].status === 'attack'){
			this.poly[idx].synth.setNote(freq);
			return true;
		}
		return false;		
	}
	releaseVoice(id) {
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
	autoVolume() {
		let activeVoices = this.countAttack();
		let s0 = Math.max(1., activeVoices);

 		//exp avg		 
		this.mean = this.w * s0 + (1-this.w) * this.mean;
		this.chan.volume.value = 10*Math.log10(1.0/this.mean);
	}
}