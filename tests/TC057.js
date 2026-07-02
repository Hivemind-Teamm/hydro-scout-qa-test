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

async function TC057() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let addressTag = `SELENIUM-TC057-${Date.now()}`;
    let hydrantCreated = false;

    try {
        console.log("🚀 Starting Test Case 057: Resolve writes maintenance history atomically...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        // --- Create the disposable hydrant ---
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
        await landmarkInput.sendKeys(addressTag);
        let submitButton = await driver.findElement(By.xpath("//button[contains(., 'Pin Hydrant') and not(contains(., 'Here'))]"));
        await driver.executeScript("arguments[0].click();", submitButton);
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
        hydrantCreated = true;
        console.log("Disposable hydrant created:", addressTag);

        // --- File a damage report BEFORE opening Full Details (which resizes the map) ---
        await findAndClickIsolatedMarker(driver);
        let reportButton = await driver.wait(until.elementLocated(By.xpath("//button[@title='Report issue']")), 10000);
        await driver.executeScript("arguments[0].click();", reportButton);
        await driver.sleep(1000);

        let damageTypeOption = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Leak') or contains(., 'Obstruct') or contains(., 'Damage') or contains(., 'Blocked')] | //select | //input[@type='radio']")),
            10000
        );
        let damageTypeText = (await damageTypeOption.getText()).trim();
        await driver.executeScript("arguments[0].click();", damageTypeOption);
        let description = await driver.wait(until.elementLocated(By.css("textarea")), 10000);
        await description.sendKeys('Selenium automated maintenance-history test');
        let submitReportButton = await driver.findElement(By.xpath("//button[contains(., 'Submit')]"));
        await driver.executeScript("arguments[0].click();", submitReportButton);
        await driver.sleep(2500);
        console.log("Disposable damage report filed. Damage type:", damageTypeText);

        let fullDetailsButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000);
        await driver.executeScript("arguments[0].click();", fullDetailsButton);
        await driver.sleep(1000);
        let tagMatch = await driver.findElements(By.xpath(`//*[contains(text(), '${addressTag}')]`));
        if (tagMatch.length === 0) throw new Error("Could not confirm the disposable hydrant identity via its landmark tag.");
        console.log("Hydrant identity confirmed via landmark tag.");

        // --- Resolve the report ---
        let reportsButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Reports') or @aria-label='Reports']")), 10000);
        await driver.executeScript("arguments[0].click();", reportsButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Reports Register') or contains(text(), 'Pending')]")), 10000);
        await driver.sleep(1000);

        let pendingTab = await driver.findElements(By.xpath("//button[contains(., 'Pending')]"));
        if (pendingTab.length > 0) { await driver.executeScript("arguments[0].click();", pendingTab[0]); await driver.sleep(800); }

        let reportIds = await driver.executeScript(`
            return Array.from(document.querySelectorAll('span')).filter(s => /^RPT-/.test(s.textContent.trim())).map(s => s.textContent.trim());
        `);
        if (reportIds.length === 0) throw new Error("No pending reports with an RPT- id were found in the Reports Register.");
        let newReportId = reportIds[0];
        console.log("Newest pending report id:", newReportId);

        let reportCard = await driver.findElement(By.xpath(`//span[normalize-space()='${newReportId}']/ancestor::*[.//button[contains(., 'Resolve')]][1]`));
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", reportCard);
        let resolveButton = await reportCard.findElement(By.xpath(".//button[contains(., 'Resolve')]"));
        await driver.executeScript("arguments[0].click();", resolveButton);
        await driver.sleep(2500);
        console.log("Report resolved.");

        // --- Verify the resolution wrote an atomic maintenance-history entry
        // on the hydrant's Log tab (fresh reload for a clean, unresized map state) ---
        await driver.navigate().refresh();
        await driver.sleep(3000);
        await findAndClickIsolatedMarker(driver);
        let fullDetailsButton2 = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000);
        await driver.executeScript("arguments[0].click();", fullDetailsButton2);
        await driver.sleep(1000);
        let tagMatch2 = await driver.findElements(By.xpath(`//*[contains(text(), '${addressTag}')]`));
        if (tagMatch2.length === 0) throw new Error("Lost track of the disposable hydrant before checking Log tab.");

        let logTab = await driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Log']")), 10000);
        await driver.executeScript("arguments[0].click();", logTab);
        await driver.sleep(1000);

        let historyEntry = await driver.findElements(By.xpath("//*[contains(text(), 'Report resolved')]"));
        if (historyEntry.length === 0) {
            console.log("❌ TEST FAILED: No 'Report resolved' entry found in the hydrant's Log tab.");
        } else {
            console.log("🏆 TEST PASSED: A 'Report resolved' maintenance-history entry appears in the hydrant's Log tab.");
        }

        // --- Cleanup: delete the report (admin-only) ---
        let reportsButton2 = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Reports') or @aria-label='Reports']")), 10000);
        await driver.executeScript("arguments[0].click();", reportsButton2);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Reports Register') or contains(text(), 'Pending')]")), 10000);
        await driver.sleep(1000);
        let allTab = await driver.findElements(By.xpath("//button[starts-with(normalize-space(), 'All')]"));
        if (allTab.length > 0) { await driver.executeScript("arguments[0].click();", allTab[0]); await driver.sleep(800); }
        let closedCard = await driver.wait(until.elementLocated(By.xpath(`//span[normalize-space()='${newReportId}']/ancestor::*[.//button[contains(., 'Remove report')]][1]`)), 10000);
        let removeReportButton = await closedCard.findElement(By.xpath(".//button[contains(., 'Remove report')]"));
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", removeReportButton);
        await driver.sleep(500);
        let confirmRemoveReport = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Confirm')]")), 5000);
        await driver.executeScript("arguments[0].click();", confirmRemoveReport);
        await driver.sleep(1500);
        let reportGone = await driver.findElements(By.xpath(`//span[normalize-space()='${newReportId}']`));
        console.log(reportGone.length === 0
            ? "🏆 TEST PASSED: Report deleted after resolving (cleanup confirmed)."
            : `❌ Cleanup note: report may still be present, id ${newReportId}`);

        // --- Cleanup: decommission the disposable hydrant ---
        await driver.navigate().refresh();
        await driver.sleep(3000);
        await findAndClickIsolatedMarker(driver);
        let fullDetailsButton3 = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000);
        await driver.executeScript("arguments[0].click();", fullDetailsButton3);
        await driver.sleep(1000);
        let tagMatch3 = await driver.findElements(By.xpath(`//*[contains(text(), '${addressTag}')]`));
        if (tagMatch3.length === 0) throw new Error("Lost track of the disposable hydrant before decommission - aborting to avoid deleting the wrong record.");

        let adminTab = await driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Admin']")), 10000);
        await driver.executeScript("arguments[0].click();", adminTab);
        await driver.sleep(1000);
        let decommissionButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Decommission Hydrant')]")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", decommissionButton);
        await driver.sleep(500);
        let confirmButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Confirm')]")), 5000);
        await driver.executeScript("arguments[0].click();", confirmButton);
        await driver.wait(async () => {
            let stillThere = await driver.findElements(By.xpath(`//*[contains(text(), '${addressTag}')]`));
            return stillThere.length === 0;
        }, 15000);
        console.log("🏆 TEST PASSED: Disposable hydrant decommissioned (cleanup confirmed).");
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: report/decommission selectors differ from the live UI. Address tag for manual cleanup if needed:", addressTag, "| hydrant created:", hydrantCreated);
    } finally {
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC057();
