/*
  Warnings:

  - You are about to drop the column `endereco` on the `Abrigo` table. All the data in the column will be lost.
  - Added the required column `localizacao` to the `Abrigo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Abrigo" DROP COLUMN "endereco",
ADD COLUMN     "localizacao" TEXT NOT NULL;
