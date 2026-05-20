CREATE TABLE `custom_pages` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `short_description` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `meta_title` VARCHAR(191) NULL,
  `meta_description` TEXT NULL,
  `meta_keywords` TEXT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `published_at` DATETIME(3) NULL,
  UNIQUE INDEX `custom_pages_slug_key`(`slug`),
  INDEX `custom_pages_status_created_at_idx`(`status`, `created_at`),
  INDEX `custom_pages_title_idx`(`title`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
