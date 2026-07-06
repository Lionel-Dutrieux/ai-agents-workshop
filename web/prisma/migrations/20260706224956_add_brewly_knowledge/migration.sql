-- CreateTable
CREATE TABLE "BrewlyKnowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "publie" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BrewlyKnowledge_reference_key" ON "BrewlyKnowledge"("reference");

-- CreateIndex
CREATE INDEX "BrewlyKnowledge_categorie_idx" ON "BrewlyKnowledge"("categorie");

-- CreateIndex
CREATE INDEX "BrewlyKnowledge_publie_idx" ON "BrewlyKnowledge"("publie");
