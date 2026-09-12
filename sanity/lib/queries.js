import { defineQuery } from "next-sanity";

export const CURRENT_SITE = "https://www.sattakinggalidisawar.com/";

export const POSTS_QUERY = defineQuery(`
  *[_type == "blogPost" && site == $site && defined(slug.current)]
  | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    metaDescription,
    coverImage,
    publishedAt
  }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "blogPost" && site == $site && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    metaTitle,
    metaDescription,
    coverImage,
    content,
    publishedAt
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "blogPost" && site == $site && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }
`);
