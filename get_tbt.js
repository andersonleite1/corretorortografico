const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./lighthouse-tbt-verificacao.json', 'utf8'));

// 1. TBT
const tbtAudit = data.audits['total-blocking-time'];
console.log("=== TBT SUMMARY ===");
console.log("Total Blocking Time:", tbtAudit?.displayValue, "(", tbtAudit?.numericValue, "ms )");

// 2. Long Tasks
const longTasksAudit = data.audits['long-tasks'];
console.log("\n=== LONG TASKS ===");
if (longTasksAudit?.details?.items) {
    const items = longTasksAudit.details.items;
    items.sort((a, b) => b.duration - a.duration);
    // Get top 10
    items.slice(0, 10).forEach((item, index) => {
        console.log(`${index + 1}. Duration: ${item.duration.toFixed(2)}ms, URL: ${item.url}`);
    });
} else {
    console.log("No long tasks found.");
}

// 3. Bootup Time (JavaScript Execution Time)
const bootupAudit = data.audits['bootup-time'];
console.log("\n=== JS EXECUTION TIME ===");
if (bootupAudit?.details?.items) {
    const items = bootupAudit.details.items;
    items.sort((a, b) => b.total - a.total);
    items.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. Total: ${item.total.toFixed(2)}ms, Script Eval: ${item.scripting.toFixed(2)}ms, URL: ${item.url}`);
    });
}

// 4. Third-party usage
const thirdPartyAudit = data.audits['third-party-summary'];
console.log("\n=== THIRD PARTY SUMMARY ===");
if (thirdPartyAudit?.details?.items) {
    thirdPartyAudit.details.items.forEach(item => {
        console.log(`- ${item.entity.text}: Blocking Time -> ${item.blockingTime.toFixed(2)}ms, Transfer Size -> ${(item.transferSize / 1024).toFixed(2)}KB`);
    });
}
