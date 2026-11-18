const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(filePath, overrides = {}) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  const code = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;

  const sandbox = {
    exports: {},
    module: { exports: {} },
    console,
    process,
    require(name) {
      if (name in overrides) return overrides[name];
      if (name.startsWith('@/')) {
        const subPath = `src/${name.slice(2)}.ts`;
        const tsxPath = `src/${name.slice(2)}.tsx`;
        if (fs.existsSync(path.resolve(__dirname, '..', subPath))) {
          return loadModule(subPath, overrides);
        }
        if (fs.existsSync(path.resolve(__dirname, '..', tsxPath))) {
          return loadModule(tsxPath, overrides);
        }
      }
      return require(name);
    },
  };

  vm.runInNewContext(transpiled, sandbox);
  return sandbox.module.exports.default || sandbox.exports.default || sandbox.exports;
}

test('public/robots.txt is valid, disallows private routes, and links to sitemap', () => {
  const robotsPath = path.resolve(__dirname, '../public/robots.txt');
  assert.ok(fs.existsSync(robotsPath), 'public/robots.txt must exist');
  const content = fs.readFileSync(robotsPath, 'utf8');

  assert.match(content, /User-agent:\s*\*/i);
  assert.match(content, /Allow:\s*\//);
  assert.match(content, /Disallow:\s*\/admin/);
  assert.match(content, /Disallow:\s*\/api/);
  assert.match(content, /Disallow:\s*\/checkout\/orders/);
  assert.match(content, /Sitemap:\s*https:\/\/secondjlitch\.in\/sitemap\.xml/i);
});

test('sitemap.ts returns all core pages and product URLs, handling database gracefully', async () => {
  const mockProducts = [
    { id: 'item-1', slug: 'silk-shirt', updated_at: '2026-03-01T00:00:00Z' },
    { id: 'item-2', slug: 'wool-jacket', updated_at: null },
  ];

  const sitemapFn = loadModule('src/app/sitemap.ts', {
    '@/lib/products-db': {
      getPublicProducts: async () => mockProducts,
    },
    '@/lib/placeholder-data': {
      PLACEHOLDER_PRODUCTS: [{ id: 'fallback-1', slug: 'fallback-blouse' }],
    },
  });

  const routes = await sitemapFn();
  assert.ok(Array.isArray(routes), 'sitemap should return an array');
  const urls = routes.map((r) => r.url);

  // Check static pages
  assert.ok(urls.includes('https://secondjlitch.in'), 'Home route missing');
  assert.ok(urls.includes('https://secondjlitch.in/products'), 'Products route missing');
  assert.ok(urls.includes('https://secondjlitch.in/pre-loved'), 'Pre-loved route missing');
  assert.ok(urls.includes('https://secondjlitch.in/contact'), 'Contact route missing');
  assert.ok(urls.includes('https://secondjlitch.in/shipping'), 'Shipping route missing');
  assert.ok(urls.includes('https://secondjlitch.in/refunds'), 'Refunds route missing');
  assert.ok(urls.includes('https://secondjlitch.in/terms'), 'Terms route missing');
  assert.ok(urls.includes('https://secondjlitch.in/privacy'), 'Privacy route missing');

  // Check dynamic products
  assert.ok(urls.includes('https://secondjlitch.in/products/silk-shirt'));
  assert.ok(urls.includes('https://secondjlitch.in/products/wool-jacket'));
});

test('sitemap.ts gracefully falls back when database throws error', async () => {
  const sitemapFn = loadModule('src/app/sitemap.ts', {
    '@/lib/products-db': {
      getPublicProducts: async () => {
        throw new Error('Database offline');
      },
    },
    '@/lib/placeholder-data': {
      PLACEHOLDER_PRODUCTS: [{ id: 'prod-fallback', slug: 'fallback-item' }],
    },
  });

  const routes = await sitemapFn();
  assert.ok(Array.isArray(routes));
  const urls = routes.map((r) => r.url);
  assert.ok(urls.includes('https://secondjlitch.in/contact'));
  assert.ok(urls.includes('https://secondjlitch.in/products/fallback-item'));
});

test('contact page and footer contain support@secondjlitch.in and contact@scondjlitch.in', () => {
  const contactCode = fs.readFileSync(path.resolve(__dirname, '../src/app/contact/page.tsx'), 'utf8');
  assert.ok(contactCode.includes('support@secondjlitch.in'), 'support@secondjlitch.in missing from contact page');
  assert.ok(contactCode.includes('contact@scondjlitch.in'), 'contact@scondjlitch.in missing from contact page');
  assert.ok(contactCode.includes('mailto:support@secondjlitch.in'), 'mailto:support@secondjlitch.in missing');
  assert.ok(contactCode.includes('mailto:contact@scondjlitch.in'), 'mailto:contact@scondjlitch.in missing');

  const footerCode = fs.readFileSync(path.resolve(__dirname, '../src/components/layout/Footer.tsx'), 'utf8');
  assert.ok(footerCode.includes('support@secondjlitch.in'), 'support@secondjlitch.in missing from footer');
  assert.ok(footerCode.includes('contact@scondjlitch.in'), 'contact@scondjlitch.in missing from footer');
  assert.ok(footerCode.includes('href="/shipping"'), 'Shipping link missing in footer');
  assert.ok(footerCode.includes('href="/refunds"'), 'Refunds link missing in footer');
  assert.ok(footerCode.includes('href="/contact"'), 'Contact link missing in footer');
  assert.ok(footerCode.includes('href="/terms"'), 'Terms link missing in footer');
  assert.ok(footerCode.includes('href="/privacy"'), 'Privacy link missing in footer');
});

test('product detail page and product card integrate ProductShare', () => {
  const cardCode = fs.readFileSync(path.resolve(__dirname, '../src/components/product/ProductCard.tsx'), 'utf8');
  assert.ok(cardCode.includes('ProductShare'), 'ProductCard should import and render ProductShare');

  const singleCode = fs.readFileSync(path.resolve(__dirname, '../src/app/products/[id]/page.tsx'), 'utf8');
  assert.ok(singleCode.includes('ProductShare'), 'SingleProductPage should import and render ProductShare');

  const shareComponentCode = fs.readFileSync(path.resolve(__dirname, '../src/components/product/ProductShare.tsx'), 'utf8');
  assert.ok(shareComponentCode.includes('navigator.share'), 'ProductShare should support Web Share API');
  assert.ok(shareComponentCode.includes('navigator.clipboard'), 'ProductShare should support clipboard copy');
  assert.ok(shareComponentCode.includes('https://wa.me/?text='), 'ProductShare should support WhatsApp');
});
