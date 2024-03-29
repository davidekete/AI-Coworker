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
  };

  axios
    .request(options)
    .then(function (response) {
      //save audio response to file
      const writeStream = fs.createWriteStream(
        `./src/responses/response-${Date.now()}.txt`,
        {
          flags: "a",
        }
      );

      response.pipe(writeStream);

      // console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
}

module.exports = { textToSpeech };
