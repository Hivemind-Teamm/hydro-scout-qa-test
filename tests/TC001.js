const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC001() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 001: Signed-out home redirect...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/');
        await driver.wait(until.urlContains('/login'), 15000);
        let controls = await driver.findElements(By.xpath("//*[contains(text(), 'Admin Dashboard') or contains(text(), 'Operations Dashboard') or contains(text(), 'Pin new hydrant')]"));
        if (controls.length === 0) {
            console.log("🏆 TEST PASSED: Signed-out user was redirected to login and dashboard controls are hidden.");
        } else {
            console.log("❌ TEST FAILED: Protected dashboard controls are visible while signed out.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC001();
