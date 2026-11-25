import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('PWA Manifest & Service Worker Integrity', () => {
  const rootDir = process.cwd();
  const manifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');
  const swPath = path.join(rootDir, 'public', 'sw.js');

  it('has a valid webmanifest file with required PWA standalone fields', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toContain('Haswakarya');
    expect(manifest.short_name).toBe('Haswakarya');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#06122A');
    expect(manifest.background_color).toBe('#06122A');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it('ensures all icon assets referenced in manifest exist on disk', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    for (const icon of manifest.icons) {
      const cleanSrc = icon.src.replace(/^\//, '');
      const iconDiskPath = path.join(rootDir, 'public', cleanSrc);
      expect(fs.existsSync(iconDiskPath), `Icon file missing: ${icon.src}`).toBe(true);
    }
  });

  it('has a valid service worker with correct static precache asset list', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain('addEventListener(\'install\'');
    expect(swContent).toContain('addEventListener(\'fetch\'');

    // Extract PRECACHE_ASSETS urls
    const match = swContent.match(/PRECACHE_ASSETS\s*=\s*\[([\s\S]*?)\];/);
    expect(match).not.toBeNull();
    if (match) {
      const urls = match[1]
        .split('\n')
        .map((line) => line.replace(/['",]/g, '').trim())
        .filter((line) => line.length > 0 && line.startsWith('/'));

      expect(urls.length).toBeGreaterThanOrEqual(5);

      for (const url of urls) {
        const cleanUrl = url.replace(/^\//, '');
        const assetDiskPath = path.join(rootDir, 'public', cleanUrl);
        expect(fs.existsSync(assetDiskPath), `Precache asset missing on disk: ${url}`).toBe(true);
      }
    }
  });
});
