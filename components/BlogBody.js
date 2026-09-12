import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";

const components = {
  types: {
    image: ({ value }) => {
      const imageUrl = urlForImage(value)?.width(1000).fit("max").auto("format").url();
      if (!imageUrl) return null;

      return (
        <figure className="blog-inline-image">
          <img src={imageUrl} alt={value.alt || "Blog illustration"} loading="lazy" />
        </figure>
      );
    }
  }
};

export default function BlogBody({ value }) {
  return <PortableText value={value} components={components} />;
}
