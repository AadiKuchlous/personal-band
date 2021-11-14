const audio_location = "https://personal-band.s3.ap-south-1.amazonaws.com/audio_files";

const fileList = {
	"piano": {
	    "notes": {
		"C-1": "C-1.ogg",
		"C#-1": "Cs-1.ogg",
		"D-1": "D-1.ogg",
		"D#-1": "Ds-1.ogg",
		"E-1": "E-1.ogg",
		"F-1": "F-1.ogg",
		"F#-1": "Fs-1.ogg",
		"G-1": "G-1.ogg",
		"G#-1": "Gs-1.ogg",
		"A-1": "A-1.ogg",
		"A#-1": "As-1.ogg",
		"B-1": "B-1.ogg",
		"C-2": "C-2.ogg",
		"C#-2": "Cs-2.ogg",
		"D-2": "D-2.ogg",
		"D#-2": "Ds-2.ogg",
		"E-2": "E-2.ogg",
		"F-2": "F-2.ogg",
		"F#-2": "Fs-2.ogg",
		"G-2": "G-2.ogg",
		"G#-2": "Gs-2.ogg",
		"A-2": "A-2.ogg",
		"A#-2": "As-2.ogg",
		"B-2": "B-2.ogg",
		"C-3": "C-3.ogg",
		"C#-3": "Cs-3.ogg",
		"D-3": "D-3.ogg",
		"D#-3": "Ds-3.ogg",
		"E-3": "E-3.ogg",
		"F-3": "F-3.ogg",
		"F#-3": "Fs-3.ogg",
		"G-3": "G-3.ogg",
		"G#-3": "Gs-3.ogg",
		"A-3": "A-3.ogg",
		"A#-3": "As-3.ogg",
		"B-3": "B-3.ogg",
		"C-4": "C-4.ogg",
		"C#-4": "Cs-4.ogg",
		"D-4": "D-4.ogg",
		"D#-4": "Ds-4.ogg",
		"E-4": "E-4.ogg",
		"F-4": "F-4.ogg",
		"F#-4": "Fs-4.ogg",
		"G-4": "G-4.ogg",
		"G#-4": "Gs-4.ogg",
		"A-4": "A-4.ogg",
		"A#-4": "As-4.ogg",
		"B-4": "B-4.ogg"
	    },
            "chords": {
		"C-2": "Cmaj-2.ogg",
		"Cm-2": "Cmin-2.ogg",
		"C#-2": "Csmaj-2.ogg",
		"C#m-2": "Csmin-2.ogg",
		"D-2": "Dmaj-2.ogg",
		"Dm-2": "Dmin-2.ogg",
		"D#-2": "Dsmaj-2.ogg",
		"D#m-2": "Dsmin-2.ogg",
		"E-2": "Emaj-2.ogg",
		"Em-2": "Emin-2.ogg",
		"F-2": "Fmaj-2.ogg",
		"Fm-2": "Fmin-2.ogg",
		"F#-2": "Fsmaj-2.ogg",
		"F#m-2": "Fsmin-2.ogg",
		"G-2": "Gmaj-2.ogg",
		"Gm-2": "Gmin-2.ogg",
		"G#-2": "Gsmaj-2.ogg",
		"G#m-2": "Gsmin-2.ogg",
		"A-2": "Amaj-2.ogg",
		"Am-2": "Amin-2.ogg",
		"A#-2": "Asmaj-2.ogg",
		"A#m-2": "Asmin-2.ogg",
		"B-2": "Bmaj-2.ogg",
		"Bm-2": "Bmin-2.ogg"
            }
	},

	"guitar": {
            "chords": {
		"C-2": "Cmaj-2.ogg",
		"Cm-2": "Cmin-2.ogg",
		"C#-2": "Csmaj-2.ogg",
		"C#m-2": "Csmin-2.ogg",
		"D-2": "Dmaj-2.ogg",
		"Dm-2": "Dmin-2.ogg",
		"D#-2": "Dsmaj-2.ogg",
		"D#m-2": "Dsmin-2.ogg",
		"E-2": "Emaj-2.ogg",
		"Em-2": "Emin-2.ogg",
		"F-2": "Fmaj-2.ogg",
		"Fm-2": "Fmin-2.ogg",
		"F#-2": "Fsmaj-2.ogg",
		"F#m-2": "Fsmin-2.ogg",
		"G-2": "Gmaj-2.ogg",
		"Gm-2": "Gmin-2.ogg",
		"G#-2": "Gsmaj-2.ogg",
		"G#m-2": "Gsmin-2.ogg",
		"A-2": "Amaj-2.ogg",
		"Am-2": "Amin-2.ogg",
		"A#-2": "Asmaj-2.ogg",
		"A#m-2": "Asmin-2.ogg",
		"B-2": "Bmaj-2.ogg",
		"Bm-2": "Bmin-2.ogg"
            },
	    "notes": {
		"C-2": "C-2.ogg",
		"C#-2": "Cs-2.ogg",
		"D-2": "D-2.ogg",
		"D#-2": "Ds-2.ogg",
		"E-2": "E-2.ogg",
		"F-2": "F-2.ogg",
		"F#-2": "Fs-2.ogg",
		"G-2": "G-2.ogg",
		"G#-2": "Gs-2.ogg",
		"A-2": "A-2.ogg",
		"A#-2": "As-2.ogg",
		"B-2": "B-2.ogg",
	    },
        },

	"drums": {
	    "kick": {
		"Kick 1": "kick1.ogg",
		"Kick 2": "kick2.ogg"
	    },
	    "snare": {
		"Snare 1": "snare1.ogg",
		"Snare 2": "snare2.ogg"
	    },
	    "hihat": {
		"Hihat Closed 1": "hatclosed1.ogg",
		"Hihat Open 1": "hatopen1.ogg",
		"Hihat Closed 2": "hatclosed2.ogg",
		"Hihat Open 2": "hatopen2.ogg"
	    }
	}
}


const inst_data = {
	'piano': {
		'type': 'melodic',
		'range-notes': '1-4',
		'range-chords': '2-2'
	},
	'guitar': {
		'type': 'melodic',
		'range-notes': '2-2',
		'range-chords': '2-2'
	},
	'drums': {
		'type': 'rythmic'
	}
}
