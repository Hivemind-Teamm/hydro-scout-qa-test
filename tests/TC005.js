const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC005() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 005: Sign-up success...");
        let email = 'selenium' + Date.now() + '@example.com';
        await driver.get('https://hivemind-hydro-scout.vercel.app/signup');
        await driver.wait(until.elementLocated(By.css("input[placeholder='e.g. Juan dela Cruz']")), 10000).sendKeys('Selenium Test User');
        await driver.findElement(By.css("input[type='email']")).sendKeys(email);
        let passwords = await driver.findElements(By.css("input[type='password']"));
        await passwords[0].sendKeys('123456');
        await passwords[1].sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Create Account')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/signup).*$/), 15000);
        console.log("🏆 TEST PASSED: New account was created and redirected away from signup.");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC005();
