const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const roles = [
    { label: 'general', email: 'karlpogi@sample.com', password: '123456' },
    { label: 'authorized', email: 'karlpogi@authorized.com', password: '123456' },
    { label: 'head', email: 'karlpogi@head.com', password: '123456' },
    { label: 'admin', email: 'karl.manangan@ciit.edu.ph', password: '1234567' }
];

async function TC041() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let allMatched = true;

    try {
        console.log("🚀 Starting Test Case 041: Account details and access labels...");

        for (let role of roles) {
            let driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .build();

            try {
                await driver.get('https://hivemind-hydro-scout.vercel.app/login');
                await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys(role.email);
                await driver.findElement(By.css("input[type='password']")).sendKeys(role.password);
                await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
                await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
                await driver.sleep(2500);

                let accountButton = await driver.wait(
                    until.elementLocated(By.xpath("//header//button[contains(@class, 'rounded-full') or @aria-label='Open account']")),
                    10000
                );
                await accountButton.click();
                await driver.sleep(1000);

                let pageText = (await driver.findElement(By.css('body')).getText()).toLowerCase();
                if (!pageText.includes(role.label)) {
                    console.log(`❌ Role label '${role.label}' was not found in Account Center.`);
                    allMatched = false;
                }
            } finally {
                await driver.quit();
            }
        }

        if (allMatched) {
            console.log("🏆 TEST PASSED: Account Center role labels matched the logged-in role for all four accounts.");
        } else {
            console.log("❌ TEST FAILED: One or more role labels did not match in Account Center.");
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
    }
}

TC041();
