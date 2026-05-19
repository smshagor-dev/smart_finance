ALTER TABLE `users`
  ADD COLUMN `avatar` VARCHAR(191) NULL,
  ADD COLUMN `registration_provider` ENUM('email', 'google', 'facebook', 'telegram') NOT NULL DEFAULT 'email',
  ADD COLUMN `google_id` VARCHAR(191) NULL,
  ADD COLUMN `facebook_id` VARCHAR(191) NULL,
  ADD COLUMN `telegram_id` VARCHAR(191) NULL,
  ADD COLUMN `provider_meta` JSON NULL,
  ADD COLUMN `last_login_provider` ENUM('email', 'google', 'facebook', 'telegram') NULL,
  ADD COLUMN `last_login_at` DATETIME(3) NULL,
  ADD COLUMN `login_count` INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX `users_google_id_key` ON `users`(`google_id`);
CREATE UNIQUE INDEX `users_facebook_id_key` ON `users`(`facebook_id`);
CREATE UNIQUE INDEX `users_telegram_id_key` ON `users`(`telegram_id`);
CREATE INDEX `users_registration_provider_idx` ON `users`(`registration_provider`);
CREATE INDEX `users_last_login_provider_idx` ON `users`(`last_login_provider`);

CREATE TABLE `auth_provider_settings` (
  `id` VARCHAR(191) NOT NULL,
  `provider` ENUM('google', 'facebook', 'telegram') NOT NULL,
  `client_id` VARCHAR(191) NULL,
  `client_secret` TEXT NULL,
  `bot_token` TEXT NULL,
  `callback_url` TEXT NULL,
  `success_redirect_url` TEXT NULL,
  `failure_redirect_url` TEXT NULL,
  `scopes` TEXT NULL,
  `config_json` JSON NULL,
  `is_enabled` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `auth_provider_settings_provider_key`(`provider`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id` VARCHAR(191) NOT NULL,
  `actor_user_id` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `entity_type` VARCHAR(191) NOT NULL,
  `entity_id` VARCHAR(191) NULL,
  `description` TEXT NULL,
  `ip_address` VARCHAR(191) NULL,
  `meta` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `audit_logs_actor_user_id_idx`(`actor_user_id`),
  INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
  INDEX `audit_logs_created_at_idx`(`created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_actor_user_id_fkey`
  FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
