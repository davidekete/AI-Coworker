const { OpenAI } = require("openai");
const fs = require("fs");
const { textToSpeech } = require("./voiceSynthesis.js");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getResponseFromOpenAI(fileName) {
  const filePath = `./src/prompts/${fileName}.txt`;
  const prompt = fs.readFileSync(filePath, { encoding: "utf-8" });

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: `${prompt}` }],
    model: "gpt-3.5-turbo",
  });

  return await textToSpeech(completion.choices[0].message.content);
}

module.exports = {
  getResponseFromOpenAI,
};
