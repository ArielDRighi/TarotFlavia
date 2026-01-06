const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('src/**/*.test.tsx');

testFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Pattern 1: After imageUrl, add missing fields if they're not already there
  const pattern = /(imageUrl:\s*['"][^'"]*['"],)\s*\n(\s*)(?!isReversed)/g;
  
  if (pattern.test(content)) {
    content = content.replace(pattern, (match, imageUrl, indent) => {
      return `${imageUrl}\n${indent}isReversed: false,\n${indent}meaningUpright: undefined,\n${indent}meaningReversed: undefined,\n${indent}keywords: undefined,\n${indent}description: undefined,\n${indent}`;
    });
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done!');
