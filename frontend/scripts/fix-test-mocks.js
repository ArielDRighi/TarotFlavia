const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  path.join(__dirname, '../src/components/features/dashboard/UserDashboard.test.tsx'),
  path.join(__dirname, '../src/components/features/dashboard/WelcomeHeader.test.tsx'),
];

files.forEach((file) => {
  console.log(`Processing ${path.basename(file)}...`);
  let content = fs.readFileSync(file, 'utf8');
  let changes = 0;

  // Fix AuthUser mocks: Add dailyReadingsCount and dailyReadingsLimit after plan
  // Match pattern: plan: 'XXX',\n};
  const authUserRegex =
    /(const mockUser: AuthUser = \{[\s\S]*?plan: '(free|premium|anonymous)',)\n(\s+)\};/g;
  content = content.replace(authUserRegex, (match, before, plan, indent) => {
    // Check if dailyReadingsCount already exists
    if (before.includes('dailyReadingsCount')) {
      return match;
    }
    const limits = { free: 2, premium: 3, anonymous: 1 };
    const count = plan === 'free' ? 1 : plan === 'premium' ? 2 : 0;
    changes++;
    return `${before}\n${indent}dailyReadingsCount: ${count},\n${indent}dailyReadingsLimit: ${limits[plan]},\n${indent}};`;
  });

  // Fix useUserPlanFeatures mocks: Add dailyReadingsLimit before });
  // More flexible regex to catch different spacing and formatting
  const planFeaturesRegex =
    /(mockReturnValue\(\{[\s\S]*?plan: '(free|premium|anonymous)',[\s\S]*?isAnonymous: (?:true|false),)\n(\s+)\}\);/g;
  content = content.replace(planFeaturesRegex, (match, before, plan, indent) => {
    // Check if dailyReadingsLimit already exists
    if (before.includes('dailyReadingsLimit')) {
      return match;
    }
    const limits = { free: 2, premium: 3, anonymous: 1 };
    changes++;
    return `${before}\n${indent}dailyReadingsLimit: ${limits[plan]},\n${indent}});`;
  });

  if (changes > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed ${changes} issues in ${path.basename(file)}`);
  } else {
    console.log(`✔️  No changes needed in ${path.basename(file)}`);
  }
});

console.log('\n✨ Done!');
