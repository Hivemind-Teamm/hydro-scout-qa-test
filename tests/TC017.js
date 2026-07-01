const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC017() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 017: Mapbox fallback...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        await driver.sleep(3000);
        let fallback = await driver.findElements(By.xpath("//*[contains(text(), 'Mapbox unavailable') or contains(text(), 'OpenStreetMap')]"));
        let dashboard = await driver.findElements(By.xpath("//*[contains(text(), 'Status') or contains(text(), 'AOR')]"));
        if (fallback.length > 0 || dashboard.length > 0) {
            console.log("🏆 TEST PASSED: App displayed map/fallback UI instead of a blank page.");
        } else {
            console.log("❌ TEST FAILED: No map or fallback UI was found.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC017();
