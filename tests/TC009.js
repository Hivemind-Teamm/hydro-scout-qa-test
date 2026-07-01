const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC009() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 009: General user permissions...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@sample.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        let adminButtons = await driver.findElements(By.xpath("//*[contains(text(), 'Admin Dashboard') or contains(text(), 'Operations Dashboard') or @aria-label='Pin new hydrant' or @aria-label='Reports']"));
        if (adminButtons.length === 0) {
            console.log("🏆 TEST PASSED: General user cannot see restricted dashboard actions.");
        } else {
            console.log("❌ TEST FAILED: Restricted action is visible for general user.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC009();
