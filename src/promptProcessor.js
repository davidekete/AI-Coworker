const transcriber = require("./transcriber.js");
const fs = require("fs");
const phraseEventEmitter = require("./phraseEventEmitter.js");
const { getResponseFromOpenAI } = require("./openai.js");

let writeStream = null;

const START_PHRASE = "I lived in Indonesia for a few years"; //"Hi coworker"
const END_PHRASE = "Monday through Friday"; //"That's all for now coworker"

phraseEventEmitter.on("prompt_started", () => {
  try {
    writeStream = fs.createWriteStream(
      `./src/prompts/prompt-${Date.now()}.txt`,
      {
        flags: "a",
      }
    );
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

phraseEventEmitter.on("prompt_ended", async (fileName) => {
  try {
    stopWriteStream();
    return await getResponseFromOpenAI(fileName);
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

function stopWriteStream() {
  try {
    if (writeStream) {
      writeStream.end();
      writeStream = null;
      console.log("Write stream stopped.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

transcriber.on("transcript", (transcript) => {
  if (!transcript.text) {
    return;
  }

  if (!(transcript.message_type === "PartialTranscript")) {
    handleIncomingData(transcript.text);

    if (transcript.text.includes(START_PHRASE)) {
      phraseEventEmitter.emit("prompt_started");
      console.log("Start phrase detected");
    }

    if (transcript.text.includes(END_PHRASE)) {
      phraseEventEmitter.emit("prompt_ended", writeStream.path);
      console.log("Stop phrase detected");
    }
  }
});

function handleIncomingData(data) {
  if (writeStream) {
    // Write data to the file
    writeStream.write(data + "\n");

    writeStream.on("error", (error) => {
      console.error("An error occurred:", error);
    });
  }
}
