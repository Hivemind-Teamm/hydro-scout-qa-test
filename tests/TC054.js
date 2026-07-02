const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

function chromeOptions() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');
    return options;
}

async function clickMapCenter(driver) {
    let mapCanvas = await driver.wait(until.elementLocated(By.css('.mapboxgl-canvas, canvas')), 10000);
    await driver.executeScript(`
        const canvas = arguments[0];
        const rect = canvas.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        for (const type of ['mousedown', 'mouseup', 'click']) {
            canvas.dispatchEvent(new MouseEvent(type, {
                bubbles: true, cancelable: true, view: window,
                clientX: x, clientY: y, button: 0, buttons: type === 'mousedown' ? 1 : 0
            }));
        }
    `, mapCanvas);
}

async function findAndClickIsolatedMarker(driver) {
    let zoomInBtn = await driver.wait(until.elementLocated(By.css("button[aria-label='Zoom in']")), 10000);
    for (let i = 0; i < 8; i++) {
        await driver.executeScript("arguments[0].click();", zoomInBtn);
        await driver.sleep(350);
    }
    await driver.sleep(1500);

    let mapCanvas = await driver.findElement(By.css('.mapboxgl-canvas, canvas'));
    let rect = await mapCanvas.getRect();
    let cx = rect.x + rect.width / 2, cy = rect.y + rect.height / 2;

    let markers = await driver.executeScript(`
        return Array.from(document.querySelectorAll("img")).filter(img =>
            (img.src && img.src.includes('Hydrant')) || (img.alt && img.alt.toLowerCase().includes('hydrant'))
        ).map((img) => {
            const r = img.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: r.height };
        }).filter(m => m.x > -50 && m.x < ${1366 + 50} && m.y > -50 && m.y < ${900 + 50});
    `);
    let seen = new Set();
    let unique = [];
    for (let m of markers) {
        let key = `${Math.round(m.x)},${Math.round(m.y)}`;
        if (!seen.has(key)) { seen.add(key); unique.push(m); }
    }
    unique.sort((a, b) => {
        let da = Math.hypot((a.x + a.w / 2) - cx, (a.y + a.h / 2) - cy);
        let db = Math.hypot((b.x + b.w / 2) - cx, (b.y + b.h / 2) - cy);
        return da - db;
    });
    if (unique.length === 0) throw new Error("No hydrant marker found near the pinned spot after zooming in.");

    let m = unique[0];
    let tx = m.x + m.w / 2, ty = m.y + m.h / 2;
    await driver.executeScript(`
        document.elementFromPoint(${tx}, ${ty})?.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window, clientX:${tx}, clientY:${ty}}));
    `);
    await driver.sleep(1200);
}

async function login(driver) {
    await driver.get('https://hivemind-hydro-scout.vercel.app/login');
    await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
    await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
    await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
    await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
    await driver.sleep(2500);
}

