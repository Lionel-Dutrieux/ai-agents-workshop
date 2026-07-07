-- CreateTable
CREATE TABLE "BrewlyEmbedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "vecteur" TEXT NOT NULL,
    "publie" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "BrewlyEmbedding_reference_idx" ON "BrewlyEmbedding"("reference");
