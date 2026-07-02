const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC036() {
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
        console.log("🚀 Starting Test Case 036: Report filters...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@head.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let reportsButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Reports') or @aria-label='Reports']")),
            10000
        );
        await driver.executeScript("arguments[0].click();", reportsButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Reports Register') or contains(text(), 'Pending') or contains(text(), 'Resolved')]")), 10000);
        await driver.sleep(1000);

        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'All')]")), 10000).click();
        await driver.sleep(800);
        await driver.findElement(By.xpath("//button[contains(., 'Pending')]")).click();
        await driver.sleep(800);
        await driver.findElement(By.xpath("//button[contains(., 'Resolved')]")).click();
        await driver.sleep(800);
        await driver.findElement(By.xpath("//button[contains(., 'Denied')]")).click();

        console.log("🏆 TEST PASSED: Reports Register filter tabs were clickable.");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Reports Register selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC036();
