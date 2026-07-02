const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC032() {
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
        console.log("🚀 Starting Test Case 032: Decline storage consent...");
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

        let declineButtons = await driver.findElements(By.xpath("//button[contains(., 'Decline') or contains(., 'Cancel') or contains(., 'Deny') or contains(., 'No thanks')]"));
        if (declineButtons.length === 0) {
            throw new Error("No consent dialog with a decline/cancel option was found.");
        }
        await declineButtons[0].click();
        await driver.sleep(800);

        let fileInputs = await driver.findElements(By.css("input[type='file']"));
        let thumbnails = await driver.findElements(By.xpath("//img[contains(@src, 'blob:')]"));

        if (thumbnails.length === 0) {
            console.log("🏆 TEST PASSED: Declining consent did not start an upload or produce a preview.");
        } else {
            console.log("❌ TEST FAILED: A photo preview appeared even though consent was declined.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: consent dialog selectors differ from the live UI, or consent is not required for this account.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC032();
