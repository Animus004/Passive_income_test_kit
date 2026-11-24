const fs = require('fs');

async function check() {
  const res = await fetch('https://api.github.com/repos/Animus004/Passive_income_test_kit/actions/runs?per_page=20', {
    headers: { 'User-Agent': 'NodeJS' }
  });
  const data = await res.json();
  console.log('GitHub Actions Runs:');
  for (const r of data.workflow_runs || []) {
    console.log(`Run #${r.run_number} | ID: ${r.id} | Event: ${r.event} | Created: ${r.created_at} | Conclusion: ${r.conclusion}`);
  }
}

check().catch(console.error);
