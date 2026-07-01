const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC026() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 026: Photo lightbox...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        let marker = await driver.wait(until.elementLocated(By.xpath("//img[contains(@src, 'Hydrant%20Pin') or contains(@src, 'Hydrant Pin') or contains(@alt, 'hydrant') or contains(@alt, 'Hydrant')]")), 15000);
        await driver.executeScript("arguments[0].click();", marker);
        await driver.sleep(1500);
        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000).click();
        let photos = await driver.findElements(By.xpath("//img[contains(@alt, 'field photo')]"));
        if (photos.length === 0) { throw new Error('No hydrant photo found for this test data.'); }
        await driver.executeScript("arguments[0].click();", photos[0]);
        let close = await driver.wait(until.elementLocated(By.css("button[aria-label='Close']")), 10000);
        await close.click();
        console.log("🏆 TEST PASSED: Photo lightbox opened and closed.");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC026();
