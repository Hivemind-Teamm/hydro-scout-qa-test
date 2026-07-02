const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function TC050() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let malformedCsvPath = path.join(os.tmpdir(), `selenium-malformed-${Date.now()}.csv`);
    fs.writeFileSync(malformedCsvPath, 'id,name\nHYD-999,\n');

    let badRowsCsvPath = path.join(os.tmpdir(), `selenium-badrows-${Date.now()}.csv`);
    fs.writeFileSync(badRowsCsvPath, 'id,name,lat,lng,status\nHYD-998,Bad Row,not-a-number,not-a-number,unknown-status\n');

    try {
        console.log("🚀 Starting Test Case 050: CSV template and validation...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let adminButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Admin Dashboard')]")), 10000);
        await driver.executeScript("arguments[0].click();", adminButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Admin') or contains(text(), 'Import')]")), 10000);
        await driver.sleep(1500);

        let importSection = await driver.findElements(By.xpath("//*[contains(text(), 'Bulk Import') or contains(text(), 'Import')]"));
        if (importSection.length > 0) {
            await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", importSection[0]);
        }

        let templateButton = await driver.findElements(By.xpath("//button[contains(., 'Template') or contains(., 'template')] | //a[contains(., 'Template') or contains(., 'template')]"));
        let templateFound = templateButton.length > 0;

        let fileInput = await driver.wait(until.elementLocated(By.css("input[type='file']")), 10000);

        await fileInput.sendKeys(malformedCsvPath);
        await driver.sleep(1500);
        let malformedErrors = await driver.findElements(By.xpath("//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'invalid') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'error') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'missing')]"));

        await fileInput.sendKeys(badRowsCsvPath);
        await driver.sleep(1500);
        let rowErrors = await driver.findElements(By.xpath("//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'invalid') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'row') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'error')]"));

        if (templateFound && (malformedErrors.length > 0 || rowErrors.length > 0)) {
            console.log("🏆 TEST PASSED: Import template exists and invalid/malformed CSV rows were flagged.");
        } else {
            console.log("❌ TEST FAILED: Template button or row-level validation errors were not found.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Bulk Import selectors differ from the live UI.");
    } finally {
        try { fs.unlinkSync(malformedCsvPath); } catch (e) {}
        try { fs.unlinkSync(badRowsCsvPath); } catch (e) {}
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC050();
