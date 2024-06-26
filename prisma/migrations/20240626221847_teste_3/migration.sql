/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `Doacao` table. All the data in the column will be lost.
  - Added the required column `abrigoId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `abrigoId` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Doacao" DROP CONSTRAINT "Doacao_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Doacao" DROP COLUMN "usuarioId";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "abrigoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "abrigoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_abrigoId_fkey" FOREIGN KEY ("abrigoId") REFERENCES "Abrigo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_abrigoId_fkey" FOREIGN KEY ("abrigoId") REFERENCES "Abrigo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
