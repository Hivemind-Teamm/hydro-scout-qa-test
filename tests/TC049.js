const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC049() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let tempEmail = `selenium-removetest-${Date.now()}@example.com`;

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 049: Remove user...");

        console.log("Creating disposable test account to remove...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/signup');
        await driver.wait(until.elementLocated(By.css("input[placeholder='e.g. Juan dela Cruz']")), 10000).sendKeys('Selenium Remove Test');
        await driver.findElement(By.css("input[type='email']")).sendKeys(tempEmail);
        let signupPasswords = await driver.findElements(By.css("input[type='password']"));
        await signupPasswords[0].sendKeys('123456');
        await signupPasswords[1].sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Create Account')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/signup).*$/), 15000);
        await driver.sleep(1500);
        await driver.quit();

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

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

        let userRow = await driver.wait(until.elementLocated(By.xpath(`//tr[.//*[contains(text(), '${tempEmail}')]]`)), 10000);
        let removeButton = await userRow.findElement(By.xpath(".//button[contains(., 'Remove')]"));
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", removeButton);
        await driver.sleep(300);
        await driver.executeScript("arguments[0].click();", removeButton);
        await driver.sleep(800);
        let cancelButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Cancel')]")), 5000);
        await driver.executeScript("arguments[0].click();", cancelButton);
        await driver.sleep(800);

        let stillPresentAfterCancel = await driver.findElements(By.xpath(`//*[contains(text(), '${tempEmail}')]`));

        let userRowAgain = await driver.wait(until.elementLocated(By.xpath(`//tr[.//*[contains(text(), '${tempEmail}')]]`)), 10000);
        let removeButtonAgain = await userRowAgain.findElement(By.xpath(".//button[contains(., 'Remove')]"));
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", removeButtonAgain);
        await driver.sleep(300);
        await driver.executeScript("arguments[0].click();", removeButtonAgain);
        await driver.sleep(800);
        let confirmButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Remove Account')]")), 5000);
        await driver.executeScript("arguments[0].click();", confirmButton);
        await driver.sleep(1500);

        let stillPresentAfterConfirm = await driver.findElements(By.xpath(`//*[contains(text(), '${tempEmail}')]`));

        if (stillPresentAfterCancel.length > 0 && stillPresentAfterConfirm.length === 0) {
            console.log("🏆 TEST PASSED: Cancel preserved the user and confirm removed the user document from the table.");
        } else {
            console.log("❌ TEST FAILED: Remove user cancel/confirm behavior did not match expectations.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Admin remove-user selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC049();
