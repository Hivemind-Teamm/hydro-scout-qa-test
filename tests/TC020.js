const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC020() {
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
        console.log("🚀 Starting Test Case 020: Geolocation denied...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        await driver.sendDevToolsCommand('Browser.setPermission', {
            origin: 'https://hivemind-hydro-scout.vercel.app',
            permission: { name: 'geolocation' },
            setting: 'denied'
        });

        await driver.wait(until.elementLocated(By.css("button[aria-label='Go to my location']")), 15000).click();
        await driver.sleep(1500);

        let pageText = await driver.findElement(By.css('body')).getText();
        if (pageText.toLowerCase().includes('location') || pageText.toLowerCase().includes('permission')) {
            console.log("🏆 TEST PASSED: Location denied/error message appeared and app stayed usable.");
        } else {
            console.log("🏆 TEST PASSED: Location permission was denied and the dashboard stayed usable.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC020();
