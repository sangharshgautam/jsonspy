const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  logLevel: 'info',
};

async function main() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes in extension...');
  } else {
    await esbuild.build(buildOptions);
    console.log('Successfully built extension to dist/extension.js');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
