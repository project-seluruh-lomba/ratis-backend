-- AlterTable
ALTER TABLE `adminlog` MODIFY `action` ENUM('LOGIN', 'APPROVE_SHOP', 'REJECT_SHOP', 'ACTIVATE_SHOP', 'DEACTIVATE_SHOP', 'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY', 'ACTIVATE_USER', 'DEACTIVATE_USER', 'PROCESS_PAYOUT_BATCH') NOT NULL;

-- CreateTable
CREATE TABLE `Payout` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `bank` VARCHAR(191) NOT NULL,
    `account` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `netAmount` INTEGER NOT NULL,
    `commission` INTEGER NOT NULL,
    `status` ENUM('menunggu', 'diverifikasi', 'berhasil', 'terkirim') NOT NULL DEFAULT 'menunggu',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `processedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payout_status_submittedAt_idx`(`status`, `submittedAt`),
    INDEX `Payout_shopId_idx`(`shopId`),
    INDEX `Payout_processedById_idx`(`processedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payout` ADD CONSTRAINT `Payout_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payout` ADD CONSTRAINT `Payout_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
