#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Mapping of icon names to their correct kebab-case filenames
const iconMapping = {
  'CalendarDays': 'calendar-days',
  'Heart': 'heart', 
  'Pills': 'pill',
  'Pill': 'pill',
  'Activity': 'activity',
  'Plus': 'plus',
  'Eye': 'eye',
  'Edit': 'edit',
  'Clock': 'clock',
  'Users': 'users',
  'DollarSign': 'dollar-sign',
  'AlertTriangle': 'alert-triangle',
  'TrendingUp': 'trending-up',
  'BarChart3': 'bar-chart-3',
  'FileText': 'file-text',
  'Pill': 'pill'
};

function fixImports(content) {
  // Fix lucide-svelte imports
  let modified = content.replace(
    /import\s*\{\s*([^}]+)\s*\}\s*from\s*'lucide-svelte';/g,
    (match, imports) => {
      const iconNames = imports.split(',').map(s => s.trim()).filter(Boolean);
      const fixedImports = iconNames.map(name => {
        const iconFile = iconMapping[name] || name.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase();
        return `import ${name} from 'lucide-svelte/dist/icons/${iconFile}.svelte';`;
      }).join('\n\t');
      return fixedImports;
    }
  );

  // Fix UI component imports
  modified = modified.replace(
    /import\s*\{\s*([^}]+)\s*\}\s*from\s*'\$lib\/components\/ui\/([^']+)';/g,
    (match, imports, componentPath) => {
      if (componentPath.includes(',')) {
        // Multiple components from same path
        const components = imports.split(',').map(s => s.trim());
        return components.map(comp => `import ${comp} from '$lib/components/ui/${comp.toLowerCase()}.svelte';`).join('\n\t');
      } else {
        // Single component
        return `import ${imports} from '$lib/components/ui/${componentPath}.svelte';`;
      }
    }
  );

  return modified;
}

function findSvelteFiles(dir, files = []) {
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && item !== 'node_modules') {
      findSvelteFiles(fullPath, files);
    } else if (item.endsWith('.svelte')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  const files = findSvelteFiles('src/routes/(app)/simklinik');
  
  console.log(`Processing ${files.length} files...`);
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      const modified = fixImports(content);
      
      if (content !== modified) {
        writeFileSync(file, modified);
        console.log(`Fixed imports in ${file}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
  
  console.log('Import fixing complete!');
}

main();
