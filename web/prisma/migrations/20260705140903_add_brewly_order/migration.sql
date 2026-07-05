-- CreateTable
CREATE TABLE "BrewlyOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "articles" TEXT NOT NULL DEFAULT '[]',
    "total" REAL NOT NULL DEFAULT 0,
    "commandeeLe" TEXT NOT NULL,
    "livraisonEstimee" TEXT,
    "transporteur" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BrewlyOrder_numero_key" ON "BrewlyOrder"("numero");

-- CreateIndex
CREATE INDEX "BrewlyOrder_statut_idx" ON "BrewlyOrder"("statut");

-- CreateIndex
CREATE INDEX "BrewlyOrder_createdAt_idx" ON "BrewlyOrder"("createdAt");
