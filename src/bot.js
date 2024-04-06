const puppeteer = require("puppeteer"); // ^21.6.0

let browser;

async function joinZoomMeeting(meetId, meetingPassCode) {
  try {
    const meetingName = "AI coworker";

    // Launch the browser
    browser = await puppeteer.launch({
      headless: false,
      args: [
        // "--use-fake-ui-for-media-stream",
        // "--use-fake-device-for-media-stream",
      ],
    });

    // Get the first page
    const [page] = await browser.pages();

    // Set user agent to Chrome
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
    await page.setUserAgent(ua);

    // Go to Zoom join page
    await page.goto("https://app.zoom.us/wc/join");

    // Wait for the meeting input field
    const meetingInput = await page.waitForSelector('input[type="text"]');

    // Type the meeting ID
    await meetingInput.type(meetId);

    const joinBtn = await page.waitForSelector(".btn-join");
    await joinBtn.click();

    await page.waitForFunction(`
    document.querySelector("#webclient")
      .contentDocument.querySelector("#input-for-pwd")
  `);

    const f = await page.waitForSelector("#webclient");
    const frame = await f.contentFrame();

    await frame.type("#input-for-pwd", meetingPassCode);
    await frame.type("#input-for-name", meetingName);

    await frame.$$eval("button", (els) =>
      // @ts-ignore
      els.find((el) => el.textContent.trim() === "Join").click()
    );

    // Wait for the button to load
    const buttonSelector = "[tabindex='0'].join-audio-by-voip__join-btn";

    await frame.waitForSelector(buttonSelector, {
      //increase wait time
      timeout: 1000000,
    });

    // Click the button
    await frame.click(buttonSelector);

    //allow access to microphone
    const unmuteButtonSelector = 'button[aria-label="unmute my microphone"]';

    await frame.waitForSelector(unmuteButtonSelector);

    await frame.click(unmuteButtonSelector);

    console.log("Unmuted");

    console.log("Playing audio");

    await frame.evaluate(() => {
      console.log("In the frame");
      var audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      console.log("AudioContext", audioContext);

      fetch("http://localhost:9090/responses/response-1711829121531.mp3")
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          console.log(arrayBuffer);

          audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
            var source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
          });
          
        })
        .catch((e) => console.error(e));
    });

    console.log("Audio played");
    frame.on("console", (msg) => console.log("Frame console:", msg.text()));
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

joinZoomMeeting("81337598763", "718601");

// https://us02web.zoom.us/j/83578367332?pwd=dy9yREpVQk9hNHEyYi9Ba2hDVnBYZz09