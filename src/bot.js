const puppeteer = require("puppeteer"); // ^21.6.0

let browser;

async function joinZoomMeeting(meetId, meetingPassCode) {
  try {
    const meetingName = "AI coworker";

    // Launch the browser
    browser = await puppeteer.launch({ headless: false });

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
      els.find((el) => el.textContent.trim() === "Join").click()
    );
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Meeting ID:  83430234603
// Passcode: 496722

joinZoomMeeting("83430234603", "496722");
{
  /* <button
  tabindex="0"
  type="button"
  class="zm-btn join-audio-by-voip__join-btn zm-btn--primary zm-btn__outline--white zm-btn--lg"
  aria-label=""
>
  Join Audio by Computer<span class="loading" style="display: none;"></span>
</button>; */
}
