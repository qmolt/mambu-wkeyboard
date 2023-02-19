class Voice {
	constructor(id) {
		this.id = id;
		this.status = 'free';
		this.synth = new Tone.MonoSynth({
			oscillator: {
				type: "square"
			},
			envelope: {
				attack: 0.1,
				release: 0.5
			}
		}).toDestination();	
	}
}

class polyVoices {
	constructor(voices) {
		this.poly = [];
		this.voices = voices;

		for(let i=0; i<this.voices; i++) {
			this.poly.push(new Voice(i));  
		}
	}

	voiceIdx(id) {
		return this.poly.findIndex(o => o.id == id);
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
}