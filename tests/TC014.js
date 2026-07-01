const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC014() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 014: Status counts...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        let operational = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Operational')]")), 15000);
        let reduced = await driver.findElement(By.xpath("//*[contains(text(), 'Reduced')]"));
        let out = await driver.findElement(By.xpath("//*[contains(text(), 'Out of Service')]"));
        if (await operational.isDisplayed() && await reduced.isDisplayed() && await out.isDisplayed()) {
            console.log("🏆 TEST PASSED: Status count labels are visible.");
        } else {
            console.log("❌ TEST FAILED: Missing status count labels.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC014();
