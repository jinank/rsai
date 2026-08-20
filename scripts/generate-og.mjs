import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const root = process.cwd();
const out = path.join(root, 'public', 'og');
fs.mkdirSync(out, { recursive: true });
const loadFont = (pkg, family, weight) => ({
  name: family,
  data: fs.readFileSync(path.join(root, 'node_modules', '@fontsource', pkg, 'files', `${pkg}-latin-${weight}-normal.woff`)),
  weight,
  style: 'normal',
});
const fonts = [loadFont('space-grotesk', 'Space Grotesk', 700), loadFont('jetbrains-mono', 'JetBrains Mono', 400)];
const apps = fs.readdirSync(path.join(root, 'data', 'apps')).filter((x) => x.endsWith('.json')).map((x) => JSON.parse(fs.readFileSync(path.join(root, 'data', 'apps', x), 'utf8')));
const colors = { yes: '#0868ff', kinda: '#6e5cff', no: '#00a889' };
const scopes = { yes: 'STARTER BUILD', kinda: 'ADVANCED BUILD', no: 'EXPERT NICHE BUILD' };
const h = (type, props, ...children) => ({ type, props: { ...props, children } });

async function render(name, eyebrow, title, accent, footer) {
  const tree = h('div', { style: { width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8f5', color: '#151713', padding: '62px 70px', border: '2px solid #dfe3db', position: 'relative', overflow: 'hidden' } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: '20px' } },
      h('div', { style: { display: 'flex', color: '#151713', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '26px' } }, 'Rethinksoft'), h('div', { style: { display: 'flex', color: '#696e65' } }, 'AI-NATIVE STARTUP FOUNDRY')),
    h('div', { style: { display: 'flex', flexDirection: 'column' } },
      h('div', { style: { display: 'flex', fontFamily: 'JetBrains Mono', color: accent, fontSize: '22px', letterSpacing: '2px', marginBottom: '22px' } }, `// ${eyebrow}`),
      h('div', { style: { display: 'flex', fontFamily: 'Space Grotesk', fontSize: title.length > 22 ? '86px' : '108px', fontWeight: 700, letterSpacing: '-6px', lineHeight: .9, maxWidth: '1040px' } }, title),
      h('div', { style: { display: 'flex', marginTop: '34px', height: '8px', width: '180px', background: accent, boxShadow: `0 0 26px ${accent}` } })),
    h('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '19px', color: '#696e65' } }, h('div', { style: { display: 'flex' } }, footer), h('div', { style: { display: 'flex', color: accent } }, 'RETHINKSOFT.APP →')),
    h('div', { style: { display: 'flex', position: 'absolute', right: '-35px', top: '84px', fontFamily: 'Space Grotesk', fontSize: '430px', fontWeight: 700, color: '#e9ece5' } }, '↗'));
  const svg = await satori(tree, { width: 1200, height: 630, fonts });
  fs.writeFileSync(path.join(out, name), new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}

await render('home.png', 'PROGRESSIVE CAPITAL FOR TECHNICAL FOUNDERS', 'BUILD YOUR STARTUP. WE FUND THE PROGRESS.', '#70a51b', 'APPLY TO FOUNDRY 01');
for (const app of apps) await render(`${app.slug}.png`, `BUILD A ${app.name.toUpperCase()} STYLE PRODUCT`, scopes[app.verdict], colors[app.verdict], `${app.name.toUpperCase()} · AGENT PROMPT · OPEN SOURCE CODE`);
console.log(`Generated ${apps.length + 1} Open Graph images.`);
