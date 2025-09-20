/*
  Warnings:

  - You are about to alter the column `quantity` on the `cartitem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `name` on the `category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `mimeType` on the `media` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `type` on the `media` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `quantity` on the `orderitem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `stock` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to drop the column `size` on the `productsize` table. All the data in the column will be lost.
  - You are about to alter the column `stock` on the `productsize` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `name` on the `tag` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `name` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeId` to the `ProductSize` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_userId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_productId_fkey`;

-- DropForeignKey
ALTER TABLE `media` DROP FOREIGN KEY `Media_userId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `productsize` DROP FOREIGN KEY `ProductSize_productId_fkey`;

-- DropForeignKey
ALTER TABLE `producttag` DROP FOREIGN KEY `ProductTag_productId_fkey`;

-- DropForeignKey
ALTER TABLE `producttag` DROP FOREIGN KEY `ProductTag_tagId_fkey`;

-- DropIndex
DROP INDEX `CartItem_cartId_fkey` ON `cartitem`;

-- DropIndex
DROP INDEX `CartItem_productId_fkey` ON `cartitem`;

-- DropIndex
DROP INDEX `Media_productId_fkey` ON `media`;

-- DropIndex
DROP INDEX `Order_userId_fkey` ON `order`;

-- DropIndex
DROP INDEX `OrderItem_orderId_fkey` ON `orderitem`;

-- DropIndex
DROP INDEX `OrderItem_productId_fkey` ON `orderitem`;

-- DropIndex
DROP INDEX `ProductSize_productId_fkey` ON `productsize`;

-- DropIndex
DROP INDEX `ProductTag_tagId_fkey` ON `producttag`;

-- AlterTable
ALTER TABLE `cartitem` MODIFY `quantity` INTEGER UNSIGNED NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `category` MODIFY `name` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `media` MODIFY `url` VARCHAR(255) NOT NULL,
    MODIFY `mimeType` VARCHAR(50) NOT NULL,
    MODIFY `type` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `total` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `quantity` INTEGER UNSIGNED NOT NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `price` DECIMAL(10, 2) NOT NULL,
    MODIFY `stock` INTEGER UNSIGNED NOT NULL,
    MODIFY `categoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `productsize` DROP COLUMN `size`,
    ADD COLUMN `sizeId` INTEGER NOT NULL,
    MODIFY `stock` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `tag` MODIFY `name` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `name` VARCHAR(100) NOT NULL;

-- CreateTable
CREATE TABLE `Size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Size_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSize` ADD CONSTRAINT `ProductSize_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSize` ADD CONSTRAINT `ProductSize_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductTag` ADD CONSTRAINT `ProductTag_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductTag` ADD CONSTRAINT `ProductTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `product` RENAME INDEX `Product_categoryId_fkey` TO `Product_categoryId_idx`;
