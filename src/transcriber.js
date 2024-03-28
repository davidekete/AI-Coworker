const { AssemblyAI } = require("assemblyai");

const client = new AssemblyAI({
  apiKey: `${process.env.ASSEMBLY_AI_API_KEY}`,
});

const transcriber = client.realtime.transcriber({
  sampleRate: 44_100,
});

module.exports = transcriber;
