export const tabs = [
	{
		id: 'home', label: 'Home', href: '/',
		pages: [{ slug: 'index', label: 'Welcome to CAPS' }],
	},
	{
		id: 'user', label: 'User Guide', href: '/user-guide/',
		pages: [
			{ slug: 'user-guide', label: 'About this guide' },
		],
	},
	{
		id: 'deployment', label: 'Deployment Guide', href: '/deployment-guide/',
		pages: [
			{ slug: 'deployment-guide', label: 'Set up CAPS' },
		],
	},
	{
		id: 'development', label: 'Development Guide', href: '/development-guide/',
		pages: [
			{ slug: 'development-guide', label: 'Start developing' },
		],
	},
] as const;

/** Which tab a path (without the site base) belongs to. */
export function activeTab(path: string): string {
	const slug = path.replace(/^\/+|\/+$/g, '') || 'index';
	return tabs.find((tab) => tab.pages.some((page) => page.slug === slug))?.id ?? 'home';
}
