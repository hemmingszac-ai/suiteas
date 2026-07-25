export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  glyph: string;
  color: string;
  keywords: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "fernote",
    name: "Fernote",
    category: "Note-taking",
    description: "Fast, searchable notes that sync across every device.",
    glyph: "📝",
    color: "#2f8f5b",
    keywords: ["notes", "notebook", "write", "remember", "docs", "wiki"],
  },
  {
    id: "orbit",
    name: "Orbit",
    category: "Productivity",
    description: "Project and sprint planning that stays out of your way.",
    glyph: "⚛️",
    color: "#1d3f6e",
    keywords: ["tasks", "projects", "planning", "sprints", "organize", "team"],
  },
  {
    id: "nova",
    name: "Nova",
    category: "Productivity",
    description: "An AI assistant that drafts your first pass.",
    glyph: "✨",
    color: "#3730a3",
    keywords: ["ai", "assistant", "draft", "write", "summarize"],
  },
  {
    id: "volt",
    name: "Volt",
    category: "Automation",
    description: "No-code automations between your other tools.",
    glyph: "⚡",
    color: "#d9622b",
    keywords: ["automation", "workflow", "integrate", "connect", "zap"],
  },
  {
    id: "pulse",
    name: "Pulse",
    category: "Analytics",
    description: "Real-time product analytics and funnels.",
    glyph: "💓",
    color: "#0f9b8e",
    keywords: ["analytics", "metrics", "data", "funnels", "tracking", "dashboard"],
  },
  {
    id: "mandala",
    name: "Mandala",
    category: "Automation",
    description: "Visual workflow builder for ops teams.",
    glyph: "🔗",
    color: "#111827",
    keywords: ["workflow", "ops", "automation", "builder", "process"],
  },
  {
    id: "quill",
    name: "Quill",
    category: "Writing",
    description: "Long-form writing and publishing, distraction-free.",
    glyph: "🪶",
    color: "#5b21b6",
    keywords: ["writing", "blog", "publish", "content", "editor"],
  },
  {
    id: "ascend",
    name: "Ascend",
    category: "Analytics",
    description: "Revenue forecasting for early-stage teams.",
    glyph: "▲",
    color: "#0b0d12",
    keywords: ["forecasting", "revenue", "finance", "growth", "projections"],
  },
  {
    id: "hex",
    name: "Hex",
    category: "Dev tools",
    description: "Deploy and host your app in one click.",
    glyph: "⬡",
    color: "#0369a1",
    keywords: ["hosting", "deploy", "server", "infrastructure", "dev", "code"],
  },
  {
    id: "flare",
    name: "Flare",
    category: "Marketing",
    description: "Email marketing that doesn't feel like marketing.",
    glyph: "📣",
    color: "#db2777",
    keywords: ["email", "marketing", "newsletter", "campaigns", "audience"],
  },
  {
    id: "ember",
    name: "Ember",
    category: "Sales",
    description: "A CRM built for small sales teams.",
    glyph: "🔥",
    color: "#c81e1e",
    keywords: ["crm", "sales", "leads", "customers", "pipeline", "deals"],
  },
  {
    id: "halo",
    name: "Halo",
    category: "Security",
    description: "Single sign-on and access control, done simply.",
    glyph: "🔒",
    color: "#6d28d9",
    keywords: ["security", "login", "auth", "sso", "access", "permissions"],
  },
  {
    id: "loop",
    name: "Loop",
    category: "Support",
    description: "Shared inbox and helpdesk for support teams.",
    glyph: "♾️",
    color: "#ca8a04",
    keywords: ["support", "helpdesk", "tickets", "inbox", "customers"],
  },
  {
    id: "beacon",
    name: "Beacon",
    category: "Communication",
    description: "Transactional email and notifications that just work.",
    glyph: "📨",
    color: "#0284c7",
    keywords: ["email", "notifications", "transactional", "alerts", "messages"],
  },
  {
    id: "ledger",
    name: "Ledger",
    category: "Finance",
    description: "Bookkeeping and invoices for small teams.",
    glyph: "💳",
    color: "#475569",
    keywords: ["finance", "invoices", "bookkeeping", "accounting", "money", "billing"],
  },
];

const STOPWORDS = new Set([
  "a", "an", "the", "i", "need", "want", "to", "do", "for", "my", "our", "your",
  "and", "or", "of", "in", "on", "with", "that", "this", "it", "is", "are", "be",
  "get", "can", "help", "me", "please", "some", "something",
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function score(product: Product, terms: string[]): number {
  const haystackWords = tokenize(
    [product.name, product.category, product.description, ...product.keywords].join(" "),
  );
  return terms.reduce((total, term) => {
    const hit = haystackWords.some((w) => {
      if (w === term) return true;
      const shorter = w.length < term.length ? w : term;
      const longer = w.length < term.length ? term : w;
      return shorter.length >= 4 && longer.startsWith(shorter);
    });
    return hit ? total + 1 : total;
  }, 0);
}

/**
 * Simple keyword-overlap search over the catalog. Not a real AI call by
 * design: this is a demo directory, and a heuristic scorer matches "what you
 * want to achieve" well enough without an LLM dependency. Falls back to the
 * full catalog when nothing scores, so the page never dead-ends on "no
 * results."
 */
export function searchProducts(query: string): Product[] {
  const terms = tokenize(query).filter((t) => t.length > 2 && !STOPWORDS.has(t));

  if (terms.length === 0) return PRODUCTS;

  const scored = PRODUCTS.map((product) => ({ product, s: score(product, terms) }));
  const anyMatches = scored.some((entry) => entry.s > 0);

  return scored
    .filter((entry) => !anyMatches || entry.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((entry) => entry.product);
}
