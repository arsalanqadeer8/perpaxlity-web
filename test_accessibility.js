const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

console.log('--- RUNNING ACCESSIBILITY TESTS ---');

// Let's find all occurrences of <button ... class="pw-toggle" ...> or similar pattern
const regex = /<button[^>]*class="[^"]*pw-toggle[^"]*"[^>]*>/gi;
let match;
let count = 0;
let errors = 0;

while ((match = regex.exec(html)) !== null) {
  count++;
  const tag = match[0];
  console.log(`Checking password toggle button ${count}: ${tag}`);

  // Check for aria-label
  if (!/aria-label=/i.test(tag)) {
    console.error(`❌ Error: Button is missing 'aria-label' attribute.`);
    errors++;
  } else {
    console.log(`✅ Has aria-label`);
  }

  // Check for aria-pressed
  if (!/aria-pressed=/i.test(tag)) {
    console.error(`❌ Error: Button is missing 'aria-pressed' attribute.`);
    errors++;
  } else {
    console.log(`✅ Has aria-pressed`);
  }

  // Check for aria-controls
  if (!/aria-controls=/i.test(tag)) {
    console.error(`❌ Error: Button is missing 'aria-controls' attribute.`);
    errors++;
  } else {
    console.log(`✅ Has aria-controls`);
  }
}

// Also verify togglePassword function contains aria updates
const toggleFnRegex = /function togglePassword\([\s\S]*?setAttribute\('aria-label'/i;
if (!toggleFnRegex.test(html)) {
  console.error(`❌ Error: togglePassword function does not appear to update 'aria-label' dynamically.`);
  errors++;
} else {
  console.log(`✅ togglePassword dynamically updates 'aria-label'`);
}

const togglePressedRegex = /function togglePassword\([\s\S]*?setAttribute\('aria-pressed'/i;
if (!togglePressedRegex.test(html)) {
  console.error(`❌ Error: togglePassword function does not appear to update 'aria-pressed' dynamically.`);
  errors++;
} else {
  console.log(`✅ togglePassword dynamically updates 'aria-pressed'`);
}

if (count === 0) {
  console.error('❌ Error: No password toggle buttons found in index.html!');
  errors++;
} else {
  console.log(`Total password toggle buttons found: ${count}`);
}

if (errors > 0) {
  console.error(`❌ Tests failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('🎉 All accessibility checks passed successfully!');
  process.exit(0);
}
