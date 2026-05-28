-- Rename functionalName -> internalName and saleName -> saleDenomination in Ingredient table
ALTER TABLE "Ingredient" RENAME COLUMN "functionalName" TO "internalName";
ALTER TABLE "Ingredient" RENAME COLUMN "saleName" TO "saleDenomination";
