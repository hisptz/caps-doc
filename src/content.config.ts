import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	// Starlight asks for this collection on every build. An empty English file
	// means we keep the default UI strings.
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
