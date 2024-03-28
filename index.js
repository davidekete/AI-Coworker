require("dotenv").config();
const nms = require("./src/rtmpServer");
const transcriber = require("./src/transcriber");
require("./src/promptProcessor");

transcriber.connect().then(() => {
  console.log("Connected to real-time transcript service");
});

process.on("SIGINT", async function () {
  console.log("Closing real-time transcript connection");
  await transcriber.close();

  process.exit();
});

nms.run();
