// scripts/migrate-difficulty.js
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const categories = [
  'swift', 'swiftui', 'concurrency', 'architecture',
  'networking', 'testing', 'uikit', 'xcode-tools', 'interview-prep'
];

for (const cat of categories) {
  const srcDir = join(root, cat);
  const destDir = join(root, 'src', 'content', 'questions', cat);

  let files;
  try {
    files = readdirSync(srcDir).filter(f => f.endsWith('.md'));
  } catch {
    console.log(`Skipping ${cat} (folder not found)`);
    continue;
  }

  mkdirSync(destDir, { recursive: true });

  for (const file of files) {
    const srcPath = join(srcDir, file);
    const destPath = join(destDir, file);
    let content = readFileSync(srcPath, 'utf-8');

    // Add **Difficulty:** Intermediate after **Tags:** line if not already present
    content = content.replace(
      /(\*\*Tags:\*\*[^\n]+)\n(?!\*\*Difficulty:\*\*)/g,
      '$1\n**Difficulty:** Intermediate\n'
    );

    writeFileSync(destPath, content);
    console.log(`Migrated: ${cat}/${file}`);
  }
}

console.log('\nDone! Review src/content/questions/ and update difficulty levels as needed.');
