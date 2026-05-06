import { getSiteSettings } from "./site-settings.js";
import { prisma } from "./prisma.js";
import { formatDate, toNumber } from "./utils.js";

function maskValue(value, visible = 4) {
  if (!value) return "-";
  const text = String(value);
  if (text.length <= visible) return text;
  return `${"*".repeat(Math.max(4, text.length - visible))}${text.slice(-visible)}`;
}

function buildBlock(title, count, columns, rows, emptyMessage) {
  return {
    title,
    count,
    columns,
    rows,
    emptyMessage,
  };
}

function currencyAmount(value, code = "USD") {
  return `${code} ${toNumber(value).toFixed(2)}`;
}

export const ADMIN_SECTION_DEFINITIONS = {
  integrity: {
    title: "Integrity Watch",
    description: "Quick signals for incomplete or cleanup-worthy data across the database.",
  },
  access: {
    title: "Identity & Access",
    description: "Users, sign-in providers, sessions, verification tokens, and personal preferences.",
  },
  finance: {
    title: "Finance Core",
    description: "Wallets, categories, budgets, transactions, recurring flows, goals, debt tracking, and currencies.",
  },
  collaboration: {
    title: "Collaboration & Content",
    description: "Shared groups, messages, uploads, notifications, exports, and AI-generated records.",
  },
  platform: {
    title: "Platform Settings",
    description: "Read-only platform configuration snapshots and mail/verification state from the database.",
  },
};

