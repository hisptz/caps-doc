import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import { getTabs } from './src/tabs';
import { tabSidebar } from './src/sidebar';

// Astro marks propagated MDX assets with a directive Rolldown does not know.
// Nothing in Astro reads that string back; head data is tied to the module id.
function stripUnusedHeadDirective() {
	return {
		name: 'caps-strip-head-inject-directive',
		enforce: 'post',
		transform(code, id) {
			if (!id.includes('astroPropagatedAssets') || !code.includes('"use astro:head-inject"')) return;
			return code.replace(/^\s*"use astro:head-inject";\s*/m, '');
		},
	};
}

// Markdown links are written from the site root (`/development-guide/...`).
// The header and sidebar add `/caps-doc` themselves; these links do not.
function prefixBaseLinks(base) {
	const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
	return {
		name: 'caps-base-links',
		element: {
			filter: ['a'],
			visit(node, ctx) {
				const href = node.properties?.href;
				if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return;
				if (!prefix || href === prefix || href.startsWith(`${prefix}/`)) return;
				ctx.setProperty(node, 'href', prefix + href);
			},
		},
	};
}

function baseLinks() {
	return {
		name: 'caps-base-links',
		hooks: {
			'astro:config:setup'({ config }) {
				const processor = config.markdown?.processor;
				if (processor?.name !== 'satteri' || !config.base || config.base === '/') return;
				processor.options.hastPlugins.push(prefixBaseLinks(config.base));
			},
		},
	};
}

// https://astro.build/config
export default defineConfig({
	// Hosted on GitHub Pages: https://hisptz.github.io/caps-doc/
	site: 'https://hisptz.github.io',
	base: '/caps-doc',
	// Starlight's /404 route and the docs entry 404.md both render that path.
	// The dedicated route wins. Ignore that one known overlap.
	prerenderConflictBehavior: 'ignore',
	vite: {
		plugins: [stripUnusedHeadDirective()],
		build: {
			// Mermaid is loaded only on pages with diagrams, and the library itself is ~650 kB.
			chunkSizeWarningLimit: 800,
		},
	},
	integrations: [
		mermaid({theme: 'forest', autoTheme: true }),
		starlight({
			title: 'CAPS',
			logo: { src: './src/assets/caps-icon.png' },
			favicon: '/favicon.png',
			customCss: ['./src/styles/custom.css'],
			routeMiddleware: './src/routeData.ts',
			components: {
				Header: './src/components/Header.astro',
				Hero: './src/components/Hero.astro',
				SocialIcons: './src/components/SocialIcons.astro',
				Footer: './src/components/Footer.astro',
			},
			description: 'Documentation for CAPS — Climate Automation & Prediction Scheduler.',
			social: [
				{ icon: 'github', label: 'caps-engine', href: 'https://github.com/hisptz/caps-engine' },
				{ icon: 'github', label: 'caps-app', href: 'https://github.com/hisptz/caps-app' },
			],
			sidebar: getTabs().map(tabSidebar),
		}),
		baseLinks(),
	],
});
