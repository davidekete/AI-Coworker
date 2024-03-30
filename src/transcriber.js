const { AssemblyAI } = require("assemblyai");

// Create a new AssemblyAI client
const client = new AssemblyAI({
  apiKey: `${process.env.ASSEMBLY_AI_API_KEY}`,
});

// Create a new transcriber instance
const transcriber = client.realtime.transcriber({
  sampleRate: 44_100,
});

module.exports = transcriber;
