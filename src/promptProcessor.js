const transcriber = require("./transcriber.js");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const { textToSpeech } = require("./voiceSynthesis.js");
const phraseEventEmitter = require("./phraseEventEmitter.js");

let writeStream = null;

const START_PHRASE = "I lived in Indonesia for a few years"; //"Hi Coworker"
const END_PHRASE = "Monday through Friday"; //"That's all for now Coworker"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

phraseEventEmitter.on("prompt_triggered", () => {
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

    // console.log(transcript.text);

    if (transcript.text.includes(START_PHRASE)) {
      phraseEventEmitter.emit("prompt_triggered");
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

async function convertTxtToString(fileName) {
  // Read the file synchronously
  const fileContents = fs.readFileSync(fileName, { encoding: "utf-8" });

  // Escape special characters (e.g., newlines, quotes)
  const escapedContents = fileContents
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");

  // Assign to a JavaScript variable
  const jsString = `"${escapedContents}"`;

  return jsString;
}

async function getResponseFromOpenAI(fileName) {
  const prompt = await convertTxtToString(fileName);

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: `${prompt}` }],
    model: "gpt-3.5-turbo",
  });

  // console.log(completion.choices[0]);

  return await textToSpeech(completion.choices[0].message.content);
}

module.exports = {
  writeStream,
};
