import { defineArrayMember, defineField, defineType } from "sanity";

const sites = [
  { title: "Satta King Gali Disawar", value: "https://www.sattakinggalidisawar.com/" },
  { title: "Satta Online Result", value: "https://www.sattaonlineresult.com/" },
  { title: "Live Satta King", value: "https://www.live-sattaking.com/" }
];

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "site",
      title: "Target Site",
      type: "string",
      description: "This post will appear only on the selected website.",
      options: { list: sites, layout: "dropdown" },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(120)
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "string",
      validation: (rule) => rule.required().max(70).warning("Keep SEO titles near 60 characters.")
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(170).warning("Keep SEO descriptions near 160 characters.")
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          validation: (rule) => rule.required()
        })
      ],
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "content",
      title: "Blog Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" }
          ]
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alternative Text", type: "string" }]
        })
      ],
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required()
    })
  ],
  preview: {
    select: { title: "title", site: "site", media: "coverImage" },
    prepare({ title, site, media }) {
      return { title, subtitle: sites.find((item) => item.value === site)?.title || site, media };
    }
  }
});
