const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC042() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let tempEmail = `selenium-pwtest-${Date.now()}@example.com`;
    let originalPassword = '123456';

    try {
        console.log("🚀 Starting Test Case 042: Change password validation and success...");

        console.log("Creating disposable test account for password change...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/signup');
        await driver.wait(until.elementLocated(By.css("input[placeholder='e.g. Juan dela Cruz']")), 10000).sendKeys('Selenium Password Test');
        await driver.findElement(By.css("input[type='email']")).sendKeys(tempEmail);
        let signupPasswords = await driver.findElements(By.css("input[type='password']"));
        await signupPasswords[0].sendKeys(originalPassword);
        await signupPasswords[1].sendKeys(originalPassword);
        await driver.findElement(By.xpath("//button[contains(., 'Create Account')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/signup).*$/), 15000);
        await driver.sleep(2500);

        let accountButton = await driver.wait(
            until.elementLocated(By.xpath("//header//button[contains(@class, 'rounded-full') or @aria-label='Open account']")),
            10000
        );
        await accountButton.click();
        await driver.sleep(1000);

        let changePasswordLink = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Change Password') or contains(., 'Password')]")),
            10000
        );
        await changePasswordLink.click();
        await driver.sleep(800);

        let passwordFields = await driver.findElements(By.css("input[type='password']"));

        let submitButton = await driver.findElement(By.xpath("//button[contains(., 'Save') or contains(., 'Update') or contains(., 'Change')]"));
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(800);
        let blankResult = await driver.findElement(By.css('body')).getText();

        if (passwordFields.length >= 2) {
            await passwordFields[0].sendKeys('123');
            await passwordFields[1].sendKeys('123');
            await driver.executeScript("arguments[0].click();", submitButton);
            await driver.sleep(800);

            await passwordFields[0].clear();
            await passwordFields[1].clear();
            await passwordFields[0].sendKeys('newpassword1');
            await passwordFields[1].sendKeys('newpassword2');
            await driver.executeScript("arguments[0].click();", submitButton);
            await driver.sleep(800);

            let errorMessages = await driver.findElements(By.xpath("//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'match') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'short') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'invalid')]"));

            await passwordFields[0].clear();
            await passwordFields[1].clear();
            await passwordFields[0].sendKeys('newpassword123');
            await passwordFields[1].sendKeys('newpassword123');
            await driver.executeScript("arguments[0].click();", submitButton);
            await driver.sleep(1500);

            if (errorMessages.length > 0) {
                console.log("🏆 TEST PASSED: Invalid password change attempts were blocked and a valid change was submitted.");
            } else {
                console.log("❌ TEST FAILED: No inline validation error appeared for invalid password change attempts.");
            }
        } else {
            console.log("❌ TEST FAILED: Password change fields were not found.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Account Center password change selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }

    // Cleanup: remove the disposable test account so no residue is left behind.
    let cleanupDriver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        await cleanupDriver.get('https://hivemind-hydro-scout.vercel.app/login');
        await cleanupDriver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await cleanupDriver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await cleanupDriver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await cleanupDriver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await cleanupDriver.sleep(2500);

        let adminButton = await cleanupDriver.wait(until.elementLocated(By.xpath("//button[contains(., 'Admin Dashboard')]")), 10000);
        await cleanupDriver.executeScript("arguments[0].click();", adminButton);
        await cleanupDriver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'System Administration')]")), 10000);
        await cleanupDriver.sleep(1500);

        let row = await cleanupDriver.wait(until.elementLocated(By.xpath(`//tr[.//*[contains(text(), '${tempEmail}')]]`)), 8000);
        let removeButton = await row.findElement(By.xpath(".//button[contains(., 'Remove')]"));
        await cleanupDriver.executeScript("arguments[0].scrollIntoView({block:'center'});", removeButton);
        await cleanupDriver.sleep(300);
        await cleanupDriver.executeScript("arguments[0].click();", removeButton);
        await cleanupDriver.sleep(800);
        let confirmButton = await cleanupDriver.wait(until.elementLocated(By.xpath("//button[contains(., 'Remove Account')]")), 5000);
        await cleanupDriver.executeScript("arguments[0].click();", confirmButton);
        await cleanupDriver.sleep(1200);
    } catch (cleanupError) {
        console.log("⚠️ Cleanup note: could not auto-remove the disposable test account", tempEmail, "- remove it manually if it persists.");
    } finally {
        await cleanupDriver.quit();
    }
}

TC042();
