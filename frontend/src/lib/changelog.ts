export type ChangelogEntry = {
  date: string;
  version: string;
  tag: "feature" | "improvement" | "fix" | "security";
  title: string;
  body: string;
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-07-14",
    version: "0.9.0",
    tag: "feature",
    title: "Public creator directory",
    body: "Brands can now browse the vetted creator pool without an account. Approved creators appear at /creators with niche, country and audience filters.",
  },
  {
    date: "2026-07-12",
    version: "0.8.4",
    tag: "security",
    title: "Auth hardening",
    body: "Email verification is now required before account activation. Role assignment is server-clamped — users can only sign up as brand or creator. New signups are moderated before appearing publicly.",
  },
  {
    date: "2026-07-11",
    version: "0.8.0",
    tag: "improvement",
    title: "Redesigned landing experience",
    body: "New hero, editorial typography, and a cleaner information hierarchy. Reduced motion is now respected across ambient effects.",
  },
  {
    date: "2026-07-08",
    version: "0.7.2",
    tag: "feature",
    title: "Founders console",
    body: "Internal admin surface for reviewing new signups, approving creators, and monitoring campaign activity.",
  },
  {
    date: "2026-07-01",
    version: "0.7.0",
    tag: "feature",
    title: "Campaign messaging & kickoff calls",
    body: "Threaded messaging scoped per campaign, with Google Meet link generation for kickoff calls.",
  },
];
