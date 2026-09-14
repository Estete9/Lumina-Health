const fs = require('fs');
const path = './next_steps.json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Add to completed_features
data.completed_features.push({
    sprint: "Sprint 17 Polish 2",
    title: "Enforce Quick-Add Scheduling",
    scope: "Refactored the custom date picker button to utilize the HTMLInputElement.showPicker() API via a React ref to guarantee consistent native behavior. Enforced scheduling by disabling the form submit button and displaying a native tooltip if the date is empty.",
    completed_at: new Date().toISOString().split('T')[0],
    layman_summary: "Your Quick-Add is now fully bulletproof! Clicking the calendar button will reliably open the date picker every time, and the system will actively prevent you from adding a patient until you've selected their first session date, showing a helpful tooltip if you forget."
});

fs.writeFileSync(path, JSON.stringify(data, null, 4));
console.log('Updated next_steps.json successfully.');
