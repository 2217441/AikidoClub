import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Astro 6 removed the legacy collection API (`type: 'content'` / `type: 'data'`).
// Every collection now declares a loader; `glob` handles both the markdown
// collections and the YAML data ones.

const news = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        pinned: z.boolean().default(false),
        ctaText: z.string().optional(),
        ctaLink: z.string().optional(),
    }),
});

const activities = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/activities' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
        link: z.string().optional(),
        featured: z.boolean().default(false),
    }),
});

const pastActivities = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/pastActivities' }),
    schema: z.object({
        name: z.string(),
        date: z.string(),
        year: z.string(), // "23/24", "22/23"
        image: z.string(),
        file: z.string().optional(),
        order: z.number().default(0),
    }),
});

const mainboard = defineCollection({
    loader: glob({ pattern: '**/*.yaml', base: './src/content/mainboard' }),
    schema: z.object({
        title: z.string(),
        image: z.string(),
        alt: z.string(),
        tenure: z.string(),
        order: z.number(),
    }),
});

const faq = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
    schema: z.object({
        question: z.string(),
        order: z.number(),
        defaultOpen: z.boolean().default(false),
    }),
});

const testimonials = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
    schema: z.object({
        author: z.string(),
        role: z.string(),
        image: z.string().optional(),
        order: z.number().default(0),
    }),
});

export const collections = {
    news,
    activities,
    pastActivities,
    mainboard,
    faq,
    testimonials
};
