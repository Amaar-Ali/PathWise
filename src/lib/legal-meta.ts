export const LEGAL = {
  productName: "PathWise",
  effectiveDate: "August 8, 2026",
  lastUpdated: "August 8, 2026",
  contactEmail: "amaaralisyed2011@gmail.com",
  firebaseProjectId: "path-wise0",
  legalEntityPlaceholder: "[Legal entity name — TBD]",
  registeredAddressPlaceholder: "[Registered business address — TBD]",
  governingLaw:
    "the laws applicable to the operator’s principal place of business (jurisdiction to be formally designated)",
} as const;

export const POLICY_LINKS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/acceptable-use", label: "Acceptable Use" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/billing", label: "Billing & Refunds" },
  { to: "/contact", label: "Contact" },
] as const;
