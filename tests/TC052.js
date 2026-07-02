const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const TINY_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

async function attemptUpload(driver) {
    return driver.executeAsyncScript(function (base64, callback) {
        function toBlob(b64) {
            const byteChars = atob(b64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
            return new Blob([new Uint8Array(byteNumbers)], { type: 'image/jpeg' });
        }
        const form = new FormData();
        form.append('file', toBlob(base64), 'test.jpg');
        form.append('hydrantId', 'HYD-SELENIUM-TEST');
        fetch('/api/upload', { method: 'POST', body: form, credentials: 'same-origin' })
            .then(res => callback({ status: res.status }))
            .catch(err => callback({ error: err.message }));
    }, TINY_JPEG_BASE64);
}

async function attemptAsRole(email, password, options) {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        if (email) {
            await driver.get('https://hivemind-hydro-scout.vercel.app/login');
            await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys(email);
            await driver.findElement(By.css("input[type='password']")).sendKeys(password);
            await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
            await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
            await driver.sleep(2000);
        } else {
            await driver.get('https://hivemind-hydro-scout.vercel.app/');
            await driver.sleep(1500);
        }
        return await attemptUpload(driver);
    } finally {
        await driver.quit();
    }
}

async function TC052() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    try {
        console.log("🚀 Starting Test Case 052: Upload API authorization...");

        let noSessionResult = await attemptAsRole(null, null, options);
        console.log("No-session upload attempt result:", JSON.stringify(noSessionResult));

        let generalResult = await attemptAsRole('karlpogi@sample.com', '123456', options);
        console.log("General-role upload attempt result:", JSON.stringify(generalResult));

        let headResult = await attemptAsRole('karlpogi@head.com', '123456', options);
        console.log("Head-role upload attempt result:", JSON.stringify(headResult));

        let noSessionBlocked = !noSessionResult.error && noSessionResult.status !== 200 && noSessionResult.status !== 201;
        let generalBlocked = !generalResult.error && generalResult.status !== 200 && generalResult.status !== 201;
        let headAllowed = headResult.status === 200 || headResult.status === 201;

        if (noSessionBlocked && generalBlocked && headAllowed) {
            console.log("🏆 TEST PASSED: Upload API rejected unauthenticated/general requests and accepted an allowed role.");
        } else {
            console.log("❌ TEST FAILED: Upload API authorization did not match expected behavior for one or more roles.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: /api/upload contract (field names, response shape) differs from what this test assumes.");
    }
}

TC052();
