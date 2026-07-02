const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC047() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let tempEmail = `selenium-admincreate-${Date.now()}@example.com`;

    try {
        console.log("🚀 Starting Test Case 047: Create account...");
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

        let rowCountBefore = (await driver.findElements(By.css('tbody tr'))).length;

        let createButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Create Account') or contains(., 'Add User') or contains(., 'New User')]")),
            10000
        );
        await driver.executeScript("arguments[0].click();", createButton);
        await driver.sleep(800);

        let submitButton = await driver.findElement(By.xpath("(//button[contains(., 'Create Account')])[last()]"));

        // Blank submit: should not create a row and should keep the form open.
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(800);
        let rowCountAfterBlank = (await driver.findElements(By.css('tbody tr'))).length;
        let formStillOpenAfterBlank = (await driver.findElements(By.xpath("(//button[contains(., 'Create Account')])[last()]"))).length > 0;

        let emailInput = await driver.findElement(By.css("input[type='email']"));
        let passwordInput = await driver.findElement(By.xpath("//input[@placeholder='min. 6 characters']"));

        // Invalid email + short password: should also be blocked.
        await emailInput.sendKeys('not-an-email');
        await passwordInput.sendKeys('123');
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(800);
        let rowCountAfterInvalid = (await driver.findElements(By.css('tbody tr'))).length;

        // Now submit valid data.
        await emailInput.clear();
        await passwordInput.clear();
        await emailInput.sendKeys(tempEmail);
        await passwordInput.sendKeys('123456');
        await driver.executeScript("arguments[0].click();", submitButton);
        await driver.sleep(2000);

        let stillOnAdmin = (await driver.findElements(By.xpath("//*[contains(text(), 'System Administration') or contains(text(), 'Manage Users')]"))).length > 0;
        let newUserRows = await driver.findElements(By.xpath(`//tr[.//*[contains(text(), '${tempEmail}')]]`));
        let rowCountAfterValid = (await driver.findElements(By.css('tbody tr'))).length;

        let invalidSubmissionsBlocked = rowCountAfterBlank === rowCountBefore && rowCountAfterInvalid === rowCountBefore && formStillOpenAfterBlank;
        let validSubmissionSucceeded = stillOnAdmin && newUserRows.length > 0 && rowCountAfterValid === rowCountBefore + 1;

        if (invalidSubmissionsBlocked && validSubmissionSucceeded) {
            console.log("🏆 TEST PASSED: Invalid entries were blocked and a valid account was created without signing out admin.");
        } else {
            console.log("❌ TEST FAILED: Create account validation or successful creation did not behave as expected.");
        }

        // Cleanup: remove the disposable test account so no residue is left behind.
        if (newUserRows.length > 0) {
            try {
                let removeButton = await newUserRows[0].findElement(By.xpath(".//button[contains(., 'Remove')]"));
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
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Admin create-account form selectors differ from the live UI.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC047();
