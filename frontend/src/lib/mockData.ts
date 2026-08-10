// Seeded mock data for CreatorYard. In-memory + localStorage persistence.

export type Role = "brand" | "creator" | "admin";
export type Currency = "USD" | "NGN";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  location?: string;
  company?: string;
  avatar?: string;
  createdAt: string;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface CreatorProfile {
  userId: string;
  niche: string;
  audienceSize: number;
  bio: string;
  portfolioLinks: string[];
  gallery: string[]; // image urls
  profileImage?: string;
  socials: { instagram?: string; tiktok?: string; youtube?: string; x?: string };
  location: string;
  rate: number;
  stats?: { campaignsCompleted: number; avgRating: number; totalEarned: number };
  bank?: BankInfo;
  preferredPayoutMethod?: "bank" | "wallet";
  preferredCurrency?: Currency;
}

export type CampaignStatus = "draft" | "active" | "review" | "completed" | "archived";
export interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  budget: number;
  spent: number;
  niche: string;
  deadline: string;
  status: CampaignStatus;
  currency: Currency;
  createdAt: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";
export interface Application {
  id: string;
  creatorId: string;
  campaignId: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
}

export type SubmissionStatus = "submitted" | "revision" | "approved" | "rejected";
export interface Submission {
  id: string;
  applicationId: string;
  contentUrl: string;
  caption: string;
  status: SubmissionStatus;
  createdAt: string;
}

export type PaymentStatus = "requested" | "approved" | "paid" | "failed" | "cancelled";

export const BRAND_FEE_PCT = 0.085;
export const CREATOR_FEE_PCT = 0.045;

export interface Payment {
  id: string;
  creatorId: string;
  campaignId: string;
  submissionId?: string;
  amount: number; // creator's gross requested amount (before creator fee)
  currency: Currency;
  status: PaymentStatus;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  failedAt?: string;
  failedReason?: string;
  cancelledAt?: string;
}

export type ActivityKind =
  | "campaign.created"
  | "campaign.status"
  | "application.submitted"
  | "application.approved"
  | "application.rejected"
  | "submission.uploaded"
  | "submission.approved"
  | "submission.revision"
  | "submission.rejected"
  | "payout.requested"
  | "payout.approved"
  | "payout.paid"
  | "payout.failed"
  | "payout.cancelled"
  | "meeting.scheduled"
  | "message.sent";

export interface Activity {
  id: string;
  kind: ActivityKind;
  actorId: string;
  recipients: string[];
  campaignId?: string;
  message: string;
  link?: string;
  readBy: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  campaignId: string;
  senderId: string;
  body: string;
  attachments?: { name: string; url: string }[];
  readBy: string[];
  createdAt: string;
}

export interface Meeting {
  id: string;
  campaignId: string;
  title: string;
  startsAt: string; // ISO
  durationMin: number;
  meetLink: string;
  attendees: string[];
  createdBy: string;
  createdAt: string;
}

const KEY = "creatoryard:data:v3";
const OLD_KEYS = ["creatoryard:data:v1", "creatoryard:data:v2"];

const iso = (s: string) => new Date(s).toISOString();

