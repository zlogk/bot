#!/usr/bin/env node
/**
 * webp2png.js
 * CLI tool: convert .webp -> .png (file or directory recursive)
 *
 * Usage examples:
 *  node webp2png.js --input ./images --output ./out
 *  node webp2png.js --input img.webp
 *  node webp2png.js --input ./images --output ./out --overwrite --concurrency 4
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pLimit = require('p-limit');
const argv = require('minimist')(process.argv.slice(2), {
  alias: { i: 'input', o: 'output', h: 'help', c: 'concurrency', f: 'overwrite' },
  boolean: ['help', 'overwrite'],
  default: { concurrency: 2, overwrite: false }
});

function printHelp() {
  console.log(`
webp2png - convert .webp files to .png

Usage:
  node webp2png.js --input <file|dir> [--output <dir>] [--overwrite] [--concurrency N]

Options:
  --input, -i        Input file path or directory (required)
  --output, -o       Output directory (default: same folder as input file(s))
  --overwrite, -f    Overwrite existing .png files (default: false)
  --concurrency, -c  Number of files to process in parallel (default: 2)
  --help, -h         Show this help
`);
}

if (argv.help || !argv.input) {
  printHelp();
  process.exit(argv.input ? 0 : 1);
}

const inputPath = path.resolve(argv.input);
const outputDirArg = argv.output ? path.resolve(argv.output) : null;
const overwrite = !!argv.overwrite;
const concurrency = Math.max(1, parseInt(argv.concurrency, 10) || 2);

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function collectWebpFiles(p) {
  const stat = await fs.promises.stat(p);
  let files = [];
  if (stat.isFile()) {
    if (p.toLowerCase().endsWith('.webp')) files.push(p);
    return files;
  }
  // directory: walk recursively
  const entries = await fs.promises.readdir(p, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(p, e.name);
    if (e.isDirectory()) {
      const sub = await collectWebpFiles(full);
      files = files.concat(sub);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.webp')) {
      files.push(full);
    }
  }
  return files;
}

async function convertOne(inputFile, destFile) {
  try {
    // check existing
    if (!overwrite) {
      try {
        await fs.promises.access(destFile, fs.constants.F_OK);
        console.log(`Skipping (exists): ${destFile}`);
        return { ok: true, skipped: true };
      } catch (_) { /* not exists -> proceed */ }
    }

    // ensure dest dir
    await ensureDir(path.dirname(destFile));

    // convert
    await sharp(inputFile)
      .png({ compressionLevel: 6, adaptiveFiltering: true })
      .toFile(destFile);

    console.log(`Converted: ${path.relative(process.cwd(), inputFile)} -> ${path.relative(process.cwd(), destFile)}`);
    return { ok: true, skipped: false };
  } catch (err) {
    console.error(`Error converting ${inputFile}:`, err.message);
    return { ok: false, error: err };
  }
}

(async function main() {
  try {
    // collect files
    let files = [];
    try {
      const stat = await fs.promises.stat(inputPath);
      if (stat.isFile()) {
        if (inputPath.toLowerCase().endsWith('.webp')) files = [inputPath];
        else {
          console.error('Input file is not a .webp');
          process.exit(2);
        }
      } else if (stat.isDirectory()) {
        files = await collectWebpFiles(inputPath);
      } else {
        console.error('Input is neither file nor directory');
        process.exit(2);
      }
    } catch (err) {
      console.error('Input path error:', err.message);
      process.exit(2);
    }

    if (!files.length) {
      console.log('No .webp files found to convert.');
      process.exit(0);
    }

    // prepare tasks
    const limit = pLimit(concurrency);
    const tasks = files.map(inputFile => limit(async () => {
      const relative = path.relative(inputPath, inputFile);
      // if single file input and no explicit output dir: put png beside file
      let dest;
      if (outputDirArg) {
        // preserve relative path structure if input was dir
        if ((await fs.promises.stat(inputPath)).isDirectory()) {
          dest = path.join(outputDirArg, relative);
        } else {
          dest = path.join(outputDirArg, path.basename(inputFile));
        }
        dest = dest.replace(/\.webp$/i, '.png');
      } else {
        // no output provided: convert next to original file
        dest = inputFile.replace(/\.webp$/i, '.png');
      }
      return convertOne(inputFile, dest);
    }));

    // run
    console.log(`Converting ${files.length} file(s) with concurrency=${concurrency} ...`);
    const results = await Promise.all(tasks);

    const okCount = results.filter(r => r.ok && !r.skipped).length;
    const skipCount = results.filter(r => r.skipped).length;
    const errCount = results.filter(r => !r.ok).length;

    console.log('--- Done ---');
    console.log(`Converted: ${okCount}`);
    console.log(`Skipped:   ${skipCount}`);
    console.log(`Errors:    ${errCount}`);

    if (errCount > 0) process.exit(3);
    process.exit(0);
  } catch (e) {
    console.error('Fatal error:', e);
    process.exit(1);
  }
})();
