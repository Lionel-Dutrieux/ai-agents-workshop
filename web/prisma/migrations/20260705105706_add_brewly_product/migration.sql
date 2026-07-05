-- CreateTable
CREATE TABLE "BrewlyProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "prix" REAL NOT NULL DEFAULT 0,
    "origine" TEXT,
    "intensite" INTEGER,
    "description" TEXT NOT NULL DEFAULT '',
    "enStock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BrewlyProduct_reference_key" ON "BrewlyProduct"("reference");

-- CreateIndex
CREATE INDEX "BrewlyProduct_categorie_idx" ON "BrewlyProduct"("categorie");

-- CreateIndex
CREATE INDEX "BrewlyProduct_createdAt_idx" ON "BrewlyProduct"("createdAt");
