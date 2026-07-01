const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC012() {
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
        console.log("🚀 Starting Test Case 012: Admin permissions...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(4000);

        let adminButtons = await driver.findElements(By.xpath("//button[contains(., 'Admin Dashboard')]"));
        if (adminButtons.length === 0) {
            throw new Error("Admin Dashboard button was not found. Check if karl.manangan@ciit.edu.ph is really set as admin in Firebase.");
        }

        await adminButtons[0].click();
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'System Administration') or contains(text(), 'User Directory') or contains(text(), 'Admin')]") ), 10000);
        console.log("🏆 TEST PASSED: Admin dashboard loaded for admin account.");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC012();
