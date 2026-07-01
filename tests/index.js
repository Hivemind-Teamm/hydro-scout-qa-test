const { spawnSync } = require("child_process");
const path = require("path");

const testCases = [
    "TC001.js",
    "TC002.js",
    "TC003.js",
    "TC004.js",
    "TC005.js",
    "TC006.js",
    "TC007.js",
    "TC008.js",
    "TC009.js",
    "TC010.js",
    "TC011.js",
    "TC012.js",
    "TC013.js",
    "TC014.js",
    "TC015.js",
    "TC016.js",
    "TC017.js",
    "TC018.js",
    "TC019.js",
    "TC020.js",
    "TC021.js",
    "TC022.js",
    "TC023.js",
    "TC024.js",
    "TC025.js",
    "TC026.js",
    "TC027.js",
    "TC028.js",
    "TC029.js"
];

let passedTests = [];
let failedTests = [];

for (const testCase of testCases) {
    console.log("\n==============================");
    console.log(`Running ${testCase}`);
    console.log("==============================\n");

    const result = spawnSync("node", [path.join(__dirname, testCase)], {
        encoding: "utf-8"
    });

    const output = (result.stdout || "") + (result.stderr || "");

    console.log(output);

    if (output.includes("TEST FAILED") || result.status !== 0) {
        failedTests.push(testCase);
    } else if (output.includes("TEST PASSED")) {
        passedTests.push(testCase);
    } else {
        failedTests.push(testCase);
    }
}

console.log("\n==============================");
console.log("FINAL QA TEST SUMMARY");
console.log("==============================");

console.log(`Total test cases: ${testCases.length}`);
console.log(`Passed: ${passedTests.length}`);
console.log(`Failed: ${failedTests.length}`);

if (failedTests.length === 0) {
    console.log("\n🏆 ALL TEST CASES PASSED!");
} else {
    console.log(`\n❌ ${failedTests.length} FAILED TEST CASE(S) FOUND:`);
    failedTests.forEach(testCase => {
        console.log(`- ${testCase}`);
    });
}