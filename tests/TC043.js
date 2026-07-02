const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC043() {
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
        console.log("🚀 Starting Test Case 043: Dark/light mode...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let htmlClassBefore = await driver.executeScript("return document.documentElement.className;");

        let themeButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(@aria-label, 'theme') or contains(@aria-label, 'Theme') or contains(@aria-label, 'dark') or contains(@aria-label, 'Dark') or contains(@aria-label, 'light') or contains(@aria-label, 'Light')]")),
            10000
        );
        await themeButton.click();
        await driver.sleep(800);

        let htmlClassAfter = await driver.executeScript("return document.documentElement.className;");

        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'AOR') or contains(text(), 'Status')]")), 15000);
        let htmlClassAfterRefresh = await driver.executeScript("return document.documentElement.className;");

        if (htmlClassBefore !== htmlClassAfter && htmlClassAfter === htmlClassAfterRefresh) {
            console.log("🏆 TEST PASSED: Theme toggled and persisted across a refresh.");
        } else if (htmlClassBefore !== htmlClassAfter) {
            console.log("❌ TEST FAILED: Theme changed but did not persist after refresh.");
        } else {
            console.log("❌ TEST FAILED: Theme toggle did not change the document class.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: theme toggle selector differs from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC043();
