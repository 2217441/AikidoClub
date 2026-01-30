import { defineCollection, z } from 'astro:content';

const news = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.string(),
        pinned: z.boolean().default(false),
        ctaText: z.string().optional(),
        ctaLink: z.string().optional(),
    }),
});

const activities = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
        link: z.string().optional(),
        featured: z.boolean().default(false),
    }),
});

const pastActivities = defineCollection({
    type: 'content',
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
    type: 'data',
    schema: z.object({
        title: z.string(),
        image: z.string(),
        alt: z.string(),
        tenure: z.string(),
        order: z.number(),
    }),
});

const faq = defineCollection({
    type: 'content',
    schema: z.object({
        question: z.string(),
        order: z.number(),
        defaultOpen: z.boolean().default(false),
    }),
});

const testimonials = defineCollection({
    type: 'content',
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
