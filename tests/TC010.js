const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC010() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 010: Authorized user permissions...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@authorized.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        let pinButton = await driver.wait(until.elementLocated(By.css("button[aria-label='Pin new hydrant']")), 10000);
        let adminButtons = await driver.findElements(By.xpath("//*[contains(text(), 'Admin Dashboard')]"));
        if (await pinButton.isDisplayed() && adminButtons.length === 0) {
            console.log("🏆 TEST PASSED: Authorized user can access field tools but not admin tools.");
        } else {
            console.log("❌ TEST FAILED: Authorized role permissions are incorrect.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC010();
