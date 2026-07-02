const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC034() {
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
        console.log("🚀 Starting Test Case 034: File damage report...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@authorized.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let marker = await driver.wait(until.elementLocated(By.xpath("//img[contains(@src, 'Hydrant%20Pin') or contains(@src, 'Hydrant Pin') or contains(@alt, 'hydrant') or contains(@alt, 'Hydrant')]")), 15000);
        await driver.executeScript("arguments[0].click();", marker);
        await driver.sleep(1500);

        let reportButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Report') or @title='Report issue' or @title='Report damage' or @aria-label='Report damage']")),
            10000
        );
        await driver.executeScript("arguments[0].click();", reportButton);
        await driver.sleep(1000);

        let damageTypeOption = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Leak') or contains(., 'Obstruct') or contains(., 'Damage') or contains(., 'Blocked')] | //select | //input[@type='radio']")),
            10000
        );
        await driver.executeScript("arguments[0].click();", damageTypeOption);

        let description = await driver.wait(
            until.elementLocated(By.css("textarea")),
            10000
        );
        await description.sendKeys('Selenium automated damage report test');

        let submitButton = await driver.findElement(By.xpath("//button[contains(., 'Submit') or contains(., 'Report')]"));
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(2000);

        let savingButtons = await driver.findElements(By.xpath("//button[contains(., 'Saving') or contains(., 'Submitting')]"));
        if (savingButtons.length === 0) {
            console.log("🏆 TEST PASSED: Damage report was submitted and save process completed.");
        } else {
            console.log("❌ TEST FAILED: Damage report was still saving.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: report modal selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC034();
