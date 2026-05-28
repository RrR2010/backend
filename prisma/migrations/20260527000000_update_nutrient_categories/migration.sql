-- Update NutrientCategory enum: replace old values with new classification
-- Remove subcategory from BaseNutrient and Nutrient tables

-- Drop subcategory columns (no existing data)
ALTER TABLE "BaseNutrient" DROP COLUMN IF EXISTS "subcategory";
ALTER TABLE "Nutrient" DROP COLUMN IF EXISTS "subcategory";

-- Drop columns using the old NutrientCategory enum so we can recreate it
ALTER TABLE "BaseNutrient" DROP COLUMN "category";
ALTER TABLE "Nutrient" DROP COLUMN "category";

-- Drop old enum type
DROP TYPE "NutrientCategory";

-- Create new NutrientCategory enum
CREATE TYPE "NutrientCategory" AS ENUM ('MANDATORY_DECLARATION', 'SPECIFIC_CARBS', 'FATTY_ACIDS', 'MINERALS', 'FIBER', 'VITAMINS', 'OTHER');

-- Re-add category columns with new enum type
ALTER TABLE "BaseNutrient" ADD COLUMN "category" "NutrientCategory" NOT NULL;
ALTER TABLE "Nutrient" ADD COLUMN "category" "NutrientCategory" NOT NULL;
