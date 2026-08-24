import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Astro 6 removed the legacy collection API (`type: 'content'` / `type: 'data'`).
// Every collection now declares a loader; `glob` handles both the markdown
// collections and the YAML data ones.

const news = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
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

/**
 * Futuwwah-to-practice material. Frontmatter is a deliberate superset of
 * what Al-Mizan's ingest_wiki_concepts.py reads (name_en, name_ar,
 * transliteration, description), so these files are ingestible into
 * SurrealDB/TypeDB later with no transformation written.
 *
 * Every practice-to-virtue mapping is an interpretive act - Tier 2 in
 * Al-Mizan's model - so attribution is required, never optional.
 *
 * Intentionally absent from public/admin/config.yml: author-owned, not
 * club-editable. A CMS widget here would invite an unattributed mapping.
 */
const concepts = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/concepts' }),
    schema: z.object({
        name_en: z.string(),
        name_ar: z.string().optional(),
        transliteration: z.string().optional(),
        description: z.string(),

        practice: z.array(z.object({
            art: z.string(),
            element: z.string(),
            claim: z.string(),
        })).default([]),

        grounding: z.array(z.object({
            type: z.enum(['quran', 'hadith', 'scholar']),
            ref: z.string(),
            // 'verified' requires a canonical fetch on record. Anything else
            // blocks publication - see scripts/assert-citations.ts.
            status: z.enum(['verified', 'pending', 'unverified']),
            via: z.string().optional(),
        })).default([]),

        attribution: z.object({
            issued_by: z.string(),
            epistemic_status: z.enum(['documented', 'interpretive']),
        }),

        order: z.number().default(0),
        draft: z.boolean().default(true),
    }),
});

export const collections = {
    news,
    activities,
    pastActivities,
    mainboard,
    faq,
    testimonials,
    concepts,
};
