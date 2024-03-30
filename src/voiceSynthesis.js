const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function textToSpeech(text) {
  const voiceId = "21m00Tcm4TlvDq8ikWAM";
  const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const options = {
    method: "POST",
    url: apiUrl,
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
    },
    data: {
      text,
    },
    responseType: "arraybuffer",
  };

  axios
    .request(options)
    .then(function (response) {
      //save audio response to file
      fs.writeFileSync(
        `./src/responses/response-${Date.now()}.mp3`,
        response.data
      );
    })
    .catch(function (error) {
      console.error(error);
    });
}

module.exports = { textToSpeech };
