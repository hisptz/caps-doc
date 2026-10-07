import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { activeTab, tabs } from './tabs';

// Show only the active tab's section in the left menu, like the section tabs in Material for MkDocs.
export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const tab = tabs.find((t) => t.id === activeTab(context.url.pathname.slice(base.length) || '/'));
	if (!tab) return;

	const group = route.sidebar.find((entry) => entry.type === 'group' && entry.label === tab.label);
	if (group) route.sidebar = [group];
});
