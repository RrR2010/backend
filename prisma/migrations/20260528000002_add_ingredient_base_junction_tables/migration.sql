-- CreateEnum (safe: skip if already exists)
DO $$ BEGIN
    CREATE TYPE "AllergenRelationType" AS ENUM ('CONTAINS', 'MAY_CONTAIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable IngredientBaseAllergen
CREATE TABLE "IngredientBaseAllergen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "baseAllergenId" TEXT NOT NULL,
    "relationType" "AllergenRelationType" NOT NULL,

    CONSTRAINT "IngredientBaseAllergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable IngredientBaseNutrient
CREATE TABLE "IngredientBaseNutrient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "baseNutrientId" TEXT NOT NULL,
    "value" DECIMAL(65,30),

    CONSTRAINT "IngredientBaseNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngredientBaseAllergen_id_key" ON "IngredientBaseAllergen"("id");
CREATE UNIQUE INDEX "IngredientBaseAllergen_tenantId_ingredientId_baseAllergenId_key" ON "IngredientBaseAllergen"("tenantId", "ingredientId", "baseAllergenId");
CREATE INDEX "IngredientBaseAllergen_tenantId_idx" ON "IngredientBaseAllergen"("tenantId");
CREATE INDEX "IngredientBaseAllergen_ingredientId_idx" ON "IngredientBaseAllergen"("ingredientId");
CREATE INDEX "IngredientBaseAllergen_baseAllergenId_idx" ON "IngredientBaseAllergen"("baseAllergenId");

CREATE UNIQUE INDEX "IngredientBaseNutrient_id_key" ON "IngredientBaseNutrient"("id");
CREATE UNIQUE INDEX "IngredientBaseNutrient_tenantId_ingredientId_baseNutrientId_key" ON "IngredientBaseNutrient"("tenantId", "ingredientId", "baseNutrientId");
CREATE INDEX "IngredientBaseNutrient_tenantId_idx" ON "IngredientBaseNutrient"("tenantId");
CREATE INDEX "IngredientBaseNutrient_ingredientId_idx" ON "IngredientBaseNutrient"("ingredientId");
CREATE INDEX "IngredientBaseNutrient_baseNutrientId_idx" ON "IngredientBaseNutrient"("baseNutrientId");

-- AddForeignKey
ALTER TABLE "IngredientBaseAllergen" ADD CONSTRAINT "IngredientBaseAllergen_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IngredientBaseAllergen" ADD CONSTRAINT "IngredientBaseAllergen_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IngredientBaseAllergen" ADD CONSTRAINT "IngredientBaseAllergen_baseAllergenId_fkey" FOREIGN KEY ("baseAllergenId") REFERENCES "BaseAllergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "IngredientBaseNutrient" ADD CONSTRAINT "IngredientBaseNutrient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IngredientBaseNutrient" ADD CONSTRAINT "IngredientBaseNutrient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IngredientBaseNutrient" ADD CONSTRAINT "IngredientBaseNutrient_baseNutrientId_fkey" FOREIGN KEY ("baseNutrientId") REFERENCES "BaseNutrient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
