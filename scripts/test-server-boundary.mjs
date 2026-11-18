import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const srcDir = path.join(process.cwd(), 'src');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function toRel(fullPath) {
  return path.relative(srcDir, fullPath).replace(/\\/g, '/');
}

function mustHaveServerOnly(relPath) {
  return (
    relPath.endsWith('.server.ts') ||
    relPath.startsWith('features/') ||
    relPath === 'lib/supabase/server.ts' ||
    relPath === 'lib/supabase/proxy.ts' ||
    relPath === 'lib/supabase/service-role.server.ts'
  );
}

async function run() {
  const files = await walk(srcDir);
  let checkedServerFiles = 0;

  for (const fullPath of files) {
    const relPath = toRel(fullPath);
    const content = await fs.readFile(fullPath, 'utf8');
    const firstNonEmptyLine = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith('//'));

    if (mustHaveServerOnly(relPath)) {
      checkedServerFiles += 1;
      assert.ok(
        firstNonEmptyLine === "import 'server-only';" ||
          firstNonEmptyLine === 'import "server-only";',
        `Server-only module "${relPath}" must have "import 'server-only';" as its first statement.`,
      );
    }

    if (/(?:^|\/)index\.tsx?$/.test(relPath)) {
      assert.ok(
        !content.includes('.server'),
        `Barrel file "${relPath}" must not reference *.server modules.`,
      );
      assert.ok(
        !content.includes('features/'),
        `Barrel file "${relPath}" must not re-export from features/.`,
      );
    }

    if (
      relPath !== 'config/environment.server.ts' &&
      (content.includes('SUPABASE_SECRET_KEY') ||
        content.includes('PLAYER_TOKEN_PEPPER'))
    ) {
      assert.fail(
        `Server secret env var referenced outside src/config/environment.server.ts in "${relPath}".`,
      );
    }
  }

  console.log(
    `Server boundary check passed (${checkedServerFiles} server-only modules verified across ${files.length} files).`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
