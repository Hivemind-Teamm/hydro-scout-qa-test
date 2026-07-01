const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC004() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 004: Password visibility toggle...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        let password = await driver.wait(until.elementLocated(By.css("input[type='password']")), 10000);
        await password.sendKeys('1234567');
        let showButton = await driver.findElement(By.css("button[aria-label='Show password']"));
        await showButton.click();
        let visible = await driver.wait(until.elementLocated(By.css("input[type='text']")), 5000);
        let valueAfterShow = await visible.getAttribute('value');
        let hideButton = await driver.findElement(By.css("button[aria-label='Hide password']"));
        await hideButton.click();
        let hiddenAgain = await driver.wait(until.elementLocated(By.css("input[type='password']")), 5000);
        let valueAfterHide = await hiddenAgain.getAttribute('value');
        if (valueAfterShow === '1234567' && valueAfterHide === '1234567') {
            console.log("🏆 TEST PASSED: Password visibility toggled and value was preserved.");
        } else {
            console.log("❌ TEST FAILED: Password value changed during toggle.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC004();
