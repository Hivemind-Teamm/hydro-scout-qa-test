const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const viewports = [
    { width: 1440, height: 900, label: 'desktop' },
    { width: 1024, height: 768, label: 'tablet' },
    { width: 390, height: 844, label: 'mobile' }
];

async function TC055() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let allOk = true;

    try {
        console.log("🚀 Starting Test Case 055: Desktop/tablet/mobile smoke...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        for (let viewport of viewports) {
            await driver.manage().window().setRect({ width: viewport.width, height: viewport.height });
            await driver.sleep(1000);

            let accountButton = await driver.findElements(By.xpath("//header//button[contains(@class, 'rounded-full') or @aria-label='Open account']"));
            if (accountButton.length > 0) {
                await driver.executeScript("arguments[0].click();", accountButton[0]);
                await driver.sleep(800);
                await driver.executeScript("arguments[0].click();", accountButton[0]);
            }

            let horizontalOverflow = await driver.executeScript(
                "return document.documentElement.scrollWidth - document.documentElement.clientWidth;"
            );

            let bodyText = await driver.findElement(By.css('body')).getText();

            if (horizontalOverflow > 40 || bodyText.length === 0) {
                console.log(`❌ Layout issue detected at ${viewport.label} (${viewport.width}x${viewport.height}). Horizontal overflow: ${horizontalOverflow}px`);
                allOk = false;
            } else {
                console.log(`✅ ${viewport.label} (${viewport.width}x${viewport.height}) rendered without obvious overflow.`);
            }
        }

        if (allOk) {
            console.log("🏆 TEST PASSED: Dashboard remained usable across desktop, tablet, and mobile viewports.");
        } else {
            console.log("❌ TEST FAILED: One or more viewports showed layout overflow issues.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC055();
