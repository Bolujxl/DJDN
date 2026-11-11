/**
 * Business contact details, in one place so the footer, customer care page and
 * any future email templates always agree. Change them here.
 */
const HOURS = {
  /** Short forms for the customer care card. */
  days: "Mon – Sat",
  time: "8am – 9pm",
  /** West Africa Time, which is GMT+1 all year (Nigeria has no daylight saving). */
  zone: "WAT · GMT+1",
} as const;

export const SITE = {
  email: "djdn.afr@gmail.com",
  /** Digits only, with country code and no plus: the form wa.me links want. */
  whatsappDigits: "2348188865730",
  whatsappDisplay: "+234 818 886 5730",
  /** Opening hours, in pieces (customer care page) and as one sentence (everywhere else). */
  hoursParts: HOURS,
  hours: "Monday to Saturday, 8am to 9pm Nigeria time (GMT+1)",
  instagram: "https://instagram.com/djdn.ng",
  instagramHandle: "@djdn.ng",
  tiktok: "https://www.tiktok.com/@djdn.ng",
} as const;

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsappDigits}`;
export const EMAIL_URL = `mailto:${SITE.email}`;
