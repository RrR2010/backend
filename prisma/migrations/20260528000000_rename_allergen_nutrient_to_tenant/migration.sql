-- Rename Allergen -> TenantAllergen and Nutrient -> TenantNutrient
ALTER TABLE "Allergen" RENAME TO "TenantAllergen";
ALTER TABLE "Nutrient" RENAME TO "TenantNutrient";

-- Update FK constraints in IngredientAllergen (FK column name stays as allergenId, target table renamed)
-- In PostgreSQL, when a table is renamed, FK references automatically follow the new table name.
-- No ALTER needed for the FK constraint itself.

-- Update FK constraints in IngredientNutrient (same pattern)