const seed = (): DB => {
  const users: User[] = [
    { id: "u_brand_1", role: "brand", name: "Amara Okafor", email: "amara@zuribeauty.co", company: "Zuri Beauty", location: "Lagos, NG", createdAt: "2025-01-12" },
    { id: "u_brand_2", role: "brand", name: "Kwame Mensah", email: "kwame@accratech.io", company: "Accra Tech", location: "Accra, GH", createdAt: "2025-02-04" },
    { id: "u_brand_3", role: "brand", name: "Sade Adekunle", email: "sade@lagoseats.co", company: "Lagos Eats", location: "Lagos, NG", createdAt: "2025-03-08" },
    { id: "u_brand_4", role: "brand", name: "Joseph Mwangi", email: "joseph@safariwear.co", company: "Safari Wear", location: "Nairobi, KE", createdAt: "2025-03-22" },
    { id: "u_brand_5", role: "brand", name: "Ngozi Umeh", email: "ngozi@palmfin.io", company: "Palm Finance", location: "Lagos, NG", createdAt: "2025-04-04" },
    { id: "u_admin_1", role: "admin", name: "CreatorYard Admin", email: "admin@creatoryard.app", createdAt: "2024-12-01" },
    { id: "u_c_1", role: "creator", name: "Zainab Bello", email: "zainab@creators.app", location: "Lagos, NG", createdAt: "2025-01-20" },
    { id: "u_c_2", role: "creator", name: "Thabo Nkosi", email: "thabo@creators.app", location: "Johannesburg, ZA", createdAt: "2025-01-22" },
    { id: "u_c_3", role: "creator", name: "Fatou Diallo", email: "fatou@creators.app", location: "Dakar, SN", createdAt: "2025-02-01" },
    { id: "u_c_4", role: "creator", name: "Tunde Adebayo", email: "tunde@creators.app", location: "Abuja, NG", createdAt: "2025-02-10" },
    { id: "u_c_5", role: "creator", name: "Naledi Khumalo", email: "naledi@creators.app", location: "Cape Town, ZA", createdAt: "2025-02-14" },
    { id: "u_c_6", role: "creator", name: "Chinwe Eze", email: "chinwe@creators.app", location: "Lagos, NG", createdAt: "2025-02-18" },
    { id: "u_c_7", role: "creator", name: "Kojo Asante", email: "kojo@creators.app", location: "Accra, GH", createdAt: "2025-03-01" },
    { id: "u_c_8", role: "creator", name: "Amina Yusuf", email: "amina@creators.app", location: "Kano, NG", createdAt: "2025-03-04" },
    { id: "u_c_9", role: "creator", name: "Wanjiru Kamau", email: "wanjiru@creators.app", location: "Nairobi, KE", createdAt: "2025-03-09" },
    { id: "u_c_10", role: "creator", name: "Oluwaseun Bakare", email: "seun@creators.app", location: "Ibadan, NG", createdAt: "2025-03-14" },
  ];

  const img = (seed: string, w = 600, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

  const creators: CreatorProfile[] = [
    { userId: "u_c_1", niche: "Beauty", audienceSize: 124000, bio: "Lagos-based beauty creator focused on melanin-rich skin routines.", portfolioLinks: ["https://example.com/zainab-1"], gallery: [img("zainab1"), img("zainab2"), img("zainab3")], profileImage: img("zainab-face", 200, 200), socials: { instagram: "@zainab.glow", tiktok: "@zainabglow" }, location: "Lagos, NG", rate: 850, stats: { campaignsCompleted: 14, avgRating: 4.8, totalEarned: 11200 }, bank: { bankName: "GTBank", accountNumber: "0123456789", accountHolder: "Zainab Bello" }, preferredPayoutMethod: "bank", preferredCurrency: "NGN" },
    { userId: "u_c_2", niche: "Tech", audienceSize: 58000, bio: "Reviewing African-built software & gadgets.", portfolioLinks: [], gallery: [img("thabo1"), img("thabo2")], profileImage: img("thabo-face", 200, 200), socials: { youtube: "@thabotech", x: "@thabonkosi" }, location: "Johannesburg, ZA", rate: 600, stats: { campaignsCompleted: 9, avgRating: 4.6, totalEarned: 5400 } },
    { userId: "u_c_3", niche: "Fashion", audienceSize: 210000, bio: "West-African fashion storyteller.", portfolioLinks: [], gallery: [img("fatou1"), img("fatou2"), img("fatou3"), img("fatou4")], profileImage: img("fatou-face", 200, 200), socials: { instagram: "@fatou.style" }, location: "Dakar, SN", rate: 1200, stats: { campaignsCompleted: 18, avgRating: 4.9, totalEarned: 21600 } },
    { userId: "u_c_4", niche: "Lifestyle", audienceSize: 42000, bio: "Wellness, food, slow living in Abuja.", portfolioLinks: [], gallery: [img("tunde1"), img("tunde2")], profileImage: img("tunde-face", 200, 200), socials: { instagram: "@tunde.daily" }, location: "Abuja, NG", rate: 400, stats: { campaignsCompleted: 6, avgRating: 4.5, totalEarned: 2400 } },
    { userId: "u_c_5", niche: "Travel", audienceSize: 305000, bio: "Showing Africa to Africans.", portfolioLinks: [], gallery: [img("naledi1"), img("naledi2"), img("naledi3")], profileImage: img("naledi-face", 200, 200), socials: { youtube: "@naledigoes" }, location: "Cape Town, ZA", rate: 1500, stats: { campaignsCompleted: 22, avgRating: 4.9, totalEarned: 33000 } },
    { userId: "u_c_6", niche: "Beauty", audienceSize: 18000, bio: "Skincare science micro-creator.", portfolioLinks: [], gallery: [img("chinwe1")], profileImage: img("chinwe-face", 200, 200), socials: { tiktok: "@chinwe.skin" }, location: "Lagos, NG", rate: 250, stats: { campaignsCompleted: 3, avgRating: 4.4, totalEarned: 750 } },
    { userId: "u_c_7", niche: "Food", audienceSize: 76000, bio: "Ghanaian cuisine, modern plating.", portfolioLinks: [], gallery: [img("kojo1"), img("kojo2")], profileImage: img("kojo-face", 200, 200), socials: { instagram: "@kojocooks" }, location: "Accra, GH", rate: 550, stats: { campaignsCompleted: 8, avgRating: 4.7, totalEarned: 4400 } },
    { userId: "u_c_8", niche: "Fashion", audienceSize: 95000, bio: "Northern Nigerian modest fashion.", portfolioLinks: [], gallery: [img("amina1"), img("amina2")], profileImage: img("amina-face", 200, 200), socials: { instagram: "@amina.threads" }, location: "Kano, NG", rate: 700, stats: { campaignsCompleted: 11, avgRating: 4.8, totalEarned: 7700 } },
    { userId: "u_c_9", niche: "Fitness", audienceSize: 140000, bio: "Outdoor fitness across East Africa.", portfolioLinks: [], gallery: [img("wanjiru1"), img("wanjiru2")], profileImage: img("wanjiru-face", 200, 200), socials: { youtube: "@wanjirumoves" }, location: "Nairobi, KE", rate: 900, stats: { campaignsCompleted: 12, avgRating: 4.7, totalEarned: 10800 } },
    { userId: "u_c_10", niche: "Finance", audienceSize: 33000, bio: "Personal finance for young Africans.", portfolioLinks: [], gallery: [img("seun1")], profileImage: img("seun-face", 200, 200), socials: { x: "@seunmoney" }, location: "Ibadan, NG", rate: 350, stats: { campaignsCompleted: 5, avgRating: 4.6, totalEarned: 1750 } },
  ];

  const campaigns: Campaign[] = [
    { id: "c_1", brandId: "u_brand_1", brandName: "Zuri Beauty", title: "Glow Drops launch", description: "Drive awareness for our new Vitamin C serum across Nigeria.", budget: 8000, spent: 922, niche: "Beauty", deadline: "2026-07-30", status: "active", currency: "USD", createdAt: "2026-05-01" },
    { id: "c_2", brandId: "u_brand_1", brandName: "Zuri Beauty", title: "Founders story series", description: "Long-form story content with 3 creators on our origin story.", budget: 5000, spent: 0, niche: "Beauty", deadline: "2026-08-15", status: "draft", currency: "USD", createdAt: "2026-05-20" },
    { id: "c_3", brandId: "u_brand_2", brandName: "Accra Tech", title: "Devs of Ghana review", description: "Authentic reviews of our developer toolkit.", budget: 6000, spent: 651, niche: "Tech", deadline: "2026-07-10", status: "active", currency: "USD", createdAt: "2026-04-22" },
    { id: "c_4", brandId: "u_brand_2", brandName: "Accra Tech", title: "Back to school push", description: "Lifestyle creators showing daily workflow.", budget: 4500, spent: 434, niche: "Lifestyle", deadline: "2026-06-01", status: "completed", currency: "USD", createdAt: "2026-03-12" },
    { id: "c_5", brandId: "u_brand_3", brandName: "Lagos Eats", title: "Jollof Wars campaign", description: "Food creators spotlighting our new delivery service.", budget: 3500000, spent: 0, niche: "Food", deadline: "2026-08-20", status: "active", currency: "NGN", createdAt: "2026-05-22" },
    { id: "c_6", brandId: "u_brand_4", brandName: "Safari Wear", title: "Outdoor capsule drop", description: "Fitness & travel creators showcase our new outdoor capsule.", budget: 7500, spent: 0, niche: "Travel", deadline: "2026-09-01", status: "active", currency: "USD", createdAt: "2026-05-25" },
    { id: "c_7", brandId: "u_brand_5", brandName: "Palm Finance", title: "Money habits series", description: "Finance creators teaching young Africans good money habits.", budget: 1200000, spent: 0, niche: "Finance", deadline: "2026-08-10", status: "active", currency: "NGN", createdAt: "2026-05-28" },
    { id: "c_8", brandId: "u_brand_3", brandName: "Lagos Eats", title: "Weekend bites stories", description: "Quick weekend reels with lifestyle creators.", budget: 1500, spent: 0, niche: "Lifestyle", deadline: "2026-07-22", status: "draft", currency: "USD", createdAt: "2026-06-01" },
  ];

  const applications: Application[] = [
    { id: "a_1", creatorId: "u_c_1", campaignId: "c_1", message: "Would love to feature Glow Drops in my morning routine reel.", status: "approved", createdAt: "2026-05-04" },
    { id: "a_2", creatorId: "u_c_6", campaignId: "c_1", message: "Skincare science breakdown angle.", status: "pending", createdAt: "2026-05-06" },
    { id: "a_3", creatorId: "u_c_3", campaignId: "c_1", message: "Fashion + beauty crossover.", status: "pending", createdAt: "2026-05-08" },
    { id: "a_4", creatorId: "u_c_2", campaignId: "c_3", message: "Detailed dev workflow review.", status: "approved", createdAt: "2026-04-25" },
    { id: "a_5", creatorId: "u_c_4", campaignId: "c_4", message: "Slow morning + your app.", status: "approved", createdAt: "2026-03-14" },
    { id: "a_6", creatorId: "u_c_7", campaignId: "c_5", message: "Jollof showdown — Lagos vs Accra style.", status: "pending", createdAt: "2026-05-25" },
    { id: "a_7", creatorId: "u_c_9", campaignId: "c_6", message: "Mt. Kenya weekend wearing your capsule.", status: "approved", createdAt: "2026-05-27" },
    { id: "a_8", creatorId: "u_c_10", campaignId: "c_7", message: "5 money habits for new grads.", status: "approved", createdAt: "2026-05-30" },
  ];

  const submissions: Submission[] = [
    { id: "s_1", applicationId: "a_1", contentUrl: "https://example.com/zainab-glow-drops", caption: "First impressions of Zuri Glow Drops ✨", status: "approved", createdAt: "2026-05-18" },
    { id: "s_2", applicationId: "a_4", contentUrl: "https://example.com/thabo-accra", caption: "Building with Accra Tech SDK", status: "revision", createdAt: "2026-05-01" },
    { id: "s_3", applicationId: "a_5", contentUrl: "https://example.com/tunde-school", caption: "Back to school morning flow", status: "approved", createdAt: "2026-04-01" },
    { id: "s_4", applicationId: "a_7", contentUrl: "https://example.com/wanjiru-capsule", caption: "Outdoor capsule first run", status: "submitted", createdAt: "2026-06-02" },
  ];

  const payments: Payment[] = [
    { id: "p_1", creatorId: "u_c_1", campaignId: "c_1", submissionId: "s_1", amount: 850, currency: "USD", status: "paid", createdAt: "2026-05-19", approvedAt: "2026-05-19", paidAt: "2026-05-20" },
    { id: "p_2", creatorId: "u_c_2", campaignId: "c_3", amount: 600, currency: "USD", status: "approved", createdAt: "2026-05-22", approvedAt: "2026-05-23" },
    { id: "p_3", creatorId: "u_c_4", campaignId: "c_4", submissionId: "s_3", amount: 400, currency: "USD", status: "paid", createdAt: "2026-04-01", approvedAt: "2026-04-01", paidAt: "2026-04-02" },
    { id: "p_4", creatorId: "u_c_3", campaignId: "c_1", amount: 1200, currency: "USD", status: "requested", createdAt: "2026-06-03" },
    { id: "p_5", creatorId: "u_c_8", campaignId: "c_1", amount: 700, currency: "USD", status: "failed", createdAt: "2026-05-12", approvedAt: "2026-05-13", failedAt: "2026-05-14", failedReason: "Creator bank details missing" },
  ];

  const activities: Activity[] = [
    { id: "act_1", kind: "campaign.created", actorId: "u_brand_1", recipients: ["u_brand_1"], campaignId: "c_1", message: "Created campaign \"Glow Drops launch\"", link: "/brand/campaigns/c_1", readBy: ["u_brand_1"], createdAt: iso("2026-05-01T09:00:00Z") },
    { id: "act_2", kind: "application.submitted", actorId: "u_c_1", recipients: ["u_brand_1"], campaignId: "c_1", message: "Zainab Bello applied to \"Glow Drops launch\"", link: "/brand/campaigns/c_1", readBy: [], createdAt: iso("2026-05-04T11:30:00Z") },
    { id: "act_3", kind: "application.approved", actorId: "u_brand_1", recipients: ["u_c_1"], campaignId: "c_1", message: "Your application to \"Glow Drops launch\" was approved", link: "/creator/submissions", readBy: [], createdAt: iso("2026-05-05T14:10:00Z") },
    { id: "act_4", kind: "submission.uploaded", actorId: "u_c_1", recipients: ["u_brand_1"], campaignId: "c_1", message: "Zainab Bello uploaded content for \"Glow Drops launch\"", link: "/brand/campaigns/c_1", readBy: [], createdAt: iso("2026-05-18T08:00:00Z") },
    { id: "act_5", kind: "submission.approved", actorId: "u_brand_1", recipients: ["u_c_1"], campaignId: "c_1", message: "Submission approved for \"Glow Drops launch\"", link: "/creator/submissions", readBy: [], createdAt: iso("2026-05-19T08:00:00Z") },
    { id: "act_6", kind: "payout.requested", actorId: "u_c_1", recipients: ["u_brand_1"], campaignId: "c_1", message: "Zainab Bello requested a payout of $850", link: "/brand/budget", readBy: ["u_brand_1"], createdAt: iso("2026-05-19T09:00:00Z") },
    { id: "act_7", kind: "payout.approved", actorId: "u_brand_1", recipients: ["u_c_1"], campaignId: "c_1", message: "Payout of $850 approved", link: "/creator/wallet", readBy: [], createdAt: iso("2026-05-19T10:00:00Z") },
    { id: "act_8", kind: "payout.paid", actorId: "u_brand_1", recipients: ["u_c_1"], campaignId: "c_1", message: "Payout of $850 marked paid", link: "/creator/wallet", readBy: [], createdAt: iso("2026-05-20T10:00:00Z") },
    { id: "act_9", kind: "submission.revision", actorId: "u_brand_2", recipients: ["u_c_2"], campaignId: "c_3", message: "Revision requested on your submission", link: "/creator/submissions", readBy: [], createdAt: iso("2026-05-02T10:00:00Z") },
    { id: "act_10", kind: "meeting.scheduled", actorId: "u_brand_1", recipients: ["u_c_1"], campaignId: "c_1", message: "Kickoff call scheduled for Glow Drops launch", link: "/brand/campaigns/c_1", readBy: [], createdAt: iso("2026-05-06T09:00:00Z") },
  ];

  const messages: Message[] = [
    { id: "m_1", campaignId: "c_1", senderId: "u_brand_1", body: "Hi Zainab — excited to have you on board for Glow Drops 🌟", readBy: ["u_brand_1", "u_c_1"], createdAt: iso("2026-05-05T15:00:00Z") },
    { id: "m_2", campaignId: "c_1", senderId: "u_c_1", body: "Thank you! I'll start shooting this weekend. Any must-mention features?", readBy: ["u_c_1"], createdAt: iso("2026-05-05T15:20:00Z") },
    { id: "m_3", campaignId: "c_1", senderId: "u_brand_1", body: "Please mention the 15% niacinamide + vegan formula. I'll send brand assets in our kickoff call.", readBy: ["u_brand_1"], createdAt: iso("2026-05-05T15:25:00Z") },
    { id: "m_4", campaignId: "c_3", senderId: "u_brand_2", body: "Thabo, the revision notes are in the campaign brief. Mostly trim the intro.", readBy: ["u_brand_2"], createdAt: iso("2026-05-02T11:00:00Z") },
  ];

  const meetings: Meeting[] = [
    { id: "mt_1", campaignId: "c_1", title: "Glow Drops kickoff call", startsAt: iso("2026-05-08T14:00:00Z"), durationMin: 30, meetLink: "https://meet.google.com/kxa-jqzm-pwn", attendees: ["u_brand_1", "u_c_1"], createdBy: "u_brand_1", createdAt: iso("2026-05-06T09:00:00Z") },
    { id: "mt_2", campaignId: "c_3", title: "SDK walkthrough", startsAt: iso("2026-06-15T15:30:00Z"), durationMin: 45, meetLink: "https://meet.google.com/abc-defg-hij", attendees: ["u_brand_2", "u_c_2"], createdBy: "u_brand_2", createdAt: iso("2026-05-30T10:00:00Z") },
  ];

  return { users, creators, campaigns, applications, submissions, payments, activities, messages, meetings };
};

export interface DB {
  users: User[];
  creators: CreatorProfile[];
  campaigns: Campaign[];
  applications: Application[];
  submissions: Submission[];
  payments: Payment[];
  activities: Activity[];
  messages: Message[];
  meetings: Meeting[];
}

export const loadDB = (): DB => {
  if (typeof window === "undefined") return seed();
  try {
    OLD_KEYS.forEach((k) => localStorage.removeItem(k));
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.activities) parsed.activities = [];
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.meetings) parsed.meetings = [];
    return parsed;
  } catch {
    return seed();
  }
};

export const saveDB = (db: DB) => {
  localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event("cy:db"));
};

export const resetDB = () => {
  localStorage.removeItem(KEY);
  loadDB();
  window.dispatchEvent(new Event("cy:db"));
};

export const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

// Fee helpers
export const brandFeeOf = (amount: number) => Math.round(amount * BRAND_FEE_PCT * 100) / 100;
export const creatorFeeOf = (amount: number) => Math.round(amount * CREATOR_FEE_PCT * 100) / 100;
export const brandTotalCost = (amount: number) => Math.round((amount + brandFeeOf(amount)) * 100) / 100;
export const creatorNet = (amount: number) => Math.round((amount - creatorFeeOf(amount)) * 100) / 100;
