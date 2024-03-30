const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
const transcriber = require("./transcriber");
const nms = require("./mediaServer");

function processAudioStream(streamPath) {
  const inputPath = `rtmp://localhost:1935${streamPath}`;
  const audioStream = new PassThrough();

  ffmpeg(inputPath)
    .audioCodec("pcm_s16le") // Set codec to PCM 16-bit little-endian
    .audioChannels(1) // Downmix audio to mono
    .format("s16le") // Set format to signed 16-bit little-endian
    .on("start", (commandLine) => {
      console.log(`Spawned FFmpeg with command: ${commandLine}`);
    })
    .on("codecData", (data) => {
      console.log(`Input is ${data.audio} audio with ${data.audio_details}`);
    })
    .on("end", () => {
      console.log("Processing finished");
    })
    .on("error", (err) => {
      console.error(`Error processing stream: ${err.message}`);
    })
    .pipe(audioStream, { end: true }); // Pipe the processed audio to audioStream

  // send audio stream to AssemblyAI
  audioStream.on("data", async (chunk) => {
    transcriber.sendAudio(chunk);
  });
}

module.exports = processAudioStream;
