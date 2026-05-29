-- Rename IngredientAllergen -> IngredientTenantAllergen and IngredientNutrient -> IngredientTenantNutrient
ALTER TABLE "IngredientAllergen" RENAME TO "IngredientTenantAllergen";
ALTER TABLE "IngredientNutrient" RENAME TO "IngredientTenantNutrient";

-- FK constraints reference updated table names automatically in PostgreSQL
-- when the referred table was already renamed (TenantAllergen/TenantNutrient).
-- No additional ALTER statements needed.
