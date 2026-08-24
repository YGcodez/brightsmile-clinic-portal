import dentist1 from "@/assets/dentist-1.jpg";
import dentist2 from "@/assets/dentist-2.jpg";
import dentist3 from "@/assets/dentist-3.jpg";

export const CLINIC = {
  name: "Bright Smile Dental",
  tagline: "Private dentistry with a gentle touch",
  phone: "+44 20 7946 0812",
  email: "hello@brightsmiledental.example",
  address: {
    line1: "42 Marlowe Street",
    line2: "Kensington",
    city: "London",
    postcode: "W8 4QP",
  },
  hours: [
    { day: "Monday – Thursday", time: "8:00 – 19:00" },
    { day: "Friday", time: "8:00 – 17:00" },
    { day: "Saturday", time: "9:00 – 14:00" },
    { day: "Sunday", time: "Closed (emergency line open)" },
  ],
} as const;

export const SERVICES = [
  {
    name: "General Check-ups",
    description:
      "Thorough six-monthly examinations, digital X-rays and hygienist care to keep problems small.",
    icon: "stethoscope",
  },
  {
    name: "Teeth Whitening",
    description:
      "Enamel-safe in-practice and take-home whitening, shade-matched to look natural.",
    icon: "sparkles",
  },
  {
    name: "Dental Implants",
    description:
      "Permanent titanium implants with custom ceramic crowns, planned with 3D imaging.",
    icon: "anchor",
  },
  {
    name: "Root Canal Therapy",
    description:
      "Comfortable endodontic treatment under magnification to save a tooth rather than lose it.",
    icon: "shield",
  },
  {
    name: "Orthodontics / Invisalign",
    description:
      "Clear aligners and discreet braces for adults and teens, with digital smile previews.",
    icon: "align",
  },
  {
    name: "Emergency Dentistry",
    description:
      "Same-day appointments for pain, swelling, broken teeth or lost restorations.",
    icon: "siren",
  },
] as const;

export const SERVICE_NAMES = SERVICES.map((s) => s.name);

export const TIME_SLOTS = ["Morning", "Afternoon", "Evening"] as const;

export const APPOINTMENT_STATUSES = [
  "requested",
  "confirmed",
  "reminded",
  "completed",
  "no_show",
  "cancelled",
] as const;

export const TEAM = [
  {
    name: "Dr. Eleanor Hartley",
    role: "Principal Dentist, BDS MFDS RCS",
    specialty: "Restorative & implant dentistry",
    bio: "Eleanor founded Bright Smile in 2011 after a decade in hospital restorative care. She is known for meticulous implant work and for making nervous patients feel unhurried.",
    photo: dentist1,
  },
  {
    name: "Dr. Marcus Whitfield",
    role: "Associate Dentist, BDS MSc",
    specialty: "Endodontics & emergency care",
    bio: "Marcus leads our root canal and same-day emergency service. He works under a surgical microscope and has saved teeth other practices had written off.",
    photo: dentist2,
  },
  {
    name: "Dr. Priya Raman",
    role: "Orthodontist, BDS MOrth RCS",
    specialty: "Invisalign & adult orthodontics",
    bio: "Priya has treated over 1,400 aligner cases. She plans every smile digitally so patients can see the result before treatment begins.",
    photo: dentist3,
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "I hadn't seen a dentist in nine years because of anxiety. Dr. Hartley talked me through every step and I genuinely didn't feel a thing. I'm now back every six months.",
    author: "Rachel M.",
    treatment: "General check-up",
  },
  {
    quote:
      "Cracked a molar on a Sunday evening. They saw me at 9am Monday, and the crown was fitted the same week. Faultless from the first phone call.",
    author: "Daniel O.",
    treatment: "Emergency dentistry",
  },
  {
    quote:
      "Eighteen months of Invisalign and my teeth are exactly what the digital preview showed. Dr. Raman is precise and endlessly patient with questions.",
    author: "Sofia K.",
    treatment: "Invisalign",
  },
  {
    quote:
      "Two implants after years of a failing bridge. The planning was thorough, the surgery calm, and I can eat properly again. Worth every penny.",
    author: "Geoffrey P.",
    treatment: "Dental implants",
  },
  {
    quote:
      "Whitening that actually looks like my own teeth, not a film set. The hygienist team is lovely and the practice is spotless.",
    author: "Amara T.",
    treatment: "Teeth whitening",
  },
] as const;
