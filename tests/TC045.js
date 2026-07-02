const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC045() {
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
        console.log("🚀 Starting Test Case 045: Zone and trend charts...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@head.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let opsButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Operations Dashboard')]")), 10000);
        await driver.executeScript("arguments[0].click();", opsButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Operations') or contains(text(), 'Zone') or contains(text(), 'Trend')]")), 10000);
        await driver.sleep(1500);

        let zoneRows = await driver.findElements(By.xpath("//*[contains(text(), 'Zone')]"));
        let chartElements = await driver.findElements(By.css('svg, canvas'));

        if (zoneRows.length > 0 && chartElements.length > 0) {
            console.log("🏆 TEST PASSED: Zone rows and chart elements rendered on the Operations Dashboard.");
        } else {
            console.log("❌ TEST FAILED: Zone rows or trend chart did not render as expected.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: zone/trend chart selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC045();
