const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC039() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 039: Pin form validation...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@head.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let pinButton = await driver.wait(until.elementLocated(By.css("button[aria-label='Pin new hydrant']")), 10000);
        await driver.executeScript("arguments[0].click();", pinButton);
        await driver.sleep(1000);

        let mapCanvas = await driver.wait(until.elementLocated(By.css('.mapboxgl-canvas, canvas')), 10000);
        await driver.executeScript(`
            const canvas = arguments[0];
            const rect = canvas.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            for (const type of ['mousedown', 'mouseup', 'click']) {
                canvas.dispatchEvent(new MouseEvent(type, {
                    bubbles: true, cancelable: true, view: window,
                    clientX: x, clientY: y, button: 0, buttons: type === 'mousedown' ? 1 : 0
                }));
            }
        `, mapCanvas);
        await driver.sleep(1500);

        let pinHereButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Pin Hydrant Here')]")), 10000);
        await driver.executeScript("arguments[0].click();", pinHereButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'PIN NEW HYDRANT') or contains(text(), 'Pinning Guidelines')]")), 10000);
        await driver.sleep(1000);

        // Address is reverse-geocoded and read-only; coordinates are the only editable location fields.
        let latInput = await driver.findElement(By.xpath("//input[contains(@placeholder, '14.6')]"));
        let lngInput = await driver.findElement(By.xpath("//input[contains(@placeholder, '121.0')]"));
        await latInput.clear();
        await lngInput.clear();

        let submitButton = await driver.findElement(By.xpath("//button[contains(., 'Pin Hydrant') and not(contains(., 'Here'))]"));
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(1000);

        let errorMessages = await driver.findElements(By.xpath("//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'required') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'invalid') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'must')]"));
        let stillOpen = await driver.findElements(By.xpath("//*[contains(text(), 'PIN NEW HYDRANT') or contains(text(), 'Pinning Guidelines')]"));

        if (errorMessages.length > 0 && stillOpen.length > 0) {
            console.log("🏆 TEST PASSED: Pin form blocked submission with missing coordinates.");
        } else {
            console.log("❌ TEST FAILED: Pin form did not block invalid/missing data.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Pin Hydrant form field selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC039();
