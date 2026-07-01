const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC021() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 021: Location search success...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);
        let search = await driver.wait(until.elementLocated(By.css("input[placeholder='Search Location']")), 15000);
        await search.sendKeys('Diliman Quezon City');
        let result = await driver.wait(until.elementLocated(By.xpath("//ul//button")), 15000);
        await result.click();
        await driver.sleep(1000);
        if ((await search.getAttribute('value')) === '') {
            console.log("🏆 TEST PASSED: Search result selected and dropdown closed.");
        } else {
            console.log("❌ TEST FAILED: Search field did not clear after selecting result.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC021();
