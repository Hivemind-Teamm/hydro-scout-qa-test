const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const os = require('os');
const path = require('path');

const TINY_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

async function TC031() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let tempImagePath = path.join(os.tmpdir(), `selenium-test-photo-${Date.now()}.jpg`);
    fs.writeFileSync(tempImagePath, Buffer.from(TINY_JPEG_BASE64, 'base64'));

    try {
        console.log("🚀 Starting Test Case 031: Upload photo with consent...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karlpogi@head.com');
        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let marker = await driver.wait(until.elementLocated(By.xpath("//img[contains(@src, 'Hydrant%20Pin') or contains(@src, 'Hydrant Pin') or contains(@alt, 'hydrant') or contains(@alt, 'Hydrant')]")), 15000);
        await driver.executeScript("arguments[0].click();", marker);
        await driver.sleep(1500);

        let editButton = await driver.wait(until.elementLocated(By.css("button[title='Edit hydrant']")), 10000);
        await driver.executeScript("arguments[0].click();", editButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Operational Status')]")), 10000);

        let addPhotoButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(@class, 'border-dashed') or contains(., 'Add Photo') or contains(., 'Add photo') or contains(., 'Upload Photo')]")),
            10000
        );
        await driver.executeScript("arguments[0].click();", addPhotoButton);
        await driver.sleep(800);

        let consentButtons = await driver.findElements(By.xpath("//button[contains(., 'Allow') or contains(., 'Agree') or contains(., 'Consent') or contains(., 'Continue')]"));
        if (consentButtons.length > 0) {
            await consentButtons[0].click();
            await driver.sleep(500);
        }

        let fileInput = await driver.wait(until.elementLocated(By.css("input[type='file']")), 10000);
        await fileInput.sendKeys(tempImagePath);

        let thumbnail = await driver.wait(
            until.elementLocated(By.xpath("//img[contains(@src, 'blob:') or contains(@alt, 'preview') or contains(@alt, 'photo')]")),
            15000
        );

        if (await thumbnail.isDisplayed()) {
            console.log("🏆 TEST PASSED: Consented photo upload produced a thumbnail preview.");
        } else {
            console.log("❌ TEST FAILED: Thumbnail preview did not appear after upload.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Add Photo / consent selectors differ from the live UI.");
    } finally {
        try { fs.unlinkSync(tempImagePath); } catch (e) {}
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC031();
