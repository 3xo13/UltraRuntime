export type Service = {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  body: string;
  examples: string;
  relatedWork?: string;
};

export const services: Service[] = [
  {
    id: "automation",
    number: "01",
    shortTitle: "Automation & AI",
    title: "Automation & AI Integration",
    body: "Automate everyday work and connect AI to the tools your team already uses.",
    examples:
      "Automated customer service · Data collection · Automated outreach · Lead follow-up",
    relatedWork: "MicroFlow",
  },
  {
    id: "custom",
    number: "02",
    shortTitle: "Custom software",
    title: "Custom Software",
    body: "Software shaped around your processes, your data, and the way your business operates.",
    examples:
      "Inventory & invoicing · Internal dashboards · Custom business systems",
    relatedWork: "BatterySwap",
  },
  {
    id: "apps",
    number: "03",
    shortTitle: "Web & mobile",
    title: "Web & Mobile Applications",
    body: "Web and mobile applications designed around your users, from first screen to launch.",
    examples: "Customer portals · Booking apps · Digital platforms",
    relatedWork: "ZonPro",
  },
  {
    id: "research",
    number: "04",
    shortTitle: "Prototyping & consulting",
    title: "Prototyping, Consulting & Research",
    body: "Test your idea, explore the technical options, and find a practical path forward.",
    examples: "Technical research · Interactive prototypes · Delivery planning",
  },
  {
    id: "maintenance",
    number: "05",
    shortTitle: "Maintenance",
    title: "Software Maintenance & Updates",
    body: "Keep existing software reliable, up to date, and ready for new requirements.",
    examples:
      "Bug fixes · Performance improvements · Technology upgrades · New features",
  },
  {
    id: "support",
    number: "06",
    shortTitle: "Support",
    title: "Support for What We Build",
    body: "Get ongoing technical help from the people who built your software.",
    examples: "Troubleshooting · Usage guidance · Launch support",
  },
  {
    id: "seo",
    number: "07",
    shortTitle: "SEO",
    title: "SEO Optimization & Follow-up",
    body: "Improve how your website appears in search, then track and refine its performance.",
    examples: "Technical SEO · Page optimization · Search reports",
  },
];

export const projects = [
  {
    number: "01",
    category: "AI & automation",
    title: "MicroFlow",
    summary:
      "Turn invoices into structured, editable data—with the original file always within reach.",
    tags: ["Custom fields", "File-linked records", "Subscriptions & credits"],
    detail:
      "An invoice-extraction MVP with configurable data structures, editable results, stored source files, and Stripe billing with usage credits.",
  },
  {
    number: "02",
    category: "Custom business software",
    title: "BatterySwap",
    summary: "Inventory, invoices, and Google integrations in a business dashboard.",
    tags: ["Inventory", "Invoicing", "Google integrations"],
    detail:
      "An inventory dashboard and invoice workflows, with integrations for Google Merchant, Analytics, and Ads.",
  },
  {
    number: "03",
    category: "Web platforms & integrations",
    title: "ZonPro",
    summary: "Automated lead collection through the Meta API, built into a web platform.",
    tags: ["Meta API", "Lead collection", "Web application"],
    detail:
      "A SaaS platform connecting Meta lead collection with an online lead-sales workflow.",
  },
];

export const processSteps = [
  ["01", "Understand", "Your goals, your users, and the problem to solve."],
  ["02", "Define", "A practical scope, approach, and delivery plan."],
  ["03", "Design & build", "Working software, with regular reviews together."],
  ["04", "Launch & improve", "A supported launch and a plan for what’s next."],
];

