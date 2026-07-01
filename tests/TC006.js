const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC006() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Starting Test Case 006: Sign-up validation...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/signup');
        await driver.wait(until.elementLocated(By.css("input[placeholder='e.g. Juan dela Cruz']")), 10000).sendKeys('Selenium Validation');
        await driver.findElement(By.css("input[type='email']")).sendKeys('karlpogi@sample.com');
        let passwords = await driver.findElements(By.css("input[type='password']"));
        await passwords[0].sendKeys('123456');
        await passwords[1].sendKeys('654321');
        await driver.findElement(By.xpath("//button[contains(., 'Create Account')]")).click();
        await driver.sleep(1000);
        let stillSignup = (await driver.getCurrentUrl()).includes('/signup');
        await passwords[0].clear();
        await passwords[1].clear();
        await passwords[0].sendKeys('123');
        await passwords[1].sendKeys('123');
        await driver.findElement(By.xpath("//button[contains(., 'Create Account')]")).click();
        await driver.sleep(1000);
        if (stillSignup && (await driver.getCurrentUrl()).includes('/signup')) {
            console.log("🏆 TEST PASSED: Invalid signup entries were blocked.");
        } else {
            console.log("❌ TEST FAILED: Invalid signup was not blocked.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC006();
