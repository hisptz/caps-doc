import fs from 'node:fs';
import path from 'node:path';

// Resolved from the project root. import.meta.url points at a build chunk
// during prerender, so a relative URL would miss src/content/docs.
const docsRoot = path.join(process.cwd(), 'src/content/docs');

export type Tab = {
	id: string;
	label: string;
	directory: string;
	order: number;
};

/** "deployment-guide" → "Deployment Guide". */
export function labelFromDirectory(name: string): string {
	return name
		.split('-')
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function indexPath(dirPath: string): string | undefined {
	return ['index.mdx', 'index.md']
		.map((name) => path.join(dirPath, name))
		.find((file) => fs.existsSync(file));
}

function sectionOrder(indexFile: string): number {
	const raw = fs.readFileSync(indexFile, 'utf8');
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const order = match?.[1].match(/^\s+order:\s*(-?\d+)\s*$/m)?.[1];
	return order === undefined ? Number.MAX_SAFE_INTEGER : Number(order);
}

/**
 * Header tabs and sidebar sections, one per folder under `src/content/docs/`
 * that has an index page. A new folder appears on the next request.
 * `sidebar.order` on that index places the section. Home stays first.
 */
export function getTabs(): Tab[] {
	const sections = fs
		.readdirSync(docsRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
		.flatMap((entry) => {
			const index = indexPath(path.join(docsRoot, entry.name));
			if (!index) return [];
			return [
				{
					id: entry.name,
					label: labelFromDirectory(entry.name),
					directory: entry.name,
					order: sectionOrder(index),
				},
			];
		})
		.sort((a, b) => a.order - b.order || a.directory.localeCompare(b.directory));

	return [{ id: 'home', label: 'Home', directory: '', order: Number.NEGATIVE_INFINITY }, ...sections];
}

/** Link to a tab's landing page, without the site base. */
export function tabHref(tab: Tab): string {
	return tab.directory ? `/${tab.directory}/` : '/';
}

/** Which tab a path (without the site base) belongs to. */
export function activeTab(path: string): string {
	const folder = path.replace(/^\/+/, '').split('/')[0];
	return getTabs().find((tab) => tab.directory && tab.directory === folder)?.id ?? 'home';
}
