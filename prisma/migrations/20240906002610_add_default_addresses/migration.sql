-- AlterTable
ALTER TABLE `addresses` ADD COLUMN `defaultBillingAddress` INTEGER NULL,
    ADD COLUMN `defaultShippingAddress` INTEGER NULL;
