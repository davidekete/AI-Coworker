require("dotenv").config();
const nms = require("./src/mediaServer");
const transcriber = require("./src/transcriber");
require("./src/promptProcessor");
require("./src/audioProcessor");
require("./src/openai");

transcriber.connect().then(() => {
  console.log("Connected to real-time transcript service");
});

process.on("SIGINT", async function () {
  console.log("Closing real-time transcript connection");
  await transcriber.close();

  process.exit();
});

nms.run();
