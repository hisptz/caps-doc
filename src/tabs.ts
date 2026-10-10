export const tabs = [
	{ id: 'home', label: 'Home', directory: '' },
	{ id: 'user', label: 'User Guide', directory: 'user-guide' },
	{ id: 'deployment', label: 'Deployment Guide', directory: 'deployment-guide' },
	{ id: 'development', label: 'Development Guide', directory: 'development-guide' },
] as const;

export type Tab = (typeof tabs)[number];

/** Link to a tab's landing page, without the site base. */
export function tabHref(tab: Tab): string {
	return tab.directory ? `/${tab.directory}/` : '/';
}

/** Sidebar group for a tab: Home holds the landing page, other tabs list their folder. */
export function tabSidebar(tab: Tab) {
	return tab.directory
		? { label: tab.label, items: [{ autogenerate: { directory: tab.directory } }] }
		: { label: tab.label, items: ['index'] };
}

/** Which tab a path (without the site base) belongs to. */
export function activeTab(path: string): string {
	const folder = path.replace(/^\/+/, '').split('/')[0];
	return tabs.find((tab) => tab.directory && tab.directory === folder)?.id ?? 'home';
}
