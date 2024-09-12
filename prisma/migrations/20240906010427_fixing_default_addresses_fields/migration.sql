/*
  Warnings:

  - You are about to drop the column `defaultBillingAddress` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `defaultShippingAddress` on the `addresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `addresses` DROP COLUMN `defaultBillingAddress`,
    DROP COLUMN `defaultShippingAddress`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `defaultBillingAddress` INTEGER NULL,
    ADD COLUMN `defaultShippingAddress` INTEGER NULL;
