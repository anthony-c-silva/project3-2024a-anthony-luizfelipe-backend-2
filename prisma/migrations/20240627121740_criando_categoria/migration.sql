/*
  Warnings:

  - You are about to drop the column `descricao` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `categoria` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomeUsuario` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Usuario_email_key";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "descricao",
ADD COLUMN     "categoria" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "nome",
ADD COLUMN     "nomeUsuario" TEXT NOT NULL,
ADD COLUMN     "senha" TEXT NOT NULL;
