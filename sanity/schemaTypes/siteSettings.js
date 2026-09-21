import { defineField, defineType } from "sanity";
import { CURRENT_SITE } from "../site";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings (Khaiwal & WhatsApp)",
  type: "document",
  fields: [
    defineField({
      name: "site",
      title: "Target Site",
      type: "string",
      initialValue: CURRENT_SITE,
      hidden: true
    }),
    defineField({
      name: "khaiwalName",
      title: "Khaiwal Name",
      type: "string",
      description: 'Shown on the homepage ad card, e.g. "KUBER BHAI".',
      validation: (rule) => rule.required().max(60)
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp Number",
      type: "string",
      description: "Digits only, with country code, no +, spaces or dashes. Example: 919876543210",
      validation: (rule) =>
        rule.required().regex(/^\d{10,15}$/, { name: "digits only", invert: false }).error("Use digits only, 10-15 digits, with country code.")
    })
  ],
  preview: {
    select: { title: "khaiwalName" }
  }
});
