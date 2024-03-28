const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
const transcriber = require("./transcriber");
// const { EventEmitter } = require("events");

// const START_PHRASE = "I lived in Indonesia for a few years";
// const END_PHRASE = "Monday through Friday";

// let writeStream = null;

// const phraseEventEmitter = new EventEmitter();

// phraseEventEmitter.on("prompt_triggered", () => {
//   writeStream = fs.createWriteStream(`./prompts/prompt-${Date.now()}.txt`, {
//     flags: "a",
//   });
// });

// function handleIncomingData(data) {
//   if (writeStream) {
//     // Write data to the file
//     writeStream.write(data + "\n");

//     writeStream.on("error", (error) => {
//       console.error("An error occurred:", error);
//     });
//   }
// }

// function stopWriteStream() {
//   if (writeStream) {
//     writeStream.end();
//     writeStream = null;
//     console.log("Write stream stopped.");
//   }
// }

// phraseEventEmitter.on("prompt_ended", async (fileName) => {
//   console.log(fileName);
//   stopWriteStream();
//   return await convertTxtToString(fileName);
// });

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

  // Use the audioStream for further processing or transmission
  audioStream.on("data", async (chunk) => {
    transcriber.sendAudio(chunk);
  });
}

// transcriber.on("transcript", (transcript) => {
//   if (!transcript.text) {
//     return;
//   }

//   if (!(transcript.message_type === "PartialTranscript")) {
//     handleIncomingData(transcript.text);

//     if (transcript.text.includes(START_PHRASE)) {
//       phraseEventEmitter.emit("prompt_triggered");
//       console.log("Start phrase detected");
//     }

//     if (transcript.text.includes(END_PHRASE)) {
//       phraseEventEmitter.emit("prompt_ended", writeStream.path);
//       console.log("Stop phrase detected");
//     }
//   }
// });

module.exports = {
  processAudioStream,
  // phraseEventEmitter,
};
