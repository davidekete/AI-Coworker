const { OpenAI } = require("openai");
const fs = require("fs");
const { textToSpeech } = require("./voiceSynthesis.js");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  getResponseFromOpenAI,
};
