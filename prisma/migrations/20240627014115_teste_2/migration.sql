/*
  Warnings:

  - You are about to drop the column `localizacao` on the `Abrigo` table. All the data in the column will be lost.
  - Added the required column `endereco` to the `Abrigo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Abrigo" DROP COLUMN "localizacao",
ADD COLUMN     "endereco" TEXT NOT NULL;
