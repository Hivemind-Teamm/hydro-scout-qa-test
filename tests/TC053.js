const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC053() {
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
        console.log("🚀 Starting Test Case 053: Photo proxy same-origin gate...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let marker = await driver.wait(until.elementLocated(By.xpath("//img[contains(@src, 'Hydrant%20Pin') or contains(@src, 'Hydrant Pin') or contains(@alt, 'hydrant') or contains(@alt, 'Hydrant')]")), 15000);
        await driver.executeScript("arguments[0].click();", marker);
        await driver.sleep(1500);
        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000).click();
        await driver.sleep(1000);

        let embeddedPhotos = await driver.findElements(By.xpath("//img[contains(@src, '/api/photo')]"));
        if (embeddedPhotos.length === 0) {
            throw new Error('No hydrant photo using the /api/photo proxy was found for this test data.');
        }
        let photoSrc = await embeddedPhotos[0].getAttribute('src');

        let embeddedStatus = await driver.executeAsyncScript(function (src, callback) {
            fetch(src, { credentials: 'same-origin' })
                .then(res => callback({ status: res.status, ok: res.ok }))
                .catch(err => callback({ error: err.message }));
        }, photoSrc);

        let unsafePath = photoSrc.includes('?') ? photoSrc.split('?')[0] + '?p=../../etc/passwd' : photoSrc + '?p=../../etc/passwd';
        let unsafeStatus = await driver.executeAsyncScript(function (src, callback) {
            fetch(src, { credentials: 'same-origin' })
                .then(res => callback({ status: res.status, ok: res.ok }))
                .catch(err => callback({ error: err.message }));
        }, unsafePath);

        console.log("Embedded photo fetch result:", JSON.stringify(embeddedStatus));
        console.log("Unsafe path fetch result:", JSON.stringify(unsafeStatus));

        if (embeddedStatus.ok && !unsafeStatus.ok) {
            console.log("🏆 TEST PASSED: Embedded same-origin photo loaded and an unsafe path was rejected.");
        } else {
            console.log("❌ TEST FAILED: Photo proxy did not clearly distinguish safe vs unsafe requests.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: /api/photo query param format or proxy gating logic differs from what this test assumes.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC053();
