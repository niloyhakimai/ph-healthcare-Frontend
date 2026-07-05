import {
  type LucideIcon,
  Activity,
  Building2,
  Calendar,
  Clock3,
  FileText,
  HeartHandshake,
  HeartPulse,
  LayoutDashboard,
  Microscope,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

export type HomeNavLink = {
  href: string;
  label: string;
};

export type HomeSignal = {
  icon: LucideIcon;
  label: string;
};

export type HomeStat = {
  description: string;
  icon: LucideIcon;
  label: string;
  value: string;
};

export type HomeService = {
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
  eyebrow: string;
};

export type HomeJourneyStage = {
  description: string;
  icon: LucideIcon;
  steps: string[];
  title: string;
};

export type HomeAudienceCard = {
  bullets: string[];
  cta: string;
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
};

export type HomePreviewStep = {
  status: string;
  title: string;
  time: string;
};

export const homeNavLinks: HomeNavLink[] = [
  { href: "#services", label: "Services" },
  { href: "#journey", label: "Journey" },
  { href: "#teams", label: "Teams" },
  { href: "#footer", label: "Contact" },
];

export const homeHeroSignals: HomeSignal[] = [
  { icon: ShieldCheck, label: "Secure sign-in and role-based access" },
  { icon: Calendar, label: "Appointment-ready consultation flow" },
  { icon: LayoutDashboard, label: "Dedicated spaces for patients, doctors, and admins" },
];

export const homeStats: HomeStat[] = [
  {
    value: "5",
    label: "Public care entry points",
    description: "Consultation, diagnostics, medicine, health plans, and NGO support.",
    icon: Sparkles,
  },
  {
    value: "3",
    label: "Role-based dashboards",
    description: "Separate workspaces help each user focus on the tasks that matter.",
    icon: Users,
  },
  {
    value: "24/7",
    label: "Digital access",
    description: "Patients can return anytime to continue their journey without starting over.",
    icon: Clock3,
  },
  {
    value: "1",
    label: "Connected portal experience",
    description: "The homepage acts as a calm front door into the rest of the platform.",
    icon: Activity,
  },
];

export const homeServices: HomeService[] = [
  {
    eyebrow: "Live doctor discovery",
    title: "Doctor Consultation",
    description:
      "Guide visitors into specialist search, public doctor profiles, and schedule-based appointment booking.",
    href: "/consultation",
    icon: Stethoscope,
  },
  {
    eyebrow: "Diagnostic planning",
    title: "Diagnostics",
    description:
      "Create a clean public lane for imaging, tests, and investigation-related journeys that support treatment decisions.",
    href: "/diagnostics",
    icon: Microscope,
  },
  {
    eyebrow: "Medication support",
    title: "Medicine",
    description:
      "Keep medicine discovery and follow-up support in the same ecosystem as appointments and prescriptions.",
    href: "/medicine",
    icon: Pill,
  },
  {
    eyebrow: "Coverage guidance",
    title: "Health Plans",
    description:
      "Introduce benefits, packages, and financing guidance through a clear page that feels trustworthy and simple.",
    href: "/health-plans",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Community assistance",
    title: "NGO Support",
    description:
      "Highlight partnership-driven help for patients who need social support, funding access, or outreach programs.",
    href: "/ngos",
    icon: HeartHandshake,
  },
];

export const homeJourneyStages: HomeJourneyStage[] = [
  {
    title: "Discover the right care path",
    description:
      "Patients start with a clear overview, then move into the specific service that best fits their need.",
    icon: Calendar,
    steps: [
      "Browse the public service lanes with less confusion",
      "Jump into doctor consultation when medical attention is needed",
      "Continue toward diagnostics, medicine, plans, or support options",
    ],
  },
  {
    title: "Coordinate every next step",
    description:
      "Appointments, records, and follow-up actions stay close to each other so care feels continuous.",
    icon: FileText,
    steps: [
      "Move from discovery into booking without leaving the portal mindset",
      "Keep profiles and clinical details easy to revisit later",
      "Support the follow-up conversation instead of making patients restart",
    ],
  },
  {
    title: "Operate with calm visibility",
    description:
      "Doctors and administrators get purpose-built areas that reflect their responsibilities and workflows.",
    icon: LayoutDashboard,
    steps: [
      "Doctors manage schedules, appointments, and prescriptions",
      "Admins oversee people, specialties, payments, and operations",
      "Patients return to a dashboard that reflects their own care journey",
    ],
  },
];

export const homeAudienceCards: HomeAudienceCard[] = [
  {
    title: "For Patients",
    description:
      "A warm entry point that helps people search, book, and return with confidence instead of friction.",
    href: "/register",
    cta: "Create an account",
    icon: HeartPulse,
    bullets: [
      "Book appointments from published doctor schedules",
      "Track prescriptions, profile details, and follow-up actions",
      "Move through consultation and payment flows with less uncertainty",
    ],
  },
  {
    title: "For Doctors",
    description:
      "A focused operational space for publishing availability, reviewing visits, and staying organized.",
    href: "/login",
    cta: "Doctor sign in",
    icon: Stethoscope,
    bullets: [
      "Manage personal schedules and appointment queues",
      "Handle prescriptions and patient-facing care tasks from one workspace",
      "Work inside a dashboard shaped around clinical routines",
    ],
  },
  {
    title: "For Administrators",
    description:
      "A control center for the teams who keep the platform running smoothly behind the scenes.",
    href: "/login",
    cta: "Admin sign in",
    icon: Building2,
    bullets: [
      "Oversee doctors, patients, and specialties in one place",
      "Monitor schedules, appointments, reviews, prescriptions, and payments",
      "Support operational consistency across the whole portal",
    ],
  },
];

export const homePreviewSteps: HomePreviewStep[] = [
  { time: "09:00", title: "Consultation shortlist reviewed", status: "Ready" },
  { time: "10:30", title: "Appointment slot confirmed", status: "Booked" },
  { time: "12:00", title: "Diagnostic next steps shared", status: "Queued" },
  { time: "16:00", title: "Prescription follow-up prepared", status: "Next" },
];

export const homeSpecialties = [
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
  "General Care",
];

export const homeFooterExploreLinks = [
  { href: "/", label: "Home" },
  { href: "/consultation", label: "Consultation" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/medicine", label: "Medicine" },
  { href: "/health-plans", label: "Health Plans" },
  { href: "/ngos", label: "NGO Support" },
];

export const homeFooterAccessLinks = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Register" },
];
