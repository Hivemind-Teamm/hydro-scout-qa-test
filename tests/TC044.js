const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC044() {
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
        console.log("🚀 Starting Test Case 044: KPI cards...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@head.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let opsButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Operations Dashboard')]")), 10000);
        await driver.executeScript("arguments[0].click();", opsButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Operations') or contains(text(), 'KPI') or contains(text(), 'Status Breakdown')]")), 10000);
        await driver.sleep(1500);

        let statusBreakdown = await driver.findElements(By.xpath("//*[contains(text(), 'Status Breakdown') or contains(text(), 'Operational')]"));
        let openReports = await driver.findElements(By.xpath("//*[contains(text(), 'Open Reports')]"));
        let obstructed = await driver.findElements(By.xpath("//*[contains(text(), 'Obstructed')]"));
        let verified = await driver.findElements(By.xpath("//*[contains(text(), 'Verified')]"));
        let compliant = await driver.findElements(By.xpath("//*[contains(text(), 'Compliant')]"));

        let foundCount = [statusBreakdown, openReports, obstructed, verified, compliant].filter(list => list.length > 0).length;

        if (foundCount >= 3) {
            console.log("🏆 TEST PASSED: Operations Dashboard KPI cards are rendering.");
        } else {
            console.log("❌ TEST FAILED: Expected KPI cards were not found on the Operations Dashboard.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Operations Dashboard KPI selectors/text differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC044();
