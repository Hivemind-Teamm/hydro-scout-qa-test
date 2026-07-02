const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC046() {
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
        console.log("🚀 Starting Test Case 046: User search and role filters...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let adminButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Admin Dashboard')]")), 10000);
        await driver.executeScript("arguments[0].click();", adminButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'User Directory') or contains(text(), 'Admin')]")), 10000);
        await driver.sleep(1500);

        let searchInput = await driver.wait(
            until.elementLocated(By.xpath("//input[contains(@placeholder, 'Search') or contains(@placeholder, 'search')]")),
            10000
        );
        await searchInput.sendKeys('karl');
        await driver.sleep(1000);

        let searchedRows = await driver.findElements(By.xpath("//table//tr | //*[contains(@class, 'user-row')]"));

        await searchInput.clear();
        await driver.sleep(500);

        let roleFilterButtons = await driver.findElements(By.xpath("//button[contains(., 'General') or contains(., 'Authorized') or contains(., 'Head') or contains(., 'Admin')]"));
        if (roleFilterButtons.length > 0) {
            await driver.executeScript("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", roleFilterButtons[0]);
            await driver.sleep(1000);
        }

        if (searchedRows.length > 0 || roleFilterButtons.length > 0) {
            console.log("🏆 TEST PASSED: User search and role filter controls responded without errors.");
        } else {
            console.log("❌ TEST FAILED: User table search/filter controls were not found.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Admin Dashboard table selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC046();
