const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC018() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 018: Zoom and 3D controls...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        await driver.wait(until.elementLocated(By.css("button[aria-label='Zoom in']")), 15000).click();
        await driver.sleep(500);
        await driver.findElement(By.css("button[aria-label='Zoom out']")).click();
        let threeD = await driver.findElements(By.xpath("//button[contains(@aria-label, '3D') or contains(@aria-label, '2D')]"));
        if (threeD.length > 0) { await threeD[0].click(); }
        console.log("🏆 TEST PASSED: Zoom controls and available 3D control were clickable.");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC018();
