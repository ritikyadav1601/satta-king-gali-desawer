import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { CURRENT_SITE, POSTS_QUERY } from "@/sanity/lib/queries";

// Latest blog posts (from Sanity) shown at the bottom of the home page.
export default async function HomeBlogSection({ limit = 6 }) {
  const allPosts = await sanityFetch({
    query: POSTS_QUERY,
    params: { site: CURRENT_SITE },
    fallback: []
  });
  const posts = (allPosts || []).slice(0, limit);

  if (!posts.length) return null;

  return (
    <section className="blog-container">
      <header className="blog-page-header">
        <h2>Latest Blog Posts</h2>
      </header>

      <div className="blog-grid">
        {posts.map((post) => {
          const coverUrl = urlForImage(post.coverImage)
            ?.width(720)
            .height(405)
            .fit("crop")
            .auto("format")
            .url();

          return (
            <article className="blog-card" key={post._id}>
              {coverUrl && (
                <Link href={`/blog/${post.slug}`} tabIndex={-1}>
                  <img
                    className="blog-card-image"
                    src={coverUrl}
                    alt={post.coverImage?.alt || post.title}
                    loading="lazy"
                  />
                </Link>
              )}
              <div className="blog-card-content">
                <p className="blog-date">
                  {post.publishedAt
                    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(post.publishedAt))
                    : ""}
                </p>
                <h3>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                {post.metaDescription && <p>{post.metaDescription}</p>}
                <Link className="blog-read-more" href={`/blog/${post.slug}`}>
                  Read article →
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <p style={{ textAlign: "center", marginTop: "16px" }}>
        <Link className="blog-read-more" href="/blog">
          View all blog posts →
        </Link>
      </p>
    </section>
  );
}
