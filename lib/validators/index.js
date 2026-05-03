import { z } from "zod";

const requiredDate = z.coerce.date();
const optionalDate = z.coerce.date().optional().nullable();
const optionalString = z.string().trim().optional().nullable();
const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  password: z.string().min(8).max(64),
  confirmPassword: z.string().min(8).max(64),
  defaultCurrencyId: z.string().trim().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.enum(["income", "expense"]),
  icon: optionalString,
  color: optionalString,
  isDefault: z.boolean().optional().default(false),
});

export const walletSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.string().trim().min(2).max(40),
  balance: z.coerce.number().min(0),
  currencyId: optionalString,
  icon: optionalString,
  color: optionalString,
  isDefault: z.boolean().optional().default(false),
});

export const transactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.coerce.number().positive(),
  originalAmount: z.coerce.number().positive().optional(),
  categoryId: optionalString,
  walletId: z.string().trim().min(1),
  note: optionalString,
  transactionDate: requiredDate,
  paymentMethod: optionalString,
  attachmentUrl: optionalString,
  currencyId: optionalString,
  exchangeRate: z.coerce.number().optional().nullable(),
  convertedAmount: z.coerce.number().optional().nullable(),
  incomeSource: optionalString,
  groupId: optionalString,
});

export const budgetSchema = z.object({
  categoryId: optionalString,
  walletId: optionalString,
  amount: z.coerce.number().positive(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  startDate: requiredDate,
  endDate: requiredDate,
  status: z.enum(["active", "exceeded", "completed"]).optional().default("active"),
});

export const savingsGoalSchema = z.object({
  title: z.string().trim().min(2).max(120),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).optional().default(0),
  deadline: optionalDate,
  status: z.enum(["active", "completed", "paused"]).optional().default("active"),
  icon: optionalString,
  color: optionalString,
  note: optionalString,
});

export const savingsContributionSchema = z.object({
  savingsGoalId: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  note: optionalString,
  contributionDate: requiredDate,
});

export const recurringSchema = z.object({
  title: z.string().trim().min(2).max(120),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive(),
  categoryId: optionalString,
  walletId: optionalString,
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: requiredDate,
  endDate: optionalDate,
  nextDueDate: requiredDate,
  autoCreate: z.boolean().optional().default(false),
  status: z.enum(["active", "paused", "completed"]).optional().default("active"),
});

export const debtSchema = z.object({
  personName: z.string().trim().min(2).max(120),
  type: z.enum(["borrowed", "lent"]),
  amount: z.coerce.number().positive(),
  paidAmount: z.coerce.number().min(0).optional().default(0),
  dueDate: optionalDate,
  status: z.enum(["unpaid", "partial", "paid"]).optional().default("unpaid"),
  note: optionalString,
});

export const debtPaymentSchema = z.object({
  debtLoanId: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  note: optionalString,
  paymentDate: requiredDate,
});

export const notificationSchema = z.object({
  title: z.string().trim().min(2).max(120),
  message: z.string().trim().min(2),
  type: z.enum(["budget", "bill", "balance", "savings", "insight", "system"]),
  isRead: z.boolean().optional().default(false),
  actionUrl: optionalString,
});

export const aiInsightSchema = z.object({
  insightType: z.string().trim().min(2).max(60),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2),
  severity: z.enum(["info", "warning", "danger", "success"]).optional().default("info"),
  generatedAt: requiredDate.optional(),
});

export const receiptSchema = z.object({
  transactionId: optionalString,
  fileUrl: z.string().trim().min(1),
  fileType: z.string().trim().min(1),
  originalName: z.string().trim().min(1),
});

export const currencySchema = z.object({
  code: z.string().trim().min(3).max(6),
  name: z.string().trim().min(2).max(60).optional().nullable(),
  symbol: z.string().trim().min(1).max(8).optional().nullable(),
  exchangeRateToUsd: z.coerce.number().positive(),
  isActive: z.boolean().optional().default(true),
});

export const groupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: optionalString,
});

export const groupInviteSchema = z.object({
  expiresInDays: z.coerce.number().int().min(1).max(30).optional().default(7),
  maxUses: z.coerce.number().int().min(1).max(500).optional().default(25),
});

export const groupJoinSchema = z.object({
  token: z.string().trim().min(12).max(255),
});

export const groupMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const settingsSchema = z.object({
  defaultCurrencyId: z.string().trim().min(1),
  language: z.string().trim().min(2).max(10),
  theme: z.enum(["light", "dark"]),
  timezone: z.string().trim().min(2).max(80),
  emailNotifications: z.boolean().optional().default(true),
  budgetAlerts: z.boolean().optional().default(true),
  billReminders: z.boolean().optional().default(true),
  lowBalanceWarnings: z.boolean().optional().default(true),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  code: z.string().trim().length(6),
  password: z.string().min(8).max(64).optional().or(z.literal("")),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  image: z.string().trim().refine((value) => value === "" || value.startsWith("/uploads/") || isValidHttpUrl(value), {
    message: "Image must be an uploaded file or a valid URL",
  }).optional().or(z.literal("")),
  defaultCurrencyId: z.string().trim().min(1),
  currentPassword: z.string().min(8).max(64).optional().or(z.literal("")),
  password: z.string().min(8).max(64).optional().or(z.literal("")),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  role: z.enum(["admin", "user"]),
  defaultCurrencyId: optionalString,
  emailVerified: z.boolean().optional().default(false),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(2).max(120),
  siteTagline: optionalString,
  siteDescription: z.string().trim().min(10).max(5000),
  seoTitle: optionalString,
  seoDescription: optionalString,
  seoKeywords: optionalString,
  logoUrl: z.string().trim().optional().nullable().refine((value) => !value || value.startsWith("/uploads/") || isValidHttpUrl(value), {
    message: "Logo must be an uploaded file or a valid URL",
  }),
  iconUrl: z.string().trim().optional().nullable().refine((value) => !value || value.startsWith("/uploads/") || isValidHttpUrl(value), {
    message: "Icon must be an uploaded file or a valid URL",
  }),
  supportEmail: z.email().optional().nullable().or(z.literal("")),
  siteUrl: z.string().trim().optional().nullable().refine((value) => !value || isValidHttpUrl(value), {
    message: "Site URL must be valid",
  }),
  smtpHost: optionalString,
  smtpPort: z.coerce.number().int().min(1).max(65535),
  smtpSecure: z.boolean().optional().default(false),
  smtpUser: optionalString,
  smtpPass: optionalString,
  smtpFrom: optionalString,
  requireEmailVerification: z.boolean().optional().default(true),
  verificationCodeExpiryMinutes: z.coerce.number().int().min(5).max(60),
});

export const siteSettingsPatchSchema = siteSettingsSchema.partial();
