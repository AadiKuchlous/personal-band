const audio_location = "/static/audio_files"

const fileList = {
	"piano": {
	    "notes": {
		"C-1": "C-1.wav",
		"C#-1": "Cs-1.wav",
		"D-1": "D-1.wav",
		"D#-1": "Ds-1.wav",
		"E-1": "E-1.wav",
		"F-1": "F-1.wav",
		"F#-1": "Fs-1.wav",
		"G-1": "G-1.wav",
		"G#-1": "Gs-1.wav",
		"A-1": "A-1.wav",
		"A#-1": "As-1.wav",
		"B-1": "B-1.wav",
		"C-2": "C-2.wav",
		"C#-2": "Cs-2.wav",
		"D-2": "D-2.wav",
		"D#-2": "Ds-2.wav",
		"E-2": "E-2.wav",
		"F-2": "F-2.wav",
		"F#-2": "Fs-2.wav",
		"G-2": "G-2.wav",
		"G#-2": "Gs-2.wav",
		"A-2": "A-2.wav",
		"A#-2": "As-2.wav",
		"B-2": "B-2.wav",
		"C-3": "C-3.wav",
		"C#-3": "Cs-3.wav",
		"D-3": "D-3.wav",
		"D#-3": "Ds-3.wav",
		"E-3": "E-3.wav",
		"F-3": "F-3.wav",
		"F#-3": "Fs-3.wav",
		"G-3": "G-3.wav",
		"G#-3": "Gs-3.wav",
		"A-3": "A-3.wav",
		"A#-3": "As-3.wav",
		"B-3": "B-3.wav",
		"C-4": "C-4.wav",
		"C#-4": "Cs-4.wav",
		"D-4": "D-4.wav",
		"D#-4": "Ds-4.wav",
		"E-4": "E-4.wav",
		"F-4": "F-4.wav",
		"F#-4": "Fs-4.wav",
		"G-4": "G-4.wav",
		"G#-4": "Gs-4.wav",
		"A-4": "A-4.wav",
		"A#-4": "As-4.wav",
		"B-4": "B-4.wav"
	    },
            "chords": {
		"C-2": "Cmaj-2.wav",
		"Cm-2": "Cmin-2.wav",
		"C#-2": "Csmaj-2.wav",
		"C#m-2": "Csmin-2.wav",
		"D-2": "Dmaj-2.wav",
		"Dm-2": "Dmin-2.wav",
		"D#-2": "Dsmaj-2.wav",
		"D#m-2": "Dsmin-2.wav",
		"E-2": "Emaj-2.wav",
		"Em-2": "Emin-2.wav",
		"F-2": "Fmaj-2.wav",
		"Fm-2": "Fmin-2.wav",
		"F#-2": "Fsmaj-2.wav",
		"F#m-2": "Fsmin-2.wav",
		"G-2": "Gmaj-2.wav",
		"Gm-2": "Gmin-2.wav",
		"G#-2": "Gsmaj-2.wav",
		"G#m-2": "Gsmin-2.wav",
		"A-2": "Amaj-2.wav",
		"Am-2": "Amin-2.wav",
		"A#-2": "Asmaj-2.wav",
		"A#m-2": "Asmin-2.wav",
		"B-2": "Bmaj-2.wav",
		"Bm-2": "Bmin-2.wav"
            }
	},

	"guitar": {
            "chords": {
		"C-2": "Cmaj-2.wav",
		"Cm-2": "Cmin-2.wav",
		"C#-2": "Csmaj-2.wav",
		"C#m-2": "Csmin-2.wav",
		"D-2": "Dmaj-2.wav",
		"Dm-2": "Dmin-2.wav",
		"D#-2": "Dsmaj-2.wav",
		"D#m-2": "Dsmin-2.wav",
		"E-2": "Emaj-2.wav",
		"Em-2": "Emin-2.wav",
		"F-2": "Fmaj-2.wav",
		"Fm-2": "Fmin-2.wav",
		"F#-2": "Fsmaj-2.wav",
		"F#m-2": "Fsmin-2.wav",
		"G-2": "Gmaj-2.wav",
		"Gm-2": "Gmin-2.wav",
		"G#-2": "Gsmaj-2.wav",
		"G#m-2": "Gsmin-2.wav",
		"A-2": "Amaj-2.wav",
		"Am-2": "Amin-2.wav",
		"A#-2": "Asmaj-2.wav",
		"A#m-2": "Asmin-2.wav",
		"B-2": "Bmaj-2.wav",
		"Bm-2": "Bmin-2.wav"
            },
	    "notes": {
		"C-2": "C-2.wav",
		"C#-2": "Cs-2.wav",
		"D-2": "D-2.wav",
		"D#-2": "Ds-2.wav",
		"E-2": "E-2.wav",
		"F-2": "F-2.wav",
		"F#-2": "Fs-2.wav",
		"G-2": "G-2.wav",
		"G#-2": "Gs-2.wav",
		"A-2": "A-2.wav",
		"A#-2": "As-2.wav",
		"B-2": "B-2.wav",
	    },
        },
	"drums": {
	    "kick": {
		"Kick 1": "kick1.wav",
		"Kick 2": "kick2.wav"
	    },
	    "snare": {
		"Snare 1": "snare1.wav",
		"Snare 2": "snare2.wav"
	    },
	    "hihat": {
		"Hihat Closed 1": "hatclosed1.wav",
		"Hihat Open 1": "hatopen1.wav",
		"Hihat Closed 2": "hatclosed2.wav",
		"Hihat Open 2": "hatopen2.wav"
	    }
	}
}


const inst_data = {
	'piano': {
		'type': 'melodic',
		'range': '1-4'
	},
	'guitar': {
		'type': 'melodic',
		'range': '2-2'
	},
	'drums': {
		'type': 'rythmic'
	}
}
