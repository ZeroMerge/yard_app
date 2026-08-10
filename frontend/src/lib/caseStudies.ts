export type CaseStudy = {
  slug: string;
  brand: string;
  industry: string;
  headline: string;
  summary: string;
  cover: string;
  metrics: { label: string; value: string }[];
  challenge: string;
  approach: string[];
  outcome: string;
  quote: { text: string; author: string; role: string };
  status: "published" | "coming-soon";
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "zuri-beauty",
    brand: "Zuri Beauty",
    industry: "Beauty · Lagos",
    headline: "Zuri Beauty ran a five-city launch on CreatorYard — without a single spreadsheet.",
    summary: "How a Lagos beauty brand shipped their Glow Drops campaign with 12 creators across Nigeria and Ghana in three weeks.",
    cover: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&h=900&fit=crop",
    metrics: [
      { label: "Creators", value: "12" },
      { label: "Markets", value: "5" },
      { label: "Time to first post", value: "9 days" },
      { label: "Approval revisions", value: "1.4 avg" },
    ],
    challenge: "Zuri's brand team was juggling four tools and a spreadsheet — Instagram DMs for outreach, WhatsApp for briefs, Google Docs for approvals, and email for invoices. A single campaign took the team two full weeks to coordinate before any content shipped.",
    approach: [
      "Structured brief posted with objectives, deliverables and per-post rate",
      "Shortlisted 24 creators via filters, invited 12 to apply",
      "Kickoff calls scheduled inside campaign threads",
      "Content approved inline with a single revision cycle",
      "Payouts triggered on approval — one invoice, twelve payouts",
    ],
    outcome: "The team compressed the coordination cycle from two weeks to nine days, and everyone — brand, agency, and creators — worked from the same source of truth.",
    quote: {
      text: "We replaced four tools and a spreadsheet. Our last launch ran on CreatorYard end-to-end.",
      author: "Amara O.",
      role: "Head of Brand, Zuri Beauty",
    },
    status: "published",
  },
  {
    slug: "accra-tech",
    brand: "Accra Tech",
    industry: "Fintech · Accra",
    headline: "Accra Tech onboarded 8 tech creators for a product launch.",
    summary: "Coming soon — a fintech launch case study covering creator vetting and compliance-safe messaging.",
    cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&h=900&fit=crop",
    metrics: [],
    challenge: "",
    approach: [],
    outcome: "",
    quote: { text: "", author: "", role: "" },
    status: "coming-soon",
  },
];
