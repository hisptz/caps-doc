import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import { tabs } from './src/tabs';
import { tabSidebar } from './src/sidebar';

// https://astro.build/config
export default defineConfig({
	// Hosted on GitHub Pages: https://hisptz.github.io/caps-doc/
	site: 'https://hisptz.github.io',
	base: '/caps-doc',
	integrations: [
		mermaid({ autoTheme: true }),
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
			sidebar: tabs.map(tabSidebar),
		}),
	],
});
