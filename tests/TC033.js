const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function TC033() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let nonImagePath = path.join(os.tmpdir(), `selenium-invalid-${Date.now()}.txt`);
    fs.writeFileSync(nonImagePath, 'this is not an image');

    let oversizedPath = path.join(os.tmpdir(), `selenium-oversized-${Date.now()}.jpg`);
    fs.writeFileSync(oversizedPath, Buffer.alloc(11 * 1024 * 1024, 1));

    try {
        console.log("🚀 Starting Test Case 033: Upload validation...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@head.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let marker = await driver.wait(until.elementLocated(By.xpath("//img[contains(@src, 'Hydrant%20Pin') or contains(@src, 'Hydrant Pin') or contains(@alt, 'hydrant') or contains(@alt, 'Hydrant')]")), 15000);
        await driver.executeScript("arguments[0].click();", marker);
        await driver.sleep(1500);

        let editButton = await driver.wait(until.elementLocated(By.css("button[title='Edit hydrant']")), 10000);
        await driver.executeScript("arguments[0].click();", editButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Operational Status')]")), 10000);

        let addPhotoButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(@class, 'border-dashed') or contains(., 'Add Photo') or contains(., 'Add photo') or contains(., 'Upload Photo')]")),
            10000
        );
        await driver.executeScript("arguments[0].click();", addPhotoButton);
        await driver.sleep(800);

        let consentButtons = await driver.findElements(By.xpath("//button[contains(., 'Allow') or contains(., 'Agree') or contains(., 'Consent') or contains(., 'Continue')]"));
        if (consentButtons.length > 0) {
            await consentButtons[0].click();
            await driver.sleep(500);
        }

        let fileInput = await driver.wait(until.elementLocated(By.css("input[type='file']")), 10000);

        await fileInput.sendKeys(nonImagePath);
        await driver.sleep(1500);
        let nonImageError = await driver.findElements(By.xpath("//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'image') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'invalid') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'unsupported')]"));

        await fileInput.sendKeys(oversizedPath);
        await driver.sleep(1500);
        let sizeError = await driver.findElements(By.xpath("//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '10 mb') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'too large') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'exceeds')]"));

        if (nonImageError.length > 0 || sizeError.length > 0) {
            console.log("🏆 TEST PASSED: Invalid file type and/or oversized file were rejected with a visible error.");
        } else {
            console.log("❌ TEST FAILED: No validation error was shown for invalid/oversized uploads.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: upload validation error text differs from the live UI.");
    } finally {
        try { fs.unlinkSync(nonImagePath); } catch (e) {}
        try { fs.unlinkSync(oversizedPath); } catch (e) {}
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC033();
