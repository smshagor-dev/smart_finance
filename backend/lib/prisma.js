import { PrismaClient } from "@prisma/client";
import runtimeEnv from "../config/runtime-env.cjs";

runtimeEnv.ensureRuntimeEnv("backend");

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getStore() {
  if (!globalForPrisma.__smartFinancePrismaStore) {
    globalForPrisma.__smartFinancePrismaStore = {
      client: createPrismaClient(),
    };
  }

  return globalForPrisma.__smartFinancePrismaStore;
}

export function getPrismaClient() {
  return getStore().client;
}

export async function resetPrismaClient() {
  const store = getStore();
  const previousClient = store.client;
  const nextClient = createPrismaClient();
  store.client = nextClient;

  if (previousClient) {
    try {
      await previousClient.$disconnect();
    } catch {
      // Ignore disconnect errors when rotating a broken client.
    }
  }

  return nextClient;
}

export function isRetryableDatabaseError(error) {
  const message = error?.message || "";
  return message.includes("Server has closed the connection");
}

export const prisma = new Proxy(
  {},
  {
    get(_target, property) {
      const client = getPrismaClient();
      const value = client[property];
      return typeof value === "function" ? value.bind(client) : value;
    },
  },
);
