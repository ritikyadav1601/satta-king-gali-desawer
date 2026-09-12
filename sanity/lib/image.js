import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "./client";

const builder = imageUrlBuilder(sanityClient);

export function urlForImage(source) {
  return source ? builder.image(source) : null;
}
