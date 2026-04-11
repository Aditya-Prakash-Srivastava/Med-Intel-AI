const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build'].includes(file)) continue;
      processDirectory(fullPath);
    } else {
      if (!fullPath.match(/\.(jsx|js|md|html|json|css)$/)) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Order is important: specific phrases first, general words last.
      
      // 1. Exact phrases
      content = content.replace(/Aegis\s+AI/g, 'MedIntel AI');
      content = content.replace(/AegisAI/g, 'MedIntelAI');
      content = content.replace(/AEGIS\s+MEDICAL\s+AI/g, 'MEDINTEL MEDICAL AI');
      content = content.replace(/Aegis\s+Health\s+AI/g, 'MedIntel Health AI');
      content = content.replace(/Aegis\s+Clinical\s+Report/g, 'MedIntel Clinical Report');
      content = content.replace(/Aegis\s+Verified\s+Archive/g, 'MedIntel Verified Archive');
      
      // 2. Specific technical keys & vars
      content = content.replace(/aegis_user_profile/g, 'medintel_user_profile');
      content = content.replace(/aegis_auth_status/g, 'medintel_auth_status');
      content = content.replace(/aegis_bp/g, 'medintel_bp');
      content = content.replace(/aegis_super_secret_key_2026/g, 'medintel_super_secret_key_2026');
      content = content.replace(/aegis_ai_uploads/g, 'medintel_ai_uploads');
      
      // 3. Fallbacks
      content = content.replace(/Aegis/g, 'MedIntel');
      content = content.replace(/aegis/g, 'medintel');
      content = content.replace(/AEGIS/g, 'MEDINTEL');

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

const targetDirs = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'backend')
];

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});

const indexHtml = path.join(__dirname, 'index.html');
if (fs.existsSync(indexHtml)) {
  let content = fs.readFileSync(indexHtml, 'utf8');
  const original = content;
  content = content.replace(/Aegis\s+AI/g, 'MedIntel AI').replace(/Aegis/g, 'MedIntel');
  if (content !== original) {
    fs.writeFileSync(indexHtml, content, 'utf8');
    console.log(`Updated: ${indexHtml}`);
  }
}

console.log("Renaming complete.");
