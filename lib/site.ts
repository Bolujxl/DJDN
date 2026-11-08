/**
 * Business contact details, in one place so the footer, customer care page and
 * any future email templates always agree. Change them here.
 */
export const SITE = {
  email: "djdn.afr@gmail.com",
  /** Digits only, with country code and no plus: the form wa.me links want. */
  whatsappDigits: "2348188865730",
  whatsappDisplay: "+234 818 886 5730",
  /** WhatsApp is answered round the clock. */
  hours: "24 hours, every day",
  instagram: "https://instagram.com/djdn.ng",
  instagramHandle: "@djdn.ng",
  tiktok: "https://www.tiktok.com/@djdn.ng",
} as const;

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsappDigits}`;
export const EMAIL_URL = `mailto:${SITE.email}`;
