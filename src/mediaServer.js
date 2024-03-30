const NodeMediaServer = require("node-media-server");
const processAudioStream = require("./audioProcessor");

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: "*",
  },
};

const nms = new NodeMediaServer(config);

// Listen for the "prePublish" event to start processing the audio stream
nms.on("prePublish", (id, StreamPath, args) => {
  console.log(`Stream [${id}] is about to be published at path: ${StreamPath}`);
  processAudioStream(StreamPath);
});

module.exports = nms;
