const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC029() {
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
        console.log("🚀 Starting Test Case 029: Submit status update...");
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

        let reducedButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Reduced Pressure')]")), 10000);
        await driver.executeScript("arguments[0].click();", reducedButton);
        await driver.findElement(By.css("input[placeholder='e.g. Clear']")).sendKeys('Clear');
        await driver.findElement(By.css("input[placeholder='e.g. Blocked']")).sendKeys('None');
        await driver.findElement(By.css("textarea[placeholder='Describe the current condition...']")).sendKeys('Selenium status update test');
        await driver.findElement(By.xpath("//button[contains(., 'Submit')]")).click();
        await driver.sleep(3000);

        let savingButtons = await driver.findElements(By.xpath("//button[contains(., 'Saving')]") );
        if (savingButtons.length === 0) {
            console.log("🏆 TEST PASSED: Status update submit button was clicked and save process completed.");
        } else {
            console.log("❌ TEST FAILED: Status update was still saving.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC029();
