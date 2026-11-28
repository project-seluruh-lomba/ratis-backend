-- CreateTable
CREATE TABLE `OrderStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('pending', 'diproses', 'selesai', 'dibatalkan') NULL,
    `toStatus` ENUM('pending', 'diproses', 'selesai', 'dibatalkan') NOT NULL,
    `note` TEXT NULL,
    `changedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusHistory_orderId_createdAt_idx`(`orderId`, `createdAt`),
    INDEX `OrderStatusHistory_changedById_idx`(`changedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
