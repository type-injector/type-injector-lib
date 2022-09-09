// @ts-check
const shelljs = require('shelljs');
const uglifyjs = require('uglify-js');
const fs = require('fs');
const path = require('path');
const { rollup } = require('rollup');

const bundlesDir = path.join(__dirname, 'dist/bundles');

/** @type {Partial<import('rollup').RollupOptions>} */
const defaultOptions = {
  input: 'tmp/es/index.js',
  output: {
    name: 'typeInjector',
    exports: 'named',
  }
};

buildAll();

async function buildAll() {
  shelljs.mkdir('-p', bundlesDir);
  build(`tsconfig.build.json`);
  build(`tsconfig.es.json`);
  await Promise.all([
    buildCommonJsBundle(),
    buildEsmBundle(),
    buildIifeBundle(),
  ]);
  shelljs.exec('npm pack', { fatal: true });
}

async function buildCommonJsBundle() {
  const outFile = 'type-injector-lib.cjs';
  /** @type {import('rollup').OutputOptions} */
  const outputOptions = {
    ...defaultOptions.output,
    format: 'commonjs',
    file: path.join(bundlesDir, outFile),
  };
  await rollup(defaultOptions).then((build) => build.write(outputOptions));
  minifyBundle(outFile);
}

async function buildEsmBundle() {
  const outFile = 'type-injector-lib.mjs';
  /** @type {import('rollup').OutputOptions} */
  const outputOptions = {
    ...defaultOptions.output,
    format: 'esm',
    file: path.join(bundlesDir, outFile),
  };
  await rollup(defaultOptions).then((build) => build.write(outputOptions));
  minifyBundle(outFile);
}

async function buildIifeBundle() {
  const outFile = 'type-injector-lib.js';
  /** @type {import('rollup').OutputOptions} */
  const outputOptions = {
    ...defaultOptions.output,
    format: 'iife',
    file: path.join(bundlesDir, outFile),
  };
  await rollup(defaultOptions).then((build) => build.write(outputOptions));
  minifyBundle(outFile);
}

function build(tsconfig) {
  let cmd = 'node ./node_modules/.bin/tsc';
  if (tsconfig) cmd += ' -p ' + tsconfig;
  shelljs.exec(cmd, { fatal: true });
}

function minifyBundle(filename) {
  const code = fs.readFileSync(path.join(bundlesDir, filename), 'utf-8');
  const result = uglifyjs.minify(code, {
    compress: {
      arguments: true,
      assignments: true,
      hoist_props: true,
      passes: 3,
    }
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  const ext = path.extname(filename);
  fs.writeFileSync(path.join(bundlesDir, `${path.basename(filename, ext)}.min${ext}`), result.code);
}

