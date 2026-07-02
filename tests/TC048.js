const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC048() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let tempEmail = `selenium-roletest-${Date.now()}@example.com`;

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 048: Update user role...");

        console.log("Creating disposable test account to change its role...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/signup');
        await driver.wait(until.elementLocated(By.css("input[placeholder='e.g. Juan dela Cruz']")), 10000).sendKeys('Selenium Role Test');
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
        let editButton = await userRow.findElement(By.xpath(".//button[contains(., 'Edit')]"));
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", editButton);
        await driver.sleep(800);

        let authorizedOption = await driver.wait(
            until.elementLocated(By.xpath("//div[contains(@class, 'bg-black')]//button[contains(., 'Authorized')]")),
            10000
        );
        await driver.executeScript("arguments[0].click();", authorizedOption);

        let saveButton = await driver.findElement(By.xpath("//button[contains(@class, 'admin-btn-primary')]"));
        await driver.executeScript("arguments[0].click();", saveButton);
        await driver.sleep(1500);

        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Admin Dashboard')]")), 15000);
        await driver.sleep(1500);
        let adminButtonAfterRefresh = await driver.findElement(By.xpath("//button[contains(., 'Admin Dashboard')]"));
        await driver.executeScript("arguments[0].click();", adminButtonAfterRefresh);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'System Administration')]")), 10000);
        await driver.sleep(1000);

        let updatedRow = await driver.wait(until.elementLocated(By.xpath(`//tr[.//*[contains(text(), '${tempEmail}')]]`)), 10000);
        let updatedBadge = (await updatedRow.getText()).toLowerCase();

        if (updatedBadge.includes('authorized')) {
            console.log("🏆 TEST PASSED: User role updated to authorized and persisted after reload.");
        } else {
            console.log("❌ TEST FAILED: Updated role badge did not reflect the new role after reload.");
        }

        // Cleanup: remove the disposable test account.
        try {
            let removeButton = await updatedRow.findElement(By.xpath(".//button[contains(., 'Remove')]"));
            await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", removeButton);
            await driver.sleep(300);
            await driver.executeScript("arguments[0].click();", removeButton);
            await driver.sleep(800);
            let confirmButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Remove Account')]")), 5000);
            await driver.executeScript("arguments[0].click();", confirmButton);
            await driver.sleep(1200);
        } catch (cleanupError) {
            console.log("⚠️ Cleanup note: could not auto-remove the disposable test account", tempEmail, "- remove it manually if it persists.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Admin role-edit selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC048();
