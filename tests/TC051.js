const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Zoom in tightly on the default map center - the exact spot this CSV row is
// pinned to - so its marker is isolated from any nearby hydrants, then click
// the marker's own bounding-box center (markers use anchor="bottom").
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
    if (unique.length === 0) throw new Error("No hydrant marker found near the import spot after zooming in.");

    let m = unique[0];
    let tx = m.x + m.w / 2, ty = m.y + m.h / 2;
    await driver.executeScript(`
        document.elementFromPoint(${tx}, ${ty})?.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window, clientX:${tx}, clientY:${ty}}));
    `);
    await driver.sleep(1200);
}

async function TC051() {
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--window-size=1366,900');
    options.addArguments('--no-sandbox');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let landmarkTag = `SELENIUM-CSV-DISPOSABLE-${Date.now()}`;
    // Same lat/lng the map's default center click always resolves to - keeps
    // this test's hydrant isolated and easy to re-find after commit.
    let csvPath = path.join(os.tmpdir(), `selenium-import-${Date.now()}.csv`);
    fs.writeFileSync(
        csvPath,
        `address,lat,lng,status,landmark,concessionaire,type,mounting,outlets,color,waterCleanliness,hazard,note\n` +
        `Selenium CSV Import Test Address,14.653010,121.068000,operational,${landmarkTag},MWSS,Pillar,Above Ground,2,Red,Clear,,Selenium automated CSV import test\n`
    );

    try {
        console.log("🚀 Starting Test Case 051: Commit valid CSV rows...");
        await driver.get('https://hivemind-hydro-scout.vercel.app/login');
        await driver.wait(until.elementLocated(By.css("input[type='email']")), 10000).sendKeys('karl.manangan@ciit.edu.ph');
        await driver.findElement(By.css("input[type='password']")).sendKeys('1234567');
        await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
        await driver.wait(until.urlMatches(/^(?!.*\/login).*$/), 15000);
        await driver.sleep(2500);

        let adminButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Admin Dashboard')]")), 10000);
        await driver.executeScript("arguments[0].click();", adminButton);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'System Administration')]")), 10000);
        await driver.sleep(1500);

        let fileInput = await driver.wait(until.elementLocated(By.css("input[type='file']")), 10000);
        await fileInput.sendKeys(csvPath);
        await driver.sleep(2000);

        let commitButton = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Commit') and contains(., 'valid hydrant')]")),
            10000
        );
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", commitButton);

        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Committed')]")), 15000);
        let commitMsg = await driver.findElement(By.xpath("//*[contains(text(), 'Committed')]")).getText();
        console.log("Commit result:", commitMsg);
        if (!/Committed 1 hydrant/i.test(commitMsg)) {
            throw new Error("Unexpected commit result: " + commitMsg);
        }

        // Go back to the map and find the newly committed hydrant by its landmark tag.
        let mapButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Map')]")), 10000);
        await driver.executeScript("arguments[0].click();", mapButton);
        await driver.sleep(2000);

        await selectIsolatedMarkerNearCenter(driver);

        let fullDetailsButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Open full details')]")), 10000);
        await driver.executeScript("arguments[0].click();", fullDetailsButton);
        await driver.sleep(1000);

        let landmarkMatch = await driver.findElements(By.xpath(`//*[contains(text(), '${landmarkTag}')]`));
        if (landmarkMatch.length === 0) {
            throw new Error("Could not confirm the CSV-imported hydrant (landmark tag not found). It may still exist as an orphan tagged " + landmarkTag);
        }
        console.log("🏆 TEST PASSED (import): CSV row committed and the new hydrant was confirmed via its unique landmark tag.");

        // Cleanup: decommission (permanently delete) this disposable hydrant.
        let adminTab = await driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Admin']")), 10000);
        await driver.executeScript("arguments[0].click();", adminTab);
        await driver.sleep(1000);

        let decommissionButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Decommission Hydrant')]")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", decommissionButton);
        await driver.sleep(500);

        let confirmButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Confirm')]")), 5000);
        await driver.executeScript("arguments[0].click();", confirmButton);

        await driver.wait(async () => {
            let stillThere = await driver.findElements(By.xpath(`//*[contains(text(), '${landmarkTag}')]`));
            return stillThere.length === 0;
        }, 15000);

        await driver.navigate().refresh();
        await driver.sleep(3000);
        let panelGone = await driver.findElements(By.xpath(`//*[contains(text(), '${landmarkTag}')]`));
        if (panelGone.length === 0) {
            console.log("🏆 TEST PASSED: CSV-imported disposable hydrant was verified and fully decommissioned (cleanup confirmed after reload).");
        } else {
            console.log("❌ TEST FAILED (cleanup): Decommission did not remove the disposable hydrant - manual cleanup needed for tag", landmarkTag);
        }
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        console.log("Possible reason: Bulk Import or Decommission selectors differ from the live UI. If a disposable hydrant was created, it may need manual cleanup. Landmark tag:", landmarkTag);
    } finally {
        try { fs.unlinkSync(csvPath); } catch (e) {}
        await driver.sleep(3000);
        await driver.quit();
    }
}

TC051();
