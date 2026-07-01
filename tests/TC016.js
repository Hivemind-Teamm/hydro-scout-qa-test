const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC016() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 016: Map provider toggle...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        let switchButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(@aria-label, 'Switch to OSM') or contains(@aria-label, 'Switch to Mapbox')]")), 15000);
        await switchButton.click();
        await driver.sleep(1500);
        let switchBack = await driver.wait(until.elementLocated(By.xpath("//button[contains(@aria-label, 'Switch to OSM') or contains(@aria-label, 'Switch to Mapbox')]")), 10000);
        await switchBack.click();
        console.log("🏆 TEST PASSED: Map provider toggle was clickable both ways.");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC016();
