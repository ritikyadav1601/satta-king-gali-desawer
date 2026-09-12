# Sanity blog setup

1. Create or select a Sanity project at [sanity.io/manage](https://sanity.io/manage).
2. Copy `.env.example` to `.env.local` and set the real project ID and dataset.
3. In the Sanity project settings, add these CORS origins with credentials enabled:
   - `http://localhost:3000`
   - `https://www.sattakinggalidisawar.com`
4. Restart the application and open `/studio` to sign in and create a Blog Post.
5. Select the target website before publishing. This frontend queries only posts assigned to
   `https://www.sattakinggalidisawar.com/`.

The site dropdown is defined in `sanity/schemaTypes/blogPost.js`. Add the remaining site names and
canonical URLs to the `sites` array when they are available. Each site frontend must query using its own
canonical URL so content cannot leak between sites.