export async function getAdminSectionData(section) {
  switch (section) {
    case "integrity": {
      const [usersPendingVerification, uncategorizedTransactions, receiptsWithoutTransactions, walletsWithoutCurrency] = await Promise.all([
        prisma.user.count({ where: { emailVerified: null } }),
        prisma.transaction.count({ where: { categoryId: null } }),
        prisma.receipt.count({ where: { transactionId: null } }),
        prisma.wallet.count({ where: { currencyId: null } }),
      ]);

      return {
        id: section,
        ...ADMIN_SECTION_DEFINITIONS[section],
        highlights: [
          { label: "Pending Users", value: usersPendingVerification, hint: "Email verification outstanding" },
          { label: "Uncategorized", value: uncategorizedTransactions, hint: "Transactions missing category links" },
          { label: "Unlinked Receipts", value: receiptsWithoutTransactions, hint: "Files uploaded without transaction relation" },
          { label: "Missing Currency", value: walletsWithoutCurrency, hint: "Wallets falling back to default currency" },
        ],
        blocks: [
          buildBlock(
            "Open Items",
            4,
            ["Check", "Count", "Why it matters"],
            [
              ["Users pending verification", String(usersPendingVerification), "Accounts cannot fully self-serve yet"],
              ["Uncategorized transactions", String(uncategorizedTransactions), "Reporting and insights become less precise"],
              ["Receipts without transaction", String(receiptsWithoutTransactions), "Evidence is uploaded but not linked"],
              ["Wallets without currency", String(walletsWithoutCurrency), "Balances may display with fallback currency"],
            ],
            "No data gaps found",
          ),
        ],
      };
    }
    case "access": {
      const [totalUsers, totalSessions, totalAccounts, users, accounts, sessions, verificationTokens, userSettings] = await Promise.all([
        prisma.user.count(),
        prisma.session.count(),
        prisma.account.count(),
        prisma.user.findMany({
          select: { id: true, name: true, email: true, role: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.account.findMany({
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { provider: "asc" },
          take: 8,
        }),
        prisma.session.findMany({
          select: {
            id: true,
            sessionToken: true,
            expires: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { expires: "desc" },
          take: 8,
        }),
        prisma.verificationToken.findMany({
          select: { identifier: true, token: true, expires: true },
          orderBy: { expires: "desc" },
          take: 8,
        }),
        prisma.userSetting.findMany({
          select: {
            id: true,
            language: true,
            theme: true,
            timezone: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 8,
        }),
      ]);

      return {
        id: section,
        ...ADMIN_SECTION_DEFINITIONS[section],
        highlights: [
          { label: "Users", value: totalUsers, hint: "Registered accounts" },
          { label: "Providers", value: totalAccounts, hint: "Linked auth accounts" },
          { label: "Sessions", value: totalSessions, hint: "Stored login sessions" },
          { label: "Tokens", value: verificationTokens.length, hint: "Recent verification tokens" },
        ],
        blocks: [
          buildBlock(
            "Users",
            totalUsers,
            ["Name", "Email", "Role", "Joined"],
            users.map((user) => [user.name || "Unnamed user", user.email || "-", user.role, formatDate(user.createdAt)]),
            "No users found",
          ),
          buildBlock(
            "Linked Accounts",
            totalAccounts,
            ["Provider", "Account", "User", "Email"],
            accounts.map((account) => [
              account.provider,
              maskValue(account.providerAccountId),
              account.user?.name || "Unnamed user",
              account.user?.email || "-",
            ]),
            "No linked accounts",
          ),
          buildBlock(
            "Sessions",
            totalSessions,
            ["User", "Email", "Expires", "Token"],
            sessions.map((sessionItem) => [
              sessionItem.user?.name || "Unnamed user",
              sessionItem.user?.email || "-",
              formatDate(sessionItem.expires),
              maskValue(sessionItem.sessionToken),
            ]),
            "No active sessions",
          ),
          buildBlock(
            "Verification Tokens",
            verificationTokens.length,
            ["Identifier", "Expires", "Token"],
            verificationTokens.map((token) => [token.identifier, formatDate(token.expires), maskValue(token.token)]),
            "No verification tokens",
          ),
          buildBlock(
            "User Settings",
            userSettings.length,
            ["User", "Language", "Theme", "Timezone"],
            userSettings.map((setting) => [
              setting.user?.name || setting.user?.email || "User",
              setting.language,
              setting.theme,
              setting.timezone,
            ]),
            "No user settings yet",
          ),
        ],
      };
    }
    case "finance": {
      const [totalTransactions, totalCurrencies, wallets, categories, budgets, transactions, recurringPayments, savingsGoals, savingsContributions, debtLoans, debtPayments, currencies] =
        await Promise.all([
          prisma.transaction.count(),
          prisma.currency.count(),
          prisma.wallet.findMany({
            select: {
              id: true,
              name: true,
              balance: true,
              user: { select: { name: true, email: true } },
              currency: { select: { code: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 8,
          }),
          prisma.category.findMany({
            select: {
              id: true,
              name: true,
              type: true,
              isDefault: true,
              user: { select: { name: true, email: true } },
            },
            orderBy: { updatedAt: "desc" },
            take: 8,
          }),
          prisma.budget.findMany({
            select: {
              id: true,
              amount: true,
              month: true,
              year: true,
              status: true,
              user: { select: { name: true, email: true } },
            },
            orderBy: { updatedAt: "desc" },
            take: 8,
          }),
          prisma.transaction.findMany({
            select: {
              id: true,
              type: true,
              amount: true,
              transactionDate: true,
              user: { select: { name: true, email: true } },
              currency: { select: { code: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 8,
          }),
          prisma.recurringPayment.findMany({
            select: {
              id: true,
              title: true,
              amount: true,
              nextDueDate: true,
              status: true,
              user: { select: { name: true, email: true } },
            },
            orderBy: { nextDueDate: "asc" },
            take: 8,
          }),
          prisma.savingsGoal.findMany({
            select: {
              id: true,
              title: true,
              currentAmount: true,
              targetAmount: true,
              status: true,
              user: { select: { name: true, email: true } },
            },
            orderBy: { updatedAt: "desc" },
            take: 8,
          }),
          prisma.savingsContribution.findMany({
            select: {
              id: true,
              amount: true,
              contributionDate: true,
              user: { select: { name: true, email: true } },
              savingsGoal: { select: { title: true } },
            },
            orderBy: { contributionDate: "desc" },
            take: 8,
          }),
          prisma.debtLoan.findMany({
            select: {
              id: true,
              personName: true,
              amount: true,
              status: true,
              user: { select: { name: true, email: true } },
            },
            orderBy: { updatedAt: "desc" },
            take: 8,
          }),
          prisma.debtPayment.findMany({
            select: {
              id: true,
              amount: true,
              paymentDate: true,
              user: { select: { name: true, email: true } },
              debtLoan: { select: { personName: true } },
            },
            orderBy: { paymentDate: "desc" },
            take: 8,
          }),
          prisma.currency.findMany({
            select: {
              id: true,
              code: true,
              exchangeRateToUsd: true,
              isActive: true,
              lastSyncedAt: true,
            },
            orderBy: { code: "asc" },
            take: 8,
          }),
        ]);

      return {
        id: section,
        ...ADMIN_SECTION_DEFINITIONS[section],
        highlights: [
          { label: "Wallets", value: wallets.length, hint: "Recent wallet records" },
          { label: "Transactions", value: totalTransactions, hint: "Full ledger size" },
          { label: "Recurring", value: recurringPayments.length, hint: "Upcoming automated flows" },
          { label: "Currencies", value: totalCurrencies, hint: "Exchange-rate catalog" },
        ],
        blocks: [
          buildBlock(
            "Wallets",
            wallets.length,
            ["Wallet", "User", "Balance", "Currency"],
            wallets.map((wallet) => [
              wallet.name,
              wallet.user?.name || wallet.user?.email || "User",
              currencyAmount(wallet.balance, wallet.currency?.code || "USD"),
              wallet.currency?.code || "-",
            ]),
            "No wallets found",
          ),
          buildBlock(
            "Categories",
            categories.length,
            ["Category", "Type", "Owner", "Default"],
            categories.map((category) => [
              category.name,
              category.type,
              category.user?.name || category.user?.email || "Global",
              category.isDefault ? "Yes" : "No",
            ]),
            "No categories found",
          ),
          buildBlock(
            "Budgets",
            budgets.length,
            ["User", "Amount", "Period", "Status"],
            budgets.map((budget) => [
              budget.user?.name || budget.user?.email || "User",
              currencyAmount(budget.amount),
              `${budget.month}/${budget.year}`,
              budget.status,
            ]),
            "No budgets found",
          ),
          buildBlock(
            "Transactions",
            totalTransactions,
            ["User", "Type", "Amount", "Date"],
            transactions.map((transaction) => [
              transaction.user?.name || transaction.user?.email || "User",
              transaction.type,
              currencyAmount(transaction.amount, transaction.currency?.code || "USD"),
              formatDate(transaction.transactionDate),
            ]),
            "No transactions found",
          ),
          buildBlock(
            "Recurring Payments",
            recurringPayments.length,
            ["Title", "User", "Amount", "Next due"],
            recurringPayments.map((payment) => [
              payment.title,
              payment.user?.name || payment.user?.email || "User",
              currencyAmount(payment.amount),
              formatDate(payment.nextDueDate),
            ]),
            "No recurring payments",
          ),
          buildBlock(
            "Savings Goals",
            savingsGoals.length,
            ["Goal", "User", "Progress", "Status"],
            savingsGoals.map((goal) => [
              goal.title,
              goal.user?.name || goal.user?.email || "User",
              `${currencyAmount(goal.currentAmount)} / ${currencyAmount(goal.targetAmount)}`,
              goal.status,
            ]),
            "No savings goals",
          ),
          buildBlock(
            "Savings Contributions",
            savingsContributions.length,
            ["Goal", "User", "Amount", "Date"],
            savingsContributions.map((contribution) => [
              contribution.savingsGoal?.title || "Goal",
              contribution.user?.name || contribution.user?.email || "User",
              currencyAmount(contribution.amount),
              formatDate(contribution.contributionDate),
            ]),
            "No savings contributions",
          ),
          buildBlock(
            "Debt Loans",
            debtLoans.length,
            ["Person", "User", "Amount", "Status"],
            debtLoans.map((loan) => [
              loan.personName,
              loan.user?.name || loan.user?.email || "User",
              currencyAmount(loan.amount),
              loan.status,
            ]),
            "No debt loans",
          ),
          buildBlock(
            "Debt Payments",
            debtPayments.length,
            ["Loan", "User", "Amount", "Date"],
            debtPayments.map((payment) => [
              payment.debtLoan?.personName || "Loan",
              payment.user?.name || payment.user?.email || "User",
              currencyAmount(payment.amount),
              formatDate(payment.paymentDate),
            ]),
            "No debt payments",
          ),
          buildBlock(
            "Currencies",
            totalCurrencies,
            ["Code", "Rate to USD", "Active", "Last synced"],
            currencies.map((currency) => [
              currency.code,
              toNumber(currency.exchangeRateToUsd).toFixed(6),
              currency.isActive ? "Yes" : "No",
              formatDate(currency.lastSyncedAt),
            ]),
            "No currencies found",
          ),
        ],
      };
    }
    case "collaboration": {
      const [totalGroups, totalNotifications, financeGroups, groupMembers, groupInvites, groupMessages, receipts, notifications, exportLogs, aiInsights] = await Promise.all([
        prisma.financeGroup.count(),
        prisma.notification.count(),
        prisma.financeGroup.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
            owner: { select: { name: true, email: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 8,
        }),
        prisma.financeGroupMember.findMany({
          select: {
            id: true,
            role: true,
            status: true,
            user: { select: { name: true, email: true } },
            group: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.financeGroupInvite.findMany({
          select: {
            id: true,
            token: true,
            expiresAt: true,
            isActive: true,
            group: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 8,
        }),
        prisma.groupMessage.findMany({
          select: {
            id: true,
            body: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
            group: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.receipt.findMany({
          select: {
            id: true,
            originalName: true,
            fileType: true,
            uploadedAt: true,
            user: { select: { name: true, email: true } },
            transactionId: true,
          },
          orderBy: { uploadedAt: "desc" },
          take: 8,
        }),
        prisma.notification.findMany({
          select: {
            id: true,
            title: true,
            type: true,
            isRead: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.exportLog.findMany({
          select: {
            id: true,
            format: true,
            resource: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.aIInsight.findMany({
          select: {
            id: true,
            title: true,
            severity: true,
            generatedAt: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { generatedAt: "desc" },
          take: 8,
        }),
      ]);

      return {
        id: section,
        ...ADMIN_SECTION_DEFINITIONS[section],
        highlights: [
          { label: "Groups", value: totalGroups, hint: "Shared finance spaces" },
          { label: "Messages", value: groupMessages.length, hint: "Recent collaboration activity" },
          { label: "Receipts", value: receipts.length, hint: "Latest uploaded files" },
          { label: "Notifications", value: totalNotifications, hint: "Global user-facing alerts" },
        ],
        blocks: [
          buildBlock(
            "Finance Groups",
            totalGroups,
            ["Group", "Owner", "Owner Email", "Created"],
            financeGroups.map((group) => [
              group.name,
              group.owner?.name || "Owner",
              group.owner?.email || "-",
              formatDate(group.createdAt),
            ]),
            "No groups found",
          ),
          buildBlock(
            "Group Members",
            groupMembers.length,
            ["Group", "User", "Role", "Status"],
            groupMembers.map((member) => [
              member.group?.name || "Group",
              member.user?.name || member.user?.email || "User",
              member.role,
              member.status,
            ]),
            "No memberships found",
          ),
          buildBlock(
            "Invites",
            groupInvites.length,
            ["Group", "Token", "Expires", "Active"],
            groupInvites.map((invite) => [
              invite.group?.name || "Group",
              maskValue(invite.token),
              formatDate(invite.expiresAt),
              invite.isActive ? "Yes" : "No",
            ]),
            "No invites found",
          ),
          buildBlock(
            "Messages",
            groupMessages.length,
            ["Group", "User", "Preview", "Created"],
            groupMessages.map((message) => [
              message.group?.name || "Group",
              message.user?.name || message.user?.email || "User",
              message.body.length > 48 ? `${message.body.slice(0, 48)}...` : message.body,
              formatDate(message.createdAt),
            ]),
            "No messages found",
          ),
          buildBlock(
            "Receipts",
            receipts.length,
            ["File", "User", "Type", "Linked"],
            receipts.map((receipt) => [
              receipt.originalName,
              receipt.user?.name || receipt.user?.email || "User",
              receipt.fileType,
              receipt.transactionId ? "Yes" : "No",
            ]),
            "No receipts found",
          ),
          buildBlock(
            "Notifications",
            totalNotifications,
            ["Title", "User", "Type", "Read"],
            notifications.map((notification) => [
              notification.title,
              notification.user?.name || notification.user?.email || "User",
              notification.type,
              notification.isRead ? "Yes" : "No",
            ]),
            "No notifications found",
          ),
          buildBlock(
            "Export Logs",
            exportLogs.length,
            ["User", "Format", "Resource", "Created"],
            exportLogs.map((log) => [
              log.user?.name || log.user?.email || "User",
              log.format,
              log.resource,
              formatDate(log.createdAt),
            ]),
            "No export logs found",
          ),
          buildBlock(
            "AI Insights",
            aiInsights.length,
            ["Title", "User", "Severity", "Generated"],
            aiInsights.map((insight) => [
              insight.title,
              insight.user?.name || insight.user?.email || "User",
              insight.severity,
              formatDate(insight.generatedAt),
            ]),
            "No AI insights found",
          ),
        ],
      };
    }
    case "platform": {
      const siteSettings = await getSiteSettings();

      return {
        id: section,
        ...ADMIN_SECTION_DEFINITIONS[section],
        highlights: [
          { label: "Site Name", value: siteSettings.siteName || "-", hint: "Global branding label" },
          { label: "Support", value: siteSettings.supportEmail || "-", hint: "Primary support channel" },
          { label: "Verification", value: siteSettings.requireEmailVerification ? "On" : "Off", hint: "Registration verification status" },
          { label: "Expiry", value: `${siteSettings.verificationCodeExpiryMinutes || 15} min`, hint: "Code validity duration" },
        ],
        blocks: [
          buildBlock(
            "Site Settings",
            1,
            ["Field", "Value"],
            [
              ["Site name", siteSettings.siteName || "-"],
              ["Site URL", siteSettings.siteUrl || "-"],
              ["Support email", siteSettings.supportEmail || "-"],
              ["SMTP host", siteSettings.smtpHost || process.env.SMTP_HOST || "-"],
              ["SMTP user", siteSettings.smtpUser || process.env.SMTP_USER || "-"],
              ["SMTP from", siteSettings.smtpFrom || process.env.SMTP_FROM || "-"],
              ["Verification required", siteSettings.requireEmailVerification ? "Yes" : "No"],
              ["Code expiry (minutes)", String(siteSettings.verificationCodeExpiryMinutes || 15)],
            ],
            "No site settings found",
          ),
        ],
      };
    }
    default:
      return null;
  }
}