async function TC054() {
    let driverA = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions()).build();
    let driverB = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions()).build();

    let addressTag = `SELENIUM-TC054-${Date.now()}`;
    let uniqueNote = `SELENIUM-LIVE-UPDATE-${Date.now()}`;
    let hydrantCreated = false;

    try {
        console.log("🚀 Starting Test Case 054: Live updates across sessions...");

        await login(driverA);

        // --- Session A creates the disposable hydrant ---
        let pinButton = await driverA.wait(until.elementLocated(By.css("button[aria-label='Pin new hydrant']")), 10000);
        await driverA.executeScript("arguments[0].click();", pinButton);
        await driverA.sleep(1000);
        await clickMapCenter(driverA);
        await driverA.sleep(1500);
        let pinHereButton = await driverA.wait(until.elementLocated(By.xpath("//button[contains(., 'Pin Hydrant Here')]")), 10000);
        await driverA.executeScript("arguments[0].click();", pinHereButton);
        await driverA.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Pinning Guidelines')]")), 10000);
        await driverA.sleep(1000);
        let landmarkInput = await driverA.findElement(By.xpath("//input[contains(@placeholder, 'ADMU Gate')]"));
        await landmarkInput.sendKeys(addressTag);
        let submitButton = await driverA.findElement(By.xpath("//button[contains(., 'Pin Hydrant') and not(contains(., 'Here'))]"));
        await driverA.executeScript("arguments[0].click();", submitButton);
        await driverA.wait(async () => {
            let stillOpen = await driverA.findElements(By.xpath("//*[contains(text(), 'Pinning Guidelines')]"));
            return stillOpen.length === 0;
        }, 20000);
        await driverA.sleep(1500);
        let exitAddMode = await driverA.findElements(By.css("button[aria-label='Exit Add Hydrant mode']"));
        if (exitAddMode.length > 0) {
            await driverA.executeScript("arguments[0].click();", exitAddMode[0]);
            await driverA.sleep(500);
        }
        hydrantCreated = true;
        console.log("Disposable hydrant created:", addressTag);

        // --- Session B logs in and selects the same hydrant, opens Details tab ---
        await login(driverB);
        await findAndClickIsolatedMarker(driverB);
        let fullDetailsB = await driverB.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000);
        await driverB.executeScript("arguments[0].click();", fullDetailsB);
        await driverB.sleep(1000);
        let tagMatchB = await driverB.findElements(By.xpath(`//*[contains(text(), '${addressTag}')]`));
        if (tagMatchB.length === 0) throw new Error("Session B could not confirm the disposable hydrant (landmark tag not found).");
        let detailsTabB = await driverB.wait(until.elementLocated(By.xpath("//button[normalize-space()='Details']")), 10000);
        await driverB.executeScript("arguments[0].click();", detailsTabB);
        await driverB.sleep(1000);
        console.log("Session B has the disposable hydrant's Details tab open.");

        // --- Session A re-selects the hydrant and submits an edit with a unique note ---
        await findAndClickIsolatedMarker(driverA);
        let editButton = await driverA.wait(until.elementLocated(By.css("button[title='Edit hydrant']")), 10000);
        await driverA.executeScript("arguments[0].click();", editButton);
        await driverA.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Operational Status')]")), 10000);
        let noteField = await driverA.findElement(By.css("textarea[placeholder='Describe the current condition...']"));
        await noteField.sendKeys(uniqueNote);
        await driverA.findElement(By.xpath("//button[contains(., 'Submit')]")).click();
        await driverA.sleep(2500);
        console.log("Session A submitted a status update with a unique note.");

        // --- Session B should see it live, without ever calling refresh() ---
        await driverB.wait(async () => {
            let bodyText = await driverB.findElement(By.css('body')).getText();
            return bodyText.includes(uniqueNote);
        }, 20000);
        console.log("🏆 TEST PASSED: Session B received the live update without a manual refresh.");

        // --- Cleanup: decommission the disposable hydrant (session A, fresh reload first) ---
        await driverA.navigate().refresh();
        await driverA.sleep(3000);
        await findAndClickIsolatedMarker(driverA);
        let fullDetailsA2 = await driverA.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000);
        await driverA.executeScript("arguments[0].click();", fullDetailsA2);
        await driverA.sleep(1000);
        let tagMatchA2 = await driverA.findElements(By.xpath(`//*[contains(text(), '${addressTag}')]`));
        if (tagMatchA2.length === 0) throw new Error("Lost track of the disposable hydrant before decommission - aborting to avoid deleting the wrong record.");

        let adminTab = await driverA.wait(until.elementLocated(By.xpath("//button[normalize-space()='Admin']")), 10000);
        await driverA.executeScript("arguments[0].click();", adminTab);
        await driverA.sleep(1000);
        let decommissionButton = await driverA.wait(until.elementLocated(By.xpath("//button[contains(., 'Decommission Hydrant')]")), 10000);
        await driverA.executeScript("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", decommissionButton);
        await driverA.sleep(500);
        let confirmButton = await driverA.wait(until.elementLocated(By.xpath("//button[contains(., 'Confirm')]")), 5000);
        await driverA.executeScript("arguments[0].click();", confirmButton);
        await driverA.wait(async () => {
            let stillThere = await driverA.findElements(By.xpath(`//*[contains(text(), '${addressTag}')]`));
            return stillThere.length === 0;
        }, 15000);
        console.log("🏆 TEST PASSED: Disposable hydrant decommissioned (cleanup confirmed).");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: selectors differ from the live UI, or the two sessions selected different hydrants. Address tag for manual cleanup if needed:", addressTag, "| hydrant created:", hydrantCreated);
    } finally {
        await driverA.sleep(1500);
        await driverA.quit();
        await driverB.quit();
    }
}

TC054();
