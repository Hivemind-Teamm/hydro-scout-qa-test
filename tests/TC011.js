const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC011() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 011: Head permissions...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@head.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        let opsButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Operations Dashboard')]")), 10000);
        let adminButtons = await driver.findElements(By.xpath("//*[contains(text(), 'Admin Dashboard')]"));
        if (await opsButton.isDisplayed() && adminButtons.length === 0) {
            console.log("🏆 TEST PASSED: Head can access Operations Dashboard but not Admin Dashboard.");
        } else {
            console.log("❌ TEST FAILED: Head role permissions are incorrect.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC011();
