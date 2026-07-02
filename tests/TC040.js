const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

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

// Zoom in tightly on the pinned spot so its marker is isolated from any
// nearby hydrants, then click the marker's own bounding-box center (markers
// use anchor="bottom", so their icon renders above the raw geo-point pixel).
async function selectIsolatedMarkerNearCenter(driver) {
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

async function TC040() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let landmarkTag = `SELENIUM-DISPOSABLE-${Date.now()}`;

    try {
        console.log("🚀 Starting Test Case 040: Successful hydrant creation...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let pinButton = await driver.wait(until.elementLocated(By.css("button[aria-label='Pin new hydrant']")), 10000);
        await driver.executeScript("arguments[0].click();", pinButton);
        await driver.sleep(1000);

        await clickMapCenter(driver);
        await driver.sleep(1500);

        let pinHereButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Pin Hydrant Here')]")), 10000);
        await driver.executeScript("arguments[0].click();", pinHereButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Pinning Guidelines')]")), 10000);
        await driver.sleep(1000);

        let landmarkInput = await driver.findElement(By.xpath("//input[contains(@placeholder, 'ADMU Gate')]"));
        await landmarkInput.sendKeys(landmarkTag);

        let submitButton = await driver.findElement(By.xpath("//button[contains(., 'Pin Hydrant') and not(contains(., 'Here'))]"));
        await driver.executeScript("arguments[0].click();", submitButton);

        // createHydrant() runs inside a Firestore transaction that scans HYD-001
        // upward for a free slot - this can take a while, so poll instead of a fixed sleep.
        await driver.wait(async () => {
            let stillOpen = await driver.findElements(By.xpath("//*[contains(text(), 'Pinning Guidelines')]"));
            return stillOpen.length === 0;
        }, 20000);
        await driver.sleep(1500);

        let exitAddMode = await driver.findElements(By.css("button[aria-label='Exit Add Hydrant mode']"));
        if (exitAddMode.length > 0) {
            await driver.executeScript("arguments[0].click();", exitAddMode[0]);
            await driver.sleep(500);
        }

        await selectIsolatedMarkerNearCenter(driver);

        let fullDetailsButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000);
        await driver.executeScript("arguments[0].click();", fullDetailsButton);
        await driver.sleep(1000);

        let landmarkMatch = await driver.findElements(By.xpath(`//*[contains(text(), '${landmarkTag}')]`));
        if (landmarkMatch.length === 0) {
            throw new Error("Could not confirm the newly created hydrant (landmark tag not found) - the map click may have selected a different marker. Creation may have succeeded but is now an orphan tagged " + landmarkTag);
        }

        console.log("🏆 TEST PASSED (creation): New hydrant record was created and confirmed via its unique landmark tag.");

        // Cleanup: decommission (permanently delete) this disposable hydrant.
        let adminTab = await driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Admin']")), 10000);
        await driver.executeScript("arguments[0].click();", adminTab);
        await driver.sleep(1000);

        let decommissionButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Decommission Hydrant')]")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", decommissionButton);
        await driver.sleep(300);
        await driver.executeScript("arguments[0].click();", decommissionButton);
        await driver.sleep(500);

        let confirmButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Confirm')]")), 5000);
        await driver.executeScript("arguments[0].click();", confirmButton);

        await driver.wait(async () => {
            let stillThere = await driver.findElements(By.xpath(`//*[contains(text(), '${landmarkTag}')]`));
            return stillThere.length === 0;
        }, 15000);

        // Verify against a fresh reload, not just the in-memory view.
        await driver.navigate().refresh();
        await driver.sleep(3000);
        let panelGone = await driver.findElements(By.xpath(`//*[contains(text(), '${landmarkTag}')]`));
        if (panelGone.length === 0) {
            console.log("🏆 TEST PASSED: Disposable hydrant was created, verified, and fully decommissioned (cleanup confirmed after reload).");
        } else {
            console.log("❌ TEST FAILED (cleanup): Decommission did not remove the disposable hydrant - manual cleanup needed for tag", landmarkTag);
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Pin Hydrant / Decommission selectors differ from the live UI. If a disposable hydrant was created, it may need manual cleanup. Landmark tag:", landmarkTag);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC040();
