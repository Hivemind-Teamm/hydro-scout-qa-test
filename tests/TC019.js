const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC019() {
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
        console.log("🚀 Starting Test Case 019: Geolocation allowed...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        await driver.sendDevToolsCommand('Browser.grantPermissions', {
            origin: 'https://hivemind-hydro-scout.vercel.app',
            permissions: ['geolocation']
        });
        await driver.sendDevToolsCommand('Emulation.setGeolocationOverride', {
            latitude: 14.6537,
            longitude: 121.0685,
            accuracy: 20
        });

        await driver.wait(until.elementLocated(By.css("button[aria-label='Go to my location']")), 15000).click();
        await driver.sleep(1500);
        console.log("🏆 TEST PASSED: Go to my location clicked with allowed geolocation.");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC019();
