const fs = require('fs');
const path = './next_steps.json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Add to completed_features
data.completed_features.push({
    sprint: "Sprint 17 Polish",
    title: "Quick-Add Date Picker UI Fixes",
    scope: "Refactored the raw datetime-local input into a styled relative button wrapper with a Calendar icon. Applied dir='rtl' to the underlying opacity-0 input to natively force Chromium/Webkit to render the popup expanding to the left, preventing edge-cropping.",
    completed_at: new Date().toISOString().split('T')[0],
    layman_summary: "We fixed the date picker clipping off the side of the screen! It's now a beautiful, clear 'Schedule Session' button, and when you click it, the calendar perfectly drops down to the left so it stays entirely on your screen."
});

fs.writeFileSync(path, JSON.stringify(data, null, 4));
console.log('Updated next_steps.json successfully.');
