-- DropForeignKey
ALTER TABLE `Payout` DROP FOREIGN KEY `Payout_processedById_fkey`;

-- DropForeignKey
ALTER TABLE `Payout` DROP FOREIGN KEY `Payout_shopId_fkey`;

-- AlterTable
ALTER TABLE `AdminLog` MODIFY `action` ENUM('LOGIN', 'APPROVE_SHOP', 'REJECT_SHOP', 'ACTIVATE_SHOP', 'DEACTIVATE_SHOP', 'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY', 'ACTIVATE_USER', 'DEACTIVATE_USER') NOT NULL;

-- DropTable
DROP TABLE `Payout`;

-- NIB opsional, tetapi bila diisi wajib 13 digit angka (PRD A3 & 15.3)
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_nib_13_digits` CHECK (`nib` IS NULL OR `nib` REGEXP '^[0-9]{13}$');
