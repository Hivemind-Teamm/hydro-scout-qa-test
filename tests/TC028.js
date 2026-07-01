const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC028() {
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
        console.log("🚀 Starting Test Case 028: Edit visibility by role...");

        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@sample.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let marker = await driver.wait(until.elementLocated(By.xpath("//img[contains(@src, 'Hydrant%20Pin') or contains(@src, 'Hydrant Pin') or contains(@alt, 'hydrant') or contains(@alt, 'Hydrant')]")), 15000);
        await driver.executeScript("arguments[0].click();", marker);
        await driver.sleep(1500);
        let generalEdit = await driver.findElements(By.css("button[title='Edit hydrant']"));
        await driver.quit();

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@head.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let marker2 = await driver.wait(until.elementLocated(By.xpath("//img[contains(@src, 'Hydrant%20Pin') or contains(@src, 'Hydrant Pin') or contains(@alt, 'hydrant') or contains(@alt, 'Hydrant')]")), 15000);
        await driver.executeScript("arguments[0].click();", marker2);
        await driver.sleep(1500);
        let headEdit = await driver.findElements(By.css("button[title='Edit hydrant']"));

        if (generalEdit.length === 0 && headEdit.length > 0) {
            console.log("🏆 TEST PASSED: Edit button is hidden for general and visible for head.");
        } else {
            console.log("❌ TEST FAILED: Edit visibility did not match expected roles.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC028();
