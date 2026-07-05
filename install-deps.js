const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const nodeModulesDir = path.join(__dirname, 'node_modules');

// Helper to download a file
async function downloadFile(url, dest) {
  console.log(`Downloading ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
}

// Helper to extract tarball
function extractTarball(tarPath, destDir) {
  console.log(`Extracting ${tarPath} to ${destDir}...`);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  // NPM tarballs always contain a top-level 'package' folder
  const tempExtractDir = path.join(destDir, '_temp_extract');
  if (!fs.existsSync(tempExtractDir)) {
    fs.mkdirSync(tempExtractDir, { recursive: true });
  }

  // Run Windows bsdtar
  execSync(`tar -xzf "${tarPath}" -C "${tempExtractDir}"`);

  // Move files from 'package' folder to destDir
  const packageDir = path.join(tempExtractDir, 'package');
  const files = fs.readdirSync(packageDir);
  for (const file of files) {
    const src = path.join(packageDir, file);
    const dest = path.join(destDir, file);
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    fs.renameSync(src, dest);
  }

  // Clean up temp dir
  fs.rmSync(tempExtractDir, { recursive: true, force: true });
}

async function install() {
  try {
    if (!fs.existsSync(nodeModulesDir)) {
      fs.mkdirSync(nodeModulesDir, { recursive: true });
    }

    // Install @google/generative-ai
    const genAiTar = path.join(__dirname, 'genai.tgz');
    const genAiDest = path.join(nodeModulesDir, '@google', 'generative-ai');
    await downloadFile('https://registry.npmjs.org/@google/generative-ai/-/generative-ai-0.21.0.tgz', genAiTar);
    extractTarball(genAiTar, genAiDest);
    fs.unlinkSync(genAiTar);

    // Install sql.js
    const sqlTar = path.join(__dirname, 'sqljs.tgz');
    const sqlDest = path.join(nodeModulesDir, 'sql.js');
    await downloadFile('https://registry.npmjs.org/sql.js/-/sql.js-1.11.0.tgz', sqlTar);
    extractTarball(sqlTar, sqlDest);
    fs.unlinkSync(sqlTar);

    console.log('\nDependencies successfully installed without npm!');
  } catch (err) {
    console.error('Installation failed:', err);
    process.exit(1);
  }
}

install();
