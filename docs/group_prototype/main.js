title = "this is a prototype";

description = `ur mom`;

characters = [];

options = {};

// create an audio element
// const audioPlayer = document.createElement('audio');

// // // set audio path
// audioPlayer.src = "/group_prototype/carhorns.wav";

// // play it instantly and loop the clip
// // audioPlayer.autoplay = true;
// audioPlayer.loop = true;

// // attach the audio element to the document body
// document.body.appendChild(audioPlayer);

const audioClips = ['/group_prototype/carhorns.wav', '/group_prototype/hammering.wav', '/group_prototype/waterdrop.wav']
let audioClipDuration = []

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

audioClips.forEach(get_audio_duration)
function get_audio_duration(audioFile) {
  // fetch works asynchronously so the way the audio files are fetched are basically random
  fetch(audioFile)
  .then(response => response.arrayBuffer())
  .then(buffer => audioContext.decodeAudioData(buffer))
  .then(audioBuffer => {
    console.log(audioFile);
    const audioDuration = audioBuffer.duration;
    console.log("audio duration: ${audioDuration} seconds");
    audioClipDuration.push([audioFile, audioDuration]);
  })
  .catch(error => {
    console.error('cant load audio: ', error);
  });
}

function update() {
  if (!ticks) {
    play("hit")
    for (let i = 0; i < audioClipDuration.length; i++) {
      console.log("this is audio clip duration array: ", audioClipDuration[i]);
    }
  }
}
