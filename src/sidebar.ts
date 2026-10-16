import fs from 'node:fs';
import path from 'node:path';
import { getTabs, labelFromDirectory, type Tab } from './tabs';

/**
 * Sidebar entries follow the folders under `src/content/docs/`.
 * A directory with an index becomes a group: `sidebar.label` is the group
 * name, `title` is the first link, and `sidebar.order` sorts it among siblings.
 * The guide index itself stays the first link in its section; its order places
 * the section tab, not that link.
 * A directory with pages but no index still becomes a group, named from the folder.
 */
const docsRoot = path.join(process.cwd(), 'src/content/docs');

type Frontmatter = {
	title: string;
	label?: string;
	order: number;
};

type Ranked = {
	order: number;
	slug: string;
	isIndex: boolean;
	item: SidebarItem;
};

type SidebarItem =
	| { slug: string; label: string }
	| { label: string; items: SidebarItem[] };

export type SidebarLinkEntry = {
	type: 'link';
	label: string;
	href: string;
	isCurrent: boolean;
	badge: undefined;
	attrs: Record<string, never>;
};

export type SidebarGroupEntry = {
	type: 'group';
	label: string;
	entries: Array<SidebarLinkEntry | SidebarGroupEntry>;
	collapsed: boolean;
	badge: undefined;
};

function readFrontmatter(filePath: string): Frontmatter {
	const raw = fs.readFileSync(filePath, 'utf8');
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const block = match?.[1] ?? '';
	const title = block.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? '';
	const label = block.match(/^\s+label:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim();
	const order = Number(block.match(/^\s+order:\s*(-?\d+)\s*$/m)?.[1] ?? Number.MAX_SAFE_INTEGER);
	return { title, label, order };
}

function indexFile(dirPath: string): string | undefined {
	return ['index.mdx', 'index.md']
		.map((name) => path.join(dirPath, name))
		.find((file) => fs.existsSync(file));
}

function collect(directory: string): Ranked[] {
	const dirPath = path.join(docsRoot, directory);
	if (!fs.existsSync(dirPath)) return [];
	const ranked: Ranked[] = [];

	for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) continue;

		if (entry.isDirectory()) {
			const childDirectory = `${directory}/${entry.name}`;
			const index = indexFile(path.join(dirPath, entry.name));
			const children = collect(childDirectory)
				.filter((child) => !child.isIndex)
				.sort(byOrder);
			if (!index && children.length === 0) continue;
			const fm = index ? readFrontmatter(index) : undefined;
			ranked.push({
				order: fm?.order ?? children[0]?.order ?? Number.MAX_SAFE_INTEGER,
				slug: childDirectory,
				isIndex: false,
				item: {
					label: fm?.label || labelFromDirectory(entry.name),
					items: [
						...(fm
							? [
									{
										slug: childDirectory,
										label: fm.title || fm.label || labelFromDirectory(entry.name),
									},
								]
							: []),
						...children.map((child) => child.item),
					],
				},
			});
			continue;
		}

		if (!entry.name.endsWith('.md') && !entry.name.endsWith('.mdx')) continue;
		const base = entry.name.replace(/\.mdx?$/, '');
		const fm = readFrontmatter(path.join(dirPath, entry.name));
		const isIndex = base === 'index';
		ranked.push({
			order: fm.order,
			slug: isIndex ? directory : `${directory}/${base}`,
			isIndex,
			item: {
				slug: isIndex ? directory : `${directory}/${base}`,
				label: fm.label || fm.title || labelFromDirectory(base),
			},
		});
	}

	return ranked;
}

function byOrder(a: Ranked, b: Ranked): number {
	if (a.order !== b.order) return a.order - b.order;
	return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

function itemsForDirectory(directory: string): SidebarItem[] {
	const entries = collect(directory);
	const index = entries.filter((entry) => entry.isIndex);
	const rest = entries.filter((entry) => !entry.isIndex).sort(byOrder);
	return [...index, ...rest].map((entry) => entry.item);
}

function homeItem(): SidebarItem {
	const index = indexFile(docsRoot);
	const fm = index ? readFrontmatter(index) : undefined;
	return { slug: 'index', label: fm?.label || fm?.title || 'Home' };
}

/** Sidebar group for a tab, in Starlight's config shape. */
export function tabSidebar(tab: Tab) {
	if (!tab.directory) return { label: tab.label, items: ['index'] };
	return { label: tab.label, items: itemsForDirectory(tab.directory) };
}

function pageHref(slug: string, base: string): string {
	const root = base.endsWith('/') ? base : `${base}/`;
	if (slug === '' || slug === 'index') return root;
	return `${root}${slug}/`;
}

function samePath(pathname: string, href: string): boolean {
	const normalize = (value: string) => (value.endsWith('/') ? value : `${value}/`);
	return normalize(pathname) === normalize(href);
}

function toEntry(item: SidebarItem, pathname: string, base: string): SidebarLinkEntry | SidebarGroupEntry {
	if ('items' in item) {
		return {
			type: 'group',
			label: item.label,
			collapsed: false,
			badge: undefined,
			entries: item.items.map((child) => toEntry(child, pathname, base)),
		};
	}
	const href = pageHref(item.slug, base);
	return {
		type: 'link',
		label: item.label,
		href,
		isCurrent: samePath(pathname, href),
		badge: undefined,
		attrs: {},
	};
}

/** The side menu for one section, read from disk so a new folder shows up on refresh. */
export function sidebarGroupForTab(tab: Tab, pathname: string, base: string): SidebarGroupEntry {
	const items = tab.directory ? itemsForDirectory(tab.directory) : [homeItem()];
	return {
		type: 'group',
		label: tab.label,
		collapsed: false,
		badge: undefined,
		entries: items.map((item) => toEntry(item, pathname, base)),
	};
}

/** Active section for a URL path that may include the site base. */
export function sidebarForPath(pathname: string, base: string): SidebarGroupEntry {
	const root = base.endsWith('/') ? base.slice(0, -1) : base;
	const bare = pathname.startsWith(root) ? pathname.slice(root.length) : pathname;
	const folder = bare.replace(/^\/+/, '').split('/')[0];
	const tab = getTabs().find((item) => item.directory && item.directory === folder) ?? getTabs()[0];
	return sidebarGroupForTab(tab, pathname, base);
}
