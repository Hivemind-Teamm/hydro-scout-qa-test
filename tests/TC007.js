const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC007() {
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
        console.log("🚀 Starting Test Case 007: Logout...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let accountButton = await driver.wait(
            until.elementLocated(By.xpath("//header//button[contains(@class, 'rounded-full') or @aria-label='Open account']")),
            10000
        );
        await accountButton.click();

        let logoutButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Log Out') or contains(., 'Logout')]")),
            10000
        );
        await logoutButton.click();

        await driver.wait(until.urlContains('/login'), 15000);
        console.log("🏆 TEST PASSED: User logged out and returned to login page.");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC007();
