import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { sidebarForPath } from './sidebar';

// Show only the active section in the left menu, rebuilt from src/content/docs
// so a new folder appears without editing the sidebar config.
export const onRequest = defineRouteMiddleware((context) => {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	context.locals.starlightRoute.sidebar = [sidebarForPath(context.url.pathname, base || '/')];
});
