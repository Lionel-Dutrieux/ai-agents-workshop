"use server";

import {
  getSeedStatus,
  seedDatabase,
  type SeedResult,
  type SeedStatus,
} from "@/lib/dal/seed";

/**
 * Server Actions de la carte « Données de démonstration ». Fines : elles
 * délèguent au seeder centralisé (`lib/dal/seed.ts`).
 */

export async function getSeedStatusAction(): Promise<SeedStatus> {
  return getSeedStatus();
}

export async function seedDatabaseAction(): Promise<SeedResult> {
  return seedDatabase();
}
