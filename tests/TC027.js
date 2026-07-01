const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function TC027() {
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
        console.log("🚀 Starting Test Case 027: Photo context menu...");

        await driver.get('https://hivemind-hydro-scout.vercel.app/login');

        await driver.wait(
            until.elementLocated(By.css("input[type='email']")),
            10000
        ).sendKeys('karlpogi@head.com');

        await driver.findElement(By.css("input[type='password']")).sendKeys('123456');

        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();

        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        // Click first hydrant marker
        let marker = await driver.wait(
            until.elementLocated(By.xpath("//img[contains(@src, 'Hydrant%20Pin') or contains(@src, 'Hydrant Pin') or contains(@alt, 'hydrant') or contains(@alt, 'Hydrant')]")),
            15000
        );

        await driver.executeScript("arguments[0].click();", marker);
        await driver.sleep(1500);

        // Open full details
        let fullDetailsButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")),
            10000
        );

        await driver.executeScript("arguments[0].click();", fullDetailsButton);

        await driver.wait(
            until.elementLocated(By.xpath("//button[normalize-space()='Quick']")),
            10000
        );

        // Go to Details tab
        let detailsButton = await driver.wait(
            until.elementLocated(By.xpath("//button[normalize-space()='Details']")),
            10000
        );

        await driver.executeScript("arguments[0].click();", detailsButton);
        await driver.sleep(1000);

        // Find a photo tile that supports right-click options
        let photoTile = await driver.wait(
            until.elementLocated(By.xpath("//div[contains(@title, 'Right-click for options')]")),
            10000
        );

        // Trigger the website's custom React context menu
        let result = await driver.executeScript(`
            const tile = arguments[0];

            tile.scrollIntoView({
                behavior: "instant",
                block: "center",
                inline: "center"
            });

            const rect = tile.getBoundingClientRect();

            const event = new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 2,
                buttons: 2,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            });

            tile.dispatchEvent(event);

            return document.body.innerText;
        `, photoTile);

        await driver.sleep(1000);

        // Check if the menu appeared
        let menuItem = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(., 'View Full Image') or contains(., 'Make Display Photo') or contains(., 'Already Display Photo') or contains(., 'Delete Image')]")),
            10000
        );

        if (await menuItem.isDisplayed()) {
            console.log("🏆 TEST PASSED: Privileged photo context menu appeared.");
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: this account may not be treated as Head/Admin, or the selected hydrant has no photo options.");
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC027();
