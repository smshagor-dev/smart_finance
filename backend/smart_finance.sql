-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 09, 2026 at 12:09 PM
-- Server version: 10.6.27-MariaDB-log
-- PHP Version: 8.4.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mybuddis_smart_finance`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `provider_account_id` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL,
  `oauth_token_secret` text DEFAULT NULL,
  `oauth_token` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `user_id`, `type`, `provider`, `provider_account_id`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`, `oauth_token_secret`, `oauth_token`) VALUES
('cmpf3zvll000tkslqvpr00uif', 'cmpf3zvlf000rkslqekwkfrc5', 'oauth', 'facebook', '4959700814302356', NULL, NULL, NULL, NULL, 'email,public_profile', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `AIInsight`
--

CREATE TABLE `AIInsight` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `insight_type` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `severity` enum('info','warning','danger','success') NOT NULL DEFAULT 'info',
  `generated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `actor_user_id` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity_type` varchar(191) NOT NULL,
  `entity_id` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(191) DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `meta`, `created_at`) VALUES
('cmpcpyzu10001kshu4j0y2elp', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '185.77.216.27', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-19 14:19:45.769'),
('cmpcpzn080003kshu4v54luvu', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '92.63.224.153', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-19 14:20:15.801'),
('cmpcq20880005kshujnitgymz', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '185.77.216.27', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-19 14:22:06.248'),
('cmpcqqyyh0008kshuyq8sb782', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'google', 'Updated google auth provider settings', '23.160.72.44', '{\"provider\":\"google\",\"isEnabled\":true,\"callbackUrl\":\"https://smart-finance.smshagor.online/api/auth/google/callback\",\"successRedirectUrl\":\"/dshboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-19 14:41:31.001'),
('cmpcr2feu000bkshustgikq7m', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'telegram', 'Updated telegram auth provider settings', '23.160.72.44', '{\"provider\":\"telegram\",\"isEnabled\":false,\"callbackUrl\":\"https://smart-finance.live/api/auth/telegram/callback\",\"successRedirectUrl\":\"/dashboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-19 14:50:25.542'),
('cmpcr2jtj000ekshuvhhss7tg', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'telegram', 'Updated telegram auth provider settings', '23.160.72.44', '{\"provider\":\"telegram\",\"isEnabled\":true,\"callbackUrl\":\"https://smart-finance.live/api/auth/telegram/callback\",\"successRedirectUrl\":\"/dashboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-19 14:50:31.256'),
('cmpe0vdqc000gkshute11pk0z', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '185.145.245.177', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-20 12:12:39.109'),
('cmpe6tgy20001ksxg270j4vbx', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '51.38.121.218', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-20 14:59:07.658'),
('cmpe6u3ti0004ksxgvcpyersr', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'google', 'Updated google auth provider settings', '51.38.121.218', '{\"provider\":\"google\",\"isEnabled\":true,\"callbackUrl\":\"https://smartsfinance.online/api/auth/google/callback\",\"successRedirectUrl\":\"/dshboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-20 14:59:37.302'),
('cmpe6uceg0007ksxgjz4nclwk', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'telegram', 'Updated telegram auth provider settings', '51.38.121.218', '{\"provider\":\"telegram\",\"isEnabled\":true,\"callbackUrl\":\"https://smartsfinance.online/api/auth/telegram/callback\",\"successRedirectUrl\":\"/dashboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-20 14:59:48.425'),
('cmpe6ufir0009ksxgt55bmqf4', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.tested', 'auth_provider_setting', 'google', 'Tested google auth provider connection', '51.38.121.218', '{\"scope\":\"openid email profile\"}', '2026-05-20 14:59:52.468'),
('cmpe6uljl000bksxgujir52rz', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.tested', 'auth_provider_setting', 'telegram', 'Tested telegram auth provider connection', '51.38.121.218', '{\"botId\":8878849461,\"username\":\"smartfinanceauthsystem_bot\"}', '2026-05-20 15:00:00.273'),
('cmpe77ru6000eksxg49hpk673', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'facebook', 'Updated facebook auth provider settings', '51.38.121.218', '{\"provider\":\"facebook\",\"isEnabled\":false,\"callbackUrl\":\"https://smartsfinance.online/api/auth/facebook/callback\",\"successRedirectUrl\":\"/dashboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-20 15:10:14.958'),
('cmpe7cjq4000gksxg9b7o3h4m', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '94.131.15.52', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-20 15:13:57.724'),
('cmpe812n7000iksxgvcdmcr9y', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '185.237.220.18', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-20 15:33:01.987'),
('cmpe9gmby0002ksogfqh2ayrc', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'google', 'Updated google auth provider settings', '51.38.121.218', '{\"provider\":\"google\",\"isEnabled\":true,\"callbackUrl\":\"https://smartsfinance.online/api/auth/google/callback\",\"successRedirectUrl\":\"/dshboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-20 16:13:06.958'),
('cmpepthjb0001ksohl24z3buu', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '149.88.109.83', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-20 23:51:01.127'),
('cmpeq5zpd0001kslqbsnjsfug', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '149.88.109.83', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-21 00:00:44.546'),
('cmpezz5le0003kslq4c7xnji2', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '92.63.224.153', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-21 04:35:21.746'),
('cmpf2nibk0009kslqot08ez45', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '185.77.216.27', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-21 05:50:17.216'),
('cmpf2nsmh000ckslqz023v5it', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'google', 'Updated google auth provider settings', '185.77.216.27', '{\"provider\":\"google\",\"isEnabled\":true,\"callbackUrl\":\"https://smartsfinance.online/api/auth/google/callback\",\"successRedirectUrl\":\"/dshboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-21 05:50:30.569'),
('cmpf2w51z000fkslq1vsld0n3', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'google', 'Updated google auth provider settings', '185.77.216.27', '{\"provider\":\"google\",\"isEnabled\":true,\"callbackUrl\":\"https://smartsfinance.online/api/auth/google/callback\",\"successRedirectUrl\":\"/dshboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-21 05:56:59.928'),
('cmpf2xs98000ikslq626ll4h9', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'google', 'Updated google auth provider settings', '185.77.216.27', '{\"provider\":\"google\",\"isEnabled\":true,\"callbackUrl\":\"https://smartsfinance.online/api/auth/google/callback\",\"successRedirectUrl\":\"/dashboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-21 05:58:16.652'),
('cmpf3jncz000lkslqy7tgizzu', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'facebook', 'Updated facebook auth provider settings', '185.77.216.27', '{\"provider\":\"facebook\",\"isEnabled\":false,\"callbackUrl\":\"https://smartsfinance.online/api/auth/facebook/callback\",\"successRedirectUrl\":\"/dashboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-21 06:15:16.739'),
('cmpf3jokc000okslqinclgsdu', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'facebook', 'Updated facebook auth provider settings', '185.77.216.27', '{\"provider\":\"facebook\",\"isEnabled\":true,\"callbackUrl\":\"https://smartsfinance.online/api/auth/facebook/callback\",\"successRedirectUrl\":\"/dashboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-21 06:15:18.301'),
('cmpf3zvlt000vkslqvfrsfnuv', 'cmpf3zvlf000rkslqekwkfrc5', 'auth.login', 'user', 'cmpf3zvlf000rkslqekwkfrc5', 'facebook login successful', '185.77.216.27', '{\"provider\":\"facebook\",\"deviceType\":\"desktop\",\"returnTo\":\"/dashboard\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36\"}', '2026-05-21 06:27:53.922'),
('cmpf4059w000xkslqkbk5elrp', 'cmpf3zvlf000rkslqekwkfrc5', 'user.default_currency.updated', 'user', 'cmpf3zvlf000rkslqekwkfrc5', 'User updated default currency', '185.77.216.27', '{\"currencyId\":\"cmougxt6t0003ksplrrxxphot\",\"currencyCode\":\"RUB\"}', '2026-05-21 06:28:06.452'),
('cmpf43i5f000zkslqs1ge110x', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '185.77.216.27', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-21 06:30:43.107'),
('cmpf43weu0011kslqx8aye0pz', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.tested', 'auth_provider_setting', 'google', 'Tested google auth provider connection', '185.77.216.27', '{\"scope\":\"openid email profile\"}', '2026-05-21 06:31:01.590'),
('cmpf4zuz60001ks87fo967ov6', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '185.77.216.27', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-21 06:55:52.722'),
('cmpf5097i0004ks87ibkzk14c', 'cmouh1bd70005kswhabvrbt20', 'auth_provider.updated', 'auth_provider_setting', 'telegram', 'Updated telegram auth provider settings', '185.77.216.27', '{\"provider\":\"telegram\",\"isEnabled\":true,\"callbackUrl\":\"https://smartsfinance.online/api/auth/telegram/callback\",\"successRedirectUrl\":\"/dashboard\",\"failureRedirectUrl\":\"/login\"}', '2026-05-21 06:56:11.167'),
('cmpf5f4u60001ks6atwxssamv', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '92.63.224.153', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-21 07:07:45.342'),
('cmpfdl5yt0003ks6akiuutq96', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '185.145.245.177', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-21 10:56:23.669'),
('cmphu2e96000pks6aln6wgd3t', 'cmphu2e8p000lks6ao8k9ugt4', 'auth.register', 'user', 'cmphu2e8p000lks6ao8k9ugt4', 'User registered with email and password', '168.110.207.255', '{\"provider\":\"email\",\"deviceType\":\"mobile\",\"requiresVerification\":true}', '2026-05-23 04:13:13.770'),
('cmphu5k97000rks6a0gq7iyno', 'cmphu2e8p000lks6ao8k9ugt4', 'auth.login', 'user', 'cmphu2e8p000lks6ao8k9ugt4', 'Email login successful', '168.110.207.255', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-23 04:15:41.516'),
('cmpinglzr001hks6anfofemtg', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '185.237.220.18', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-05-23 17:56:05.848'),
('cmpqfh0kv0027ks6a2i949le4', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '185.237.220.18', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-05-29 04:34:37.231'),
('cmpum6o93002lks6a3266qpa8', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '176.97.210.85', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-06-01 02:53:36.712'),
('cmpv8ve03002rks6a499bks3s', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '185.145.245.187', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-01 13:28:41.380'),
('cmpw8o3c2002xks6a87nec4d7', 'cmphu2e8p000lks6ao8k9ugt4', 'auth.login', 'user', 'cmphu2e8p000lks6ao8k9ugt4', 'Email login successful', '92.244.224.104', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-02 06:10:47.138'),
('cmq0sis2w003zks6afh8japzf', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '176.97.210.85', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-05 10:37:36.296'),
('cmq5dg2pp0051ks6alqxfvgfx', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '176.97.210.85', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-06-08 15:34:26.750'),
('cmq5ma6e4005bks6avje8giv4', 'cmq5ma6dc0057ks6awhn1a01h', 'auth.register', 'user', 'cmq5ma6dc0057ks6awhn1a01h', 'User registered with email and password', '92.63.224.153', '{\"provider\":\"email\",\"deviceType\":\"mobile\",\"requiresVerification\":false}', '2026-06-08 19:41:48.124'),
('cmq5ma7bv005dks6aw7nnifho', 'cmq5ma6dc0057ks6awhn1a01h', 'auth.login', 'user', 'cmq5ma6dc0057ks6awhn1a01h', 'Email login successful', '92.63.224.153', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-08 19:41:49.340'),
('cmqatfllh006fks6a4lh2j82m', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '212.232.18.211', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-12 11:00:49.301'),
('cmqbc3etw006lks6a2jrfrpcx', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '92.63.224.153', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-12 19:43:13.365'),
('cmqggea4u006zks6acon7ln8x', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '185.145.245.187', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-06-16 09:42:29.839'),
('cmqkxxje0007dks6axzeukab4', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '92.63.224.153', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-19 13:04:26.472'),
('cmqlulns4007fks6akecf8wct', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '212.232.18.211', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-20 04:18:59.620'),
('cmqsfl0rm0081ks6a18r6r6b1', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '185.145.245.177', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-06-24 18:52:58.786'),
('cmqvv5gf2008jks6a2ou9tw5m', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '176.97.210.85', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-06-27 04:32:04.958'),
('cmrakfiao0099ks6az1qa53vq', 'cmp0pistw000fksr3uriqctco', 'auth.login', 'user', 'cmp0pistw000fksr3uriqctco', 'Email login successful', '212.232.18.227', '{\"provider\":\"email\",\"deviceType\":\"desktop\"}', '2026-07-07 11:28:30.816'),
('cmrca6802009bks6azwhf5pyq', 'cmouh1bd70005kswhabvrbt20', 'auth.login', 'user', 'cmouh1bd70005kswhabvrbt20', 'Email login successful', '176.97.210.85', '{\"provider\":\"email\",\"deviceType\":\"mobile\"}', '2026-07-08 16:16:53.763');

-- --------------------------------------------------------

--
-- Table structure for table `auth_provider_settings`
--

CREATE TABLE `auth_provider_settings` (
  `id` varchar(191) NOT NULL,
  `provider` enum('google','facebook','telegram') NOT NULL,
  `client_id` varchar(191) DEFAULT NULL,
  `client_secret` text DEFAULT NULL,
  `bot_token` text DEFAULT NULL,
  `callback_url` text DEFAULT NULL,
  `success_redirect_url` text DEFAULT NULL,
  `failure_redirect_url` text DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `config_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`config_json`)),
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_provider_settings`
--

INSERT INTO `auth_provider_settings` (`id`, `provider`, `client_id`, `client_secret`, `bot_token`, `callback_url`, `success_redirect_url`, `failure_redirect_url`, `scopes`, `config_json`, `is_enabled`, `created_at`, `updated_at`) VALUES
('cmpcqqyye0006kshuhcl06quc', 'google', '171807320206-t0kiuv5up70uv94rsumf3581gnhkt1gt.apps.googleusercontent.com', 'hWrbPzsB2rM0hzxeG9HNkQ4TBwLmiBEJnYBpmZcorXFPoGpQ4nJ9ffTl71V4G1Y+dcxKxVtjWQTa2l81duZ/', NULL, 'https://smartsfinance.online/api/auth/google/callback', '/dashboard', '/login', 'openid email profile', 'null', 1, '2026-05-19 14:41:30.998', '2026-05-21 05:58:16.646'),
('cmpcr2feq0009kshuauyptds1', 'telegram', NULL, NULL, 'neFU43i2YcdrL/AmSfPSY5H08jsdQLrGS8PDrgt2TJwyeX4n8E3X6GwvbTFzYqW0iXT/oeRCh1+Dy7maBSKdo6fL22nJNzfYEy0=', 'https://smartsfinance.online/api/auth/telegram/callback', '/dashboard', '/login', '', 'null', 1, '2026-05-19 14:50:25.538', '2026-05-21 06:56:11.163'),
('cmpe77rty000cksxg61ka9ke4', 'facebook', '1460071415758338', 'lKZ2S14P0JNusT7YruqRpF00KAsoi+cMDUbjwUnGll4Kknt4pIMc2qncJ+0eboHSkhsppWt5ohK/a64S', NULL, 'https://smartsfinance.online/api/auth/facebook/callback', '/dashboard', '/login', 'email,public_profile', 'null', 1, '2026-05-20 15:10:14.951', '2026-05-21 06:15:18.297');

-- --------------------------------------------------------

--
-- Table structure for table `Budget`
--

CREATE TABLE `Budget` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `category_id` varchar(191) DEFAULT NULL,
  `wallet_id` varchar(191) DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `status` enum('active','exceeded','completed') NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Category`
--

CREATE TABLE `Category` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Category`
--

INSERT INTO `Category` (`id`, `user_id`, `name`, `type`, `icon`, `color`, `is_default`, `created_at`, `updated_at`) VALUES
('cmouhndus0001ksgz2njhovyp', 'cmouh1bd70005kswhabvrbt20', 'Car Wash', 'income', 'car', '#0f766e', 0, '2026-05-06 20:06:55.973', '2026-05-06 20:06:55.973'),
('cmp48vue9000jksr362s96km0', 'cmp0pistw000fksr3uriqctco', 'Magnit', 'income', 'shopping-bag', '#0f766e', 0, '2026-05-13 15:59:15.873', '2026-05-13 15:59:15.873'),
('cmp48wbpl000lksr3gyu41pnz', 'cmp0pistw000fksr3uriqctco', 'Factory', 'income', 'house', '#0f766e', 0, '2026-05-13 15:59:38.313', '2026-05-13 15:59:38.313'),
('cmp9tv7840001kstaan9wouh4', 'cmouh1bd70005kswhabvrbt20', 'Food', 'expense', 'utensils', '#0f766e', 0, '2026-05-17 13:45:28.660', '2026-05-17 13:45:28.660'),
('cmpaogmxl0005kse7vr8suenr', 'cmpaoci6z0001kse7yheapt71', 'Car wash', 'income', 'car', '#0f766e', 0, '2026-05-18 04:01:57.273', '2026-05-18 04:01:57.273'),
('cmphu86a6000xks6aj70y3o8u', 'cmphu2e8p000lks6ao8k9ugt4', 'Car wash', 'income', 'car', '#0f766e', 0, '2026-05-23 04:17:43.374', '2026-05-23 04:17:43.374'),
('cmphufv8j001dks6aijssnrmg', 'cmphu2e8p000lks6ao8k9ugt4', 'Bazar', 'expense', 'shopping-bag', '#0f766e', 0, '2026-05-23 04:23:42.308', '2026-05-23 04:23:42.308'),
('cmq0sjplj0041ks6abf8bsjiv', 'cmouh1bd70005kswhabvrbt20', 'Posta', 'income', 'shopping-bag', '#0f766e', 0, '2026-06-05 10:38:19.735', '2026-06-05 10:38:19.735'),
('cmq0sk66u0045ks6aqnbtysks', 'cmouh1bd70005kswhabvrbt20', 'Magnit', 'income', 'receipt', '#0f766e', 0, '2026-06-05 10:38:41.238', '2026-06-08 04:08:15.420'),
('cmq5mbfz6005jks6agpr3tvar', 'cmq5ma6dc0057ks6awhn1a01h', 'Car wash', 'income', NULL, '#0f766e', 0, '2026-06-08 19:42:47.202', '2026-06-08 19:42:47.202');

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `symbol` varchar(191) DEFAULT NULL,
  `exchange_rate_to_usd` decimal(14,6) NOT NULL DEFAULT 1.000000,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_synced_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `code`, `name`, `symbol`, `exchange_rate_to_usd`, `is_active`, `last_synced_at`, `created_at`, `updated_at`) VALUES
('cmougxt6i0000ksplllt84745', 'USD', 'US Dollar', '$', 1.000000, 1, '2026-05-06 19:49:46.562', '2026-05-06 19:47:02.778', '2026-05-06 19:49:46.563'),
('cmougxt6n0001kspl51h6novh', 'BDT', 'Bangladeshi Taka', 'Tk', 122.744300, 1, '2026-05-06 19:49:46.599', '2026-05-06 19:47:02.783', '2026-05-06 19:49:46.600'),
('cmougxt6r0002kspl8c6yfqug', 'EUR', 'Euro', 'EUR', 0.854300, 1, '2026-05-06 19:49:46.671', '2026-05-06 19:47:02.787', '2026-05-06 19:49:46.672'),
('cmougxt6t0003ksplrrxxphot', 'RUB', 'Russian Ruble', 'RUB', 75.472900, 1, '2026-05-06 19:49:46.814', '2026-05-06 19:47:02.790', '2026-05-06 19:49:46.815'),
('cmougxteb0005ksplvuoewdqx', 'AED', 'AED', 'AED', 3.672500, 1, '2026-05-06 19:49:46.567', '2026-05-06 19:47:03.059', '2026-05-06 19:49:46.568'),
('cmougxtee0006ksplnqw4vkcx', 'AFN', 'AFN', 'AFN', 63.934700, 1, '2026-05-06 19:49:46.571', '2026-05-06 19:47:03.062', '2026-05-06 19:49:46.573'),
('cmougxteh0007ksplsp4cxm12', 'ALL', 'ALL', 'ALL', 82.053200, 1, '2026-05-06 19:49:46.577', '2026-05-06 19:47:03.065', '2026-05-06 19:49:46.578'),
('cmougxtej0008kspl8jofai33', 'AMD', 'AMD', 'AMD', 370.490100, 1, '2026-05-06 19:49:46.580', '2026-05-06 19:47:03.068', '2026-05-06 19:49:46.581'),
('cmougxteo0009kspl62stk7cs', 'ANG', 'ANG', 'ANG', 1.790000, 1, '2026-05-06 19:49:46.583', '2026-05-06 19:47:03.072', '2026-05-06 19:49:46.583'),
('cmougxtes000akspl20dgalwo', 'AOA', 'AOA', 'AOA', 926.765900, 1, '2026-05-06 19:49:46.585', '2026-05-06 19:47:03.076', '2026-05-06 19:49:46.586'),
('cmougxtev000bksplu28i277d', 'ARS', 'ARS', 'ARS', 1395.190900, 1, '2026-05-06 19:49:46.587', '2026-05-06 19:47:03.080', '2026-05-06 19:49:46.588'),
('cmougxtey000cksplsiepwmyf', 'AUD', 'AUD', 'AUD', 1.391400, 1, '2026-05-06 19:49:46.589', '2026-05-06 19:47:03.082', '2026-05-06 19:49:46.590'),
('cmougxtf2000dksplsw1c7dq3', 'AWG', 'AWG', 'AWG', 1.790000, 1, '2026-05-06 19:49:46.591', '2026-05-06 19:47:03.086', '2026-05-06 19:49:46.592'),
('cmougxtf4000ekspl80fxxw5w', 'AZN', 'AZN', 'AZN', 1.700400, 1, '2026-05-06 19:49:46.593', '2026-05-06 19:47:03.089', '2026-05-06 19:49:46.594'),
('cmougxtf7000fkspl4gtck7jj', 'BAM', 'BAM', 'BAM', 1.671000, 1, '2026-05-06 19:49:46.595', '2026-05-06 19:47:03.091', '2026-05-06 19:49:46.596'),
('cmougxtf8000gkspl5rvf2umz', 'BBD', 'BBD', 'BBD', 2.000000, 1, '2026-05-06 19:49:46.597', '2026-05-06 19:47:03.093', '2026-05-06 19:49:46.598'),
('cmougxtfc000ikspltc6ve1fl', 'BGN', 'BGN', 'BGN', 1.671000, 1, '2026-05-06 19:49:46.601', '2026-05-06 19:47:03.097', '2026-05-06 19:49:46.602'),
('cmougxtfe000jkspl4ebneolf', 'BHD', 'BHD', 'BHD', 0.376000, 1, '2026-05-06 19:49:46.603', '2026-05-06 19:47:03.098', '2026-05-06 19:49:46.604'),
('cmougxtfg000kkspl96oa8zig', 'BIF', 'BIF', 'BIF', 2981.566400, 1, '2026-05-06 19:49:46.605', '2026-05-06 19:47:03.100', '2026-05-06 19:49:46.606'),
('cmougxtfi000lksplwa1gsoe7', 'BMD', 'BMD', 'BMD', 1.000000, 1, '2026-05-06 19:49:46.607', '2026-05-06 19:47:03.102', '2026-05-06 19:49:46.608'),
('cmougxtfk000mksplr9obk8re', 'BND', 'BND', 'BND', 1.275700, 1, '2026-05-06 19:49:46.609', '2026-05-06 19:47:03.104', '2026-05-06 19:49:46.610'),
('cmougxtfn000nksplaimf0sk1', 'BOB', 'BOB', 'BOB', 6.931300, 1, '2026-05-06 19:49:46.611', '2026-05-06 19:47:03.107', '2026-05-06 19:49:46.612'),
('cmougxtfp000oksplq30an0ou', 'BRL', 'BRL', 'BRL', 4.942600, 1, '2026-05-06 19:49:46.613', '2026-05-06 19:47:03.109', '2026-05-06 19:49:46.614'),
('cmougxtfq000pkspl04s5kl2j', 'BSD', 'BSD', 'BSD', 1.000000, 1, '2026-05-06 19:49:46.615', '2026-05-06 19:47:03.111', '2026-05-06 19:49:46.616'),
('cmougxtfs000qkspltmfdgl36', 'BTN', 'BTN', 'BTN', 95.312100, 1, '2026-05-06 19:49:46.618', '2026-05-06 19:47:03.113', '2026-05-06 19:49:46.619'),
('cmougxtfu000rksplkmj8h5g5', 'BWP', 'BWP', 'BWP', 13.872500, 1, '2026-05-06 19:49:46.620', '2026-05-06 19:47:03.115', '2026-05-06 19:49:46.621'),
('cmougxtfx000sksply8g5qqgl', 'BYN', 'BYN', 'BYN', 2.826900, 1, '2026-05-06 19:49:46.623', '2026-05-06 19:47:03.117', '2026-05-06 19:49:46.623'),
('cmougxtfy000tkspl4of7btqe', 'BZD', 'BZD', 'BZD', 2.000000, 1, '2026-05-06 19:49:46.626', '2026-05-06 19:47:03.119', '2026-05-06 19:49:46.626'),
('cmougxtg1000ukspl6cy1ppur', 'CAD', 'CAD', 'CAD', 1.360800, 1, '2026-05-06 19:49:46.628', '2026-05-06 19:47:03.121', '2026-05-06 19:49:46.629'),
('cmougxtg3000vkspln1nzuh28', 'CDF', 'CDF', 'CDF', 2310.437600, 1, '2026-05-06 19:49:46.630', '2026-05-06 19:47:03.123', '2026-05-06 19:49:46.631'),
('cmougxtg5000wksplzqn8n8j2', 'CHF', 'CHF', 'CHF', 0.782600, 1, '2026-05-06 19:49:46.632', '2026-05-06 19:47:03.125', '2026-05-06 19:49:46.633'),
('cmougxtg7000xksplqoi8creo', 'CLF', 'CLF', 'CLF', 0.023090, 1, '2026-05-06 19:49:46.635', '2026-05-06 19:47:03.127', '2026-05-06 19:49:46.635'),
('cmougxtg8000ykspl3156bj0u', 'CLP', 'CLP', 'CLP', 912.486500, 1, '2026-05-06 19:49:46.637', '2026-05-06 19:47:03.129', '2026-05-06 19:49:46.638'),
('cmougxtgb000zkspl7daitq8k', 'CNH', 'CNH', 'CNH', 6.827500, 1, '2026-05-06 19:49:46.640', '2026-05-06 19:47:03.131', '2026-05-06 19:49:46.640'),
('cmougxtgd0010ksplx6rswp5x', 'CNY', 'CNY', 'CNY', 6.839900, 1, '2026-05-06 19:49:46.642', '2026-05-06 19:47:03.133', '2026-05-06 19:49:46.643'),
('cmougxtgf0011kspld15jl73c', 'COP', 'COP', 'COP', 3731.048800, 1, '2026-05-06 19:49:46.644', '2026-05-06 19:47:03.135', '2026-05-06 19:49:46.645'),
('cmougxtgg0012ksplgpgqps70', 'CRC', 'CRC', 'CRC', 455.121900, 1, '2026-05-06 19:49:46.646', '2026-05-06 19:47:03.137', '2026-05-06 19:49:46.647'),
('cmougxtgi0013kspl2t40agfm', 'CUP', 'CUP', 'CUP', 24.000000, 1, '2026-05-06 19:49:46.649', '2026-05-06 19:47:03.138', '2026-05-06 19:49:46.649'),
('cmougxtgk0014kspl4ja62uiw', 'CVE', 'CVE', 'CVE', 94.204600, 1, '2026-05-06 19:49:46.651', '2026-05-06 19:47:03.140', '2026-05-06 19:49:46.651'),
('cmougxtgl0015kspl2eyfjdyz', 'CZK', 'CZK', 'CZK', 20.845200, 1, '2026-05-06 19:49:46.653', '2026-05-06 19:47:03.142', '2026-05-06 19:49:46.653'),
('cmougxtgn0016kspl1anldn14', 'DJF', 'DJF', 'DJF', 177.721000, 1, '2026-05-06 19:49:46.655', '2026-05-06 19:47:03.143', '2026-05-06 19:49:46.655'),
('cmougxtgp0017kspl37h25m3z', 'DKK', 'DKK', 'DKK', 6.378500, 1, '2026-05-06 19:49:46.656', '2026-05-06 19:47:03.145', '2026-05-06 19:49:46.657'),
('cmougxtgq0018kspl5gy3chio', 'DOP', 'DOP', 'DOP', 59.584900, 1, '2026-05-06 19:49:46.658', '2026-05-06 19:47:03.147', '2026-05-06 19:49:46.659'),
('cmougxtgs0019kspl3fg9zo3a', 'DZD', 'DZD', 'DZD', 132.512000, 1, '2026-05-06 19:49:46.660', '2026-05-06 19:47:03.148', '2026-05-06 19:49:46.661'),
('cmougxtgu001aksplshnjx1cx', 'EGP', 'EGP', 'EGP', 53.691300, 1, '2026-05-06 19:49:46.662', '2026-05-06 19:47:03.150', '2026-05-06 19:49:46.663'),
('cmougxtgv001bkspl36uezr5a', 'ERN', 'ERN', 'ERN', 15.000000, 1, '2026-05-06 19:49:46.665', '2026-05-06 19:47:03.152', '2026-05-06 19:49:46.665'),
('cmougxtgx001ckspln4s4h5sz', 'ETB', 'ETB', 'ETB', 156.305000, 1, '2026-05-06 19:49:46.667', '2026-05-06 19:47:03.153', '2026-05-06 19:49:46.667'),
('cmougxth1001eksplx88e1dto', 'FJD', 'FJD', 'FJD', 2.199500, 1, '2026-05-06 19:49:46.674', '2026-05-06 19:47:03.157', '2026-05-06 19:49:46.674'),
('cmougxth2001fksplav6brncm', 'FKP', 'FKP', 'FKP', 0.737700, 1, '2026-05-06 19:49:46.676', '2026-05-06 19:47:03.159', '2026-05-06 19:49:46.677'),
('cmougxth4001gksplpbwvw5gs', 'FOK', 'FOK', 'FOK', 6.378600, 1, '2026-05-06 19:49:46.678', '2026-05-06 19:47:03.160', '2026-05-06 19:49:46.679'),
('cmougxth6001hkspl4qx51bcy', 'GBP', 'GBP', 'GBP', 0.737700, 1, '2026-05-06 19:49:46.680', '2026-05-06 19:47:03.162', '2026-05-06 19:49:46.681'),
('cmougxth8001iksplrk8n0rkd', 'GEL', 'GEL', 'GEL', 2.685900, 1, '2026-05-06 19:49:46.683', '2026-05-06 19:47:03.164', '2026-05-06 19:49:46.684'),
('cmougxth9001jksplkndiza5y', 'GGP', 'GGP', 'GGP', 0.737700, 1, '2026-05-06 19:49:46.685', '2026-05-06 19:47:03.166', '2026-05-06 19:49:46.686'),
('cmougxthb001kksplnojpt468', 'GHS', 'GHS', 'GHS', 11.225900, 1, '2026-05-06 19:49:46.687', '2026-05-06 19:47:03.168', '2026-05-06 19:49:46.688'),
('cmougxthd001lksplxlc0ot4k', 'GIP', 'GIP', 'GIP', 0.737700, 1, '2026-05-06 19:49:46.689', '2026-05-06 19:47:03.169', '2026-05-06 19:49:46.690'),
('cmougxthe001mksplg4507ddt', 'GMD', 'GMD', 'GMD', 74.156700, 1, '2026-05-06 19:49:46.691', '2026-05-06 19:47:03.171', '2026-05-06 19:49:46.692'),
('cmougxthg001nkspl6p4xhas9', 'GNF', 'GNF', 'GNF', 8768.331600, 1, '2026-05-06 19:49:46.693', '2026-05-06 19:47:03.173', '2026-05-06 19:49:46.694'),
('cmougxthi001oksplt5j15szv', 'GTQ', 'GTQ', 'GTQ', 7.637200, 1, '2026-05-06 19:49:46.695', '2026-05-06 19:47:03.174', '2026-05-06 19:49:46.696'),
('cmougxthk001pkspl7iy5elt9', 'GYD', 'GYD', 'GYD', 209.181800, 1, '2026-05-06 19:49:46.697', '2026-05-06 19:47:03.176', '2026-05-06 19:49:46.698'),
('cmougxthm001qkspl3v8apdco', 'HKD', 'HKD', 'HKD', 7.836000, 1, '2026-05-06 19:49:46.699', '2026-05-06 19:47:03.178', '2026-05-06 19:49:46.700'),
('cmougxtho001rkspljo0lmbop', 'HNL', 'HNL', 'HNL', 26.632000, 1, '2026-05-06 19:49:46.701', '2026-05-06 19:47:03.181', '2026-05-06 19:49:46.702'),
('cmougxthq001skspldt2lfptl', 'HRK', 'HRK', 'HRK', 6.437100, 1, '2026-05-06 19:49:46.703', '2026-05-06 19:47:03.183', '2026-05-06 19:49:46.704'),
('cmougxths001tksplnsj78nd6', 'HTG', 'HTG', 'HTG', 130.788600, 1, '2026-05-06 19:49:46.705', '2026-05-06 19:47:03.185', '2026-05-06 19:49:46.706'),
('cmougxthu001uksplefqbka2w', 'HUF', 'HUF', 'HUF', 309.124000, 1, '2026-05-06 19:49:46.707', '2026-05-06 19:47:03.187', '2026-05-06 19:49:46.708'),
('cmougxthx001vkspl8qjikpej', 'IDR', 'IDR', 'IDR', 17431.740900, 1, '2026-05-06 19:49:46.709', '2026-05-06 19:47:03.189', '2026-05-06 19:49:46.710'),
('cmougxthz001wksplx5rtgrmu', 'ILS', 'ILS', 'ILS', 2.943900, 1, '2026-05-06 19:49:46.711', '2026-05-06 19:47:03.191', '2026-05-06 19:49:46.712'),
('cmougxti1001xksplcfd4o4rs', 'IMP', 'IMP', 'IMP', 0.737700, 1, '2026-05-06 19:49:46.713', '2026-05-06 19:47:03.193', '2026-05-06 19:49:46.713'),
('cmougxti3001yksplksykqsis', 'INR', 'INR', 'INR', 95.312500, 1, '2026-05-06 19:49:46.715', '2026-05-06 19:47:03.195', '2026-05-06 19:49:46.715'),
('cmougxti5001zkspl9xgzvp4v', 'IQD', 'IQD', 'IQD', 1309.623300, 1, '2026-05-06 19:49:46.717', '2026-05-06 19:47:03.197', '2026-05-06 19:49:46.717'),
('cmougxti70020ksplleejt31e', 'IRR', 'IRR', 'IRR', 1217650.307500, 1, '2026-05-06 19:49:46.719', '2026-05-06 19:47:03.199', '2026-05-06 19:49:46.720'),
('cmougxti90021ksplyp5p31vr', 'ISK', 'ISK', 'ISK', 122.700500, 1, '2026-05-06 19:49:46.721', '2026-05-06 19:47:03.201', '2026-05-06 19:49:46.722'),
('cmougxtib0022ksplpx6dljxe', 'JEP', 'JEP', 'JEP', 0.737700, 1, '2026-05-06 19:49:46.723', '2026-05-06 19:47:03.203', '2026-05-06 19:49:46.724'),
('cmougxtif0023kspl3btbd9rz', 'JMD', 'JMD', 'JMD', 157.495500, 1, '2026-05-06 19:49:46.725', '2026-05-06 19:47:03.208', '2026-05-06 19:49:46.726'),
('cmougxtii0024ksplo76mtqgb', 'JOD', 'JOD', 'JOD', 0.709000, 1, '2026-05-06 19:49:46.727', '2026-05-06 19:47:03.210', '2026-05-06 19:49:46.728'),
('cmougxtik0025kspl8b4e614f', 'JPY', 'JPY', 'JPY', 157.666200, 1, '2026-05-06 19:49:46.729', '2026-05-06 19:47:03.213', '2026-05-06 19:49:46.729'),
('cmougxtim0026kspl2bcmrmtl', 'KES', 'KES', 'KES', 129.179300, 1, '2026-05-06 19:49:46.731', '2026-05-06 19:47:03.215', '2026-05-06 19:49:46.731'),
('cmougxtip0027ksplp3sibo8y', 'KGS', 'KGS', 'KGS', 87.521900, 1, '2026-05-06 19:49:46.732', '2026-05-06 19:47:03.217', '2026-05-06 19:49:46.733'),
('cmougxtiq0028ksplshg4fl1e', 'KHR', 'KHR', 'KHR', 4031.874400, 1, '2026-05-06 19:49:46.734', '2026-05-06 19:47:03.219', '2026-05-06 19:49:46.735'),
('cmougxtit0029ksplxpiywpz9', 'KID', 'KID', 'KID', 1.391600, 1, '2026-05-06 19:49:46.736', '2026-05-06 19:47:03.221', '2026-05-06 19:49:46.737'),
('cmougxtiv002aksplodmloyg4', 'KMF', 'KMF', 'KMF', 420.311300, 1, '2026-05-06 19:49:46.738', '2026-05-06 19:47:03.223', '2026-05-06 19:49:46.739'),
('cmougxtix002bksplpcyu5gpw', 'KRW', 'KRW', 'KRW', 1469.386900, 1, '2026-05-06 19:49:46.740', '2026-05-06 19:47:03.226', '2026-05-06 19:49:46.741'),
('cmougxtj0002cksplinzp73q9', 'KWD', 'KWD', 'KWD', 0.307900, 1, '2026-05-06 19:49:46.742', '2026-05-06 19:47:03.228', '2026-05-06 19:49:46.743'),
('cmougxtj4002dkspljulwqd12', 'KYD', 'KYD', 'KYD', 0.833300, 1, '2026-05-06 19:49:46.744', '2026-05-06 19:47:03.232', '2026-05-06 19:49:46.745'),
('cmougxtja002ekspl7lamcffm', 'KZT', 'KZT', 'KZT', 464.514800, 1, '2026-05-06 19:49:46.746', '2026-05-06 19:47:03.238', '2026-05-06 19:49:46.746'),
('cmougxtjg002fkspl3qsll4i1', 'LAK', 'LAK', 'LAK', 21936.768000, 1, '2026-05-06 19:49:46.747', '2026-05-06 19:47:03.244', '2026-05-06 19:49:46.748'),
('cmougxtjl002gkspl2yiieq5f', 'LBP', 'LBP', 'LBP', 89500.000000, 1, '2026-05-06 19:49:46.749', '2026-05-06 19:47:03.249', '2026-05-06 19:49:46.750'),
('cmougxtjq002hkspldtioz010', 'LKR', 'LKR', 'LKR', 319.752000, 1, '2026-05-06 19:49:46.751', '2026-05-06 19:47:03.254', '2026-05-06 19:49:46.751'),
('cmougxtju002iksplupfjsa7n', 'LRD', 'LRD', 'LRD', 183.621800, 1, '2026-05-06 19:49:46.753', '2026-05-06 19:47:03.258', '2026-05-06 19:49:46.753'),
('cmougxtjy002jksplv5pqqx79', 'LSL', 'LSL', 'LSL', 16.635400, 1, '2026-05-06 19:49:46.755', '2026-05-06 19:47:03.262', '2026-05-06 19:49:46.755'),
('cmougxtk1002kksplnrczgx50', 'LYD', 'LYD', 'LYD', 6.329200, 1, '2026-05-06 19:49:46.757', '2026-05-06 19:47:03.266', '2026-05-06 19:49:46.757'),
('cmougxtk4002lkspl0xltqprb', 'MAD', 'MAD', 'MAD', 9.231400, 1, '2026-05-06 19:49:46.759', '2026-05-06 19:47:03.269', '2026-05-06 19:49:46.759'),
('cmougxtk8002mkspl1qlrr9ud', 'MDL', 'MDL', 'MDL', 17.210900, 1, '2026-05-06 19:49:46.761', '2026-05-06 19:47:03.272', '2026-05-06 19:49:46.761'),
('cmougxtkb002nkspl6vpiv1da', 'MGA', 'MGA', 'MGA', 4145.912100, 1, '2026-05-06 19:49:46.763', '2026-05-06 19:47:03.275', '2026-05-06 19:49:46.763'),
('cmougxtkd002okspl7cuvrorg', 'MKD', 'MKD', 'MKD', 52.731300, 1, '2026-05-06 19:49:46.765', '2026-05-06 19:47:03.278', '2026-05-06 19:49:46.765'),
('cmougxtkg002pksplljw59qb8', 'MMK', 'MMK', 'MMK', 2099.893800, 1, '2026-05-06 19:49:46.766', '2026-05-06 19:47:03.280', '2026-05-06 19:49:46.767'),
('cmougxtki002qksplejt3fife', 'MNT', 'MNT', 'MNT', 3577.842300, 1, '2026-05-06 19:49:46.769', '2026-05-06 19:47:03.283', '2026-05-06 19:49:46.769'),
('cmougxtkn002rksplnre9mgv1', 'MOP', 'MOP', 'MOP', 8.071000, 1, '2026-05-06 19:49:46.770', '2026-05-06 19:47:03.287', '2026-05-06 19:49:46.771'),
('cmougxtkr002skspl38exhsxw', 'MRU', 'MRU', 'MRU', 39.961800, 1, '2026-05-06 19:49:46.772', '2026-05-06 19:47:03.291', '2026-05-06 19:49:46.773'),
('cmougxtku002tksplx0zdpw2p', 'MUR', 'MUR', 'MUR', 46.942500, 1, '2026-05-06 19:49:46.774', '2026-05-06 19:47:03.294', '2026-05-06 19:49:46.775'),
('cmougxtkw002ukspl0pgatddm', 'MVR', 'MVR', 'MVR', 15.450700, 1, '2026-05-06 19:49:46.776', '2026-05-06 19:47:03.297', '2026-05-06 19:49:46.776'),
('cmougxtl3002vksplv4k3drol', 'MWK', 'MWK', 'MWK', 1742.439900, 1, '2026-05-06 19:49:46.777', '2026-05-06 19:47:03.303', '2026-05-06 19:49:46.778'),
('cmougxtl6002wkspl066mq97s', 'MXN', 'MXN', 'MXN', 17.389500, 1, '2026-05-06 19:49:46.780', '2026-05-06 19:47:03.306', '2026-05-06 19:49:46.780'),
('cmougxtl8002xkspluwnj4qos', 'MYR', 'MYR', 'MYR', 3.963300, 1, '2026-05-06 19:49:46.781', '2026-05-06 19:47:03.309', '2026-05-06 19:49:46.782'),
('cmougxtlb002ykspl0hhtuqzi', 'MZN', 'MZN', 'MZN', 63.587400, 1, '2026-05-06 19:49:46.783', '2026-05-06 19:47:03.311', '2026-05-06 19:49:46.784'),
('cmougxtld002zksplo8uh7r2q', 'NAD', 'NAD', 'NAD', 16.635400, 1, '2026-05-06 19:49:46.785', '2026-05-06 19:47:03.313', '2026-05-06 19:49:46.785'),
('cmougxtlf0030kspl52vn6e38', 'NGN', 'NGN', 'NGN', 1366.120800, 1, '2026-05-06 19:49:46.787', '2026-05-06 19:47:03.316', '2026-05-06 19:49:46.788'),
('cmougxtli0031kspljbk0xiao', 'NIO', 'NIO', 'NIO', 36.821300, 1, '2026-05-06 19:49:46.789', '2026-05-06 19:47:03.318', '2026-05-06 19:49:46.790'),
('cmougxtlk0032kspl2bdekjqv', 'NOK', 'NOK', 'NOK', 9.250000, 1, '2026-05-06 19:49:46.791', '2026-05-06 19:47:03.320', '2026-05-06 19:49:46.791'),
('cmougxtlm0033ksplzhlhyzdt', 'NPR', 'NPR', 'NPR', 152.499400, 1, '2026-05-06 19:49:46.792', '2026-05-06 19:47:03.323', '2026-05-06 19:49:46.793'),
('cmougxtlo0034kspl1tayukzf', 'NZD', 'NZD', 'NZD', 1.695700, 1, '2026-05-06 19:49:46.794', '2026-05-06 19:47:03.325', '2026-05-06 19:49:46.795'),
('cmougxtlq0035kspl72j4lhta', 'OMR', 'OMR', 'OMR', 0.384500, 1, '2026-05-06 19:49:46.796', '2026-05-06 19:47:03.327', '2026-05-06 19:49:46.796'),
('cmougxtls0036ksplmkfrmc19', 'PAB', 'PAB', 'PAB', 1.000000, 1, '2026-05-06 19:49:46.797', '2026-05-06 19:47:03.329', '2026-05-06 19:49:46.798'),
('cmougxtlu0037ksplys9zbq0p', 'PEN', 'PEN', 'PEN', 3.499200, 1, '2026-05-06 19:49:46.799', '2026-05-06 19:47:03.330', '2026-05-06 19:49:46.799'),
('cmougxtlw0038ksplod497paj', 'PGK', 'PGK', 'PGK', 4.345300, 1, '2026-05-06 19:49:46.800', '2026-05-06 19:47:03.332', '2026-05-06 19:49:46.801'),
('cmougxtly0039ksplcwjnwg8w', 'PHP', 'PHP', 'PHP', 61.554400, 1, '2026-05-06 19:49:46.802', '2026-05-06 19:47:03.334', '2026-05-06 19:49:46.803'),
('cmougxtm0003akspl81mpr4uj', 'PKR', 'PKR', 'PKR', 279.009900, 1, '2026-05-06 19:49:46.804', '2026-05-06 19:47:03.336', '2026-05-06 19:49:46.804'),
('cmougxtm2003bkspldc4b684n', 'PLN', 'PLN', 'PLN', 3.630700, 1, '2026-05-06 19:49:46.805', '2026-05-06 19:47:03.338', '2026-05-06 19:49:46.806'),
('cmougxtm4003cksplfuuh4l8v', 'PYG', 'PYG', 'PYG', 6196.800500, 1, '2026-05-06 19:49:46.807', '2026-05-06 19:47:03.340', '2026-05-06 19:49:46.808'),
('cmougxtm6003dksplbd51w5eo', 'QAR', 'QAR', 'QAR', 3.640000, 1, '2026-05-06 19:49:46.809', '2026-05-06 19:47:03.342', '2026-05-06 19:49:46.809'),
('cmougxtm8003eksplshdz08w6', 'RON', 'RON', 'RON', 4.465500, 1, '2026-05-06 19:49:46.810', '2026-05-06 19:47:03.344', '2026-05-06 19:49:46.811'),
('cmougxtma003fksplg9cxm58z', 'RSD', 'RSD', 'RSD', 100.451500, 1, '2026-05-06 19:49:46.812', '2026-05-06 19:47:03.346', '2026-05-06 19:49:46.813'),
('cmougxtmf003hksplpht1d1ub', 'RWF', 'RWF', 'RWF', 1463.475500, 1, '2026-05-06 19:49:46.816', '2026-05-06 19:47:03.351', '2026-05-06 19:49:46.817'),
('cmougxtmh003iksplounmdhuu', 'SAR', 'SAR', 'SAR', 3.750000, 1, '2026-05-06 19:49:46.818', '2026-05-06 19:47:03.353', '2026-05-06 19:49:46.819'),
('cmougxtmj003jkspl3pp0a11z', 'SBD', 'SBD', 'SBD', 7.940200, 1, '2026-05-06 19:49:46.820', '2026-05-06 19:47:03.355', '2026-05-06 19:49:46.820'),
('cmougxtml003kkspleiqqulv6', 'SCR', 'SCR', 'SCR', 14.387300, 1, '2026-05-06 19:49:46.821', '2026-05-06 19:47:03.357', '2026-05-06 19:49:46.822'),
('cmougxtmn003lksplbbrf9efm', 'SDG', 'SDG', 'SDG', 449.572400, 1, '2026-05-06 19:49:46.823', '2026-05-06 19:47:03.359', '2026-05-06 19:49:46.824'),
('cmougxtmp003mkspll146zpvs', 'SEK', 'SEK', 'SEK', 9.260900, 1, '2026-05-06 19:49:46.825', '2026-05-06 19:47:03.361', '2026-05-06 19:49:46.826'),
('cmougxtmr003nkspl8kynwc06', 'SGD', 'SGD', 'SGD', 1.275700, 1, '2026-05-06 19:49:46.827', '2026-05-06 19:47:03.363', '2026-05-06 19:49:46.827'),
('cmougxtmt003okspl2rbaxjp7', 'SHP', 'SHP', 'SHP', 0.737700, 1, '2026-05-06 19:49:46.828', '2026-05-06 19:47:03.365', '2026-05-06 19:49:46.829'),
('cmougxtmu003pksplb50sqk5g', 'SLE', 'SLE', 'SLE', 24.673400, 1, '2026-05-06 19:49:46.830', '2026-05-06 19:47:03.367', '2026-05-06 19:49:46.831'),
('cmougxtmw003qkspl4cucnf27', 'SLL', 'SLL', 'SLL', 24673.436700, 1, '2026-05-06 19:49:46.832', '2026-05-06 19:47:03.369', '2026-05-06 19:49:46.833'),
('cmougxtmy003rkspl5pucbwar', 'SOS', 'SOS', 'SOS', 571.732200, 1, '2026-05-06 19:49:46.834', '2026-05-06 19:47:03.370', '2026-05-06 19:49:46.835'),
('cmougxtn0003skspl1fkwduyq', 'SRD', 'SRD', 'SRD', 37.563000, 1, '2026-05-06 19:49:46.836', '2026-05-06 19:47:03.373', '2026-05-06 19:49:46.836'),
('cmougxtn2003tksplma11ifcw', 'SSP', 'SSP', 'SSP', 4636.181200, 1, '2026-05-06 19:49:46.838', '2026-05-06 19:47:03.375', '2026-05-06 19:49:46.838'),
('cmougxtn4003ukspl23dryv0z', 'STN', 'STN', 'STN', 20.931500, 1, '2026-05-06 19:49:46.840', '2026-05-06 19:47:03.376', '2026-05-06 19:49:46.840'),
('cmougxtn6003vksplk22hy44i', 'SYP', 'SYP', 'SYP', 112.361200, 1, '2026-05-06 19:49:46.842', '2026-05-06 19:47:03.378', '2026-05-06 19:49:46.843'),
('cmougxtn8003wkspl2stafpux', 'SZL', 'SZL', 'SZL', 16.635400, 1, '2026-05-06 19:49:46.844', '2026-05-06 19:47:03.380', '2026-05-06 19:49:46.845'),
('cmougxtna003xkspln0i5kys5', 'THB', 'THB', 'THB', 32.540600, 1, '2026-05-06 19:49:46.847', '2026-05-06 19:47:03.382', '2026-05-06 19:49:46.847'),
('cmougxtnc003ykspl3lsp7pv2', 'TJS', 'TJS', 'TJS', 9.378200, 1, '2026-05-06 19:49:46.849', '2026-05-06 19:47:03.385', '2026-05-06 19:49:46.850'),
('cmougxtne003zkspl9csogqas', 'TMT', 'TMT', 'TMT', 3.500000, 1, '2026-05-06 19:49:46.852', '2026-05-06 19:47:03.386', '2026-05-06 19:49:46.852'),
('cmougxtng0040ksplcxme8jp0', 'TND', 'TND', 'TND', 2.890500, 1, '2026-05-06 19:49:46.857', '2026-05-06 19:47:03.388', '2026-05-06 19:49:46.858'),
('cmougxtni0041ksplstqr8a04', 'TOP', 'TOP', 'TOP', 2.361400, 1, '2026-05-06 19:49:46.860', '2026-05-06 19:47:03.390', '2026-05-06 19:49:46.861'),
('cmougxtnj0042ksplb42iwhc4', 'TRY', 'TRY', 'TRY', 45.244800, 1, '2026-05-06 19:49:46.863', '2026-05-06 19:47:03.392', '2026-05-06 19:49:46.863'),
('cmougxtnl0043kspl64upy77g', 'TTD', 'TTD', 'TTD', 6.740300, 1, '2026-05-06 19:49:46.865', '2026-05-06 19:47:03.394', '2026-05-06 19:49:46.866'),
('cmougxtno0044ksply5h878h1', 'TVD', 'TVD', 'TVD', 1.391600, 1, '2026-05-06 19:49:46.868', '2026-05-06 19:47:03.396', '2026-05-06 19:49:46.868'),
('cmougxtnq0045kspl8wa0mt80', 'TWD', 'TWD', 'TWD', 31.618700, 1, '2026-05-06 19:49:46.870', '2026-05-06 19:47:03.398', '2026-05-06 19:49:46.871'),
('cmougxtnr0046ksplus6fu4cy', 'TZS', 'TZS', 'TZS', 2606.085300, 1, '2026-05-06 19:49:46.872', '2026-05-06 19:47:03.400', '2026-05-06 19:49:46.873'),
('cmougxtnt0047kspl4vz6bz6h', 'UAH', 'UAH', 'UAH', 44.004000, 1, '2026-05-06 19:49:46.874', '2026-05-06 19:47:03.402', '2026-05-06 19:49:46.875'),
('cmougxtnv0048kspls9vryfxv', 'UGX', 'UGX', 'UGX', 3730.248400, 1, '2026-05-06 19:49:46.878', '2026-05-06 19:47:03.403', '2026-05-06 19:49:46.879'),
('cmougxtnx0049kspl5vtour8n', 'UYU', 'UYU', 'UYU', 40.280200, 1, '2026-05-06 19:49:46.882', '2026-05-06 19:47:03.405', '2026-05-06 19:49:46.882'),
('cmougxtnz004aksplq03ngfg6', 'UZS', 'UZS', 'UZS', 11960.663800, 1, '2026-05-06 19:49:46.884', '2026-05-06 19:47:03.407', '2026-05-06 19:49:46.885'),
('cmougxto1004bkspluiay1wf7', 'VES', 'VES', 'VES', 493.376500, 1, '2026-05-06 19:49:46.887', '2026-05-06 19:47:03.409', '2026-05-06 19:49:46.888'),
('cmougxto3004cksplk1tzg0qo', 'VND', 'VND', 'VND', 26213.373700, 1, '2026-05-06 19:49:46.889', '2026-05-06 19:47:03.411', '2026-05-06 19:49:46.890'),
('cmougxto5004dksplacg1aocw', 'VUV', 'VUV', 'VUV', 117.928500, 1, '2026-05-06 19:49:46.891', '2026-05-06 19:47:03.413', '2026-05-06 19:49:46.892'),
('cmougxto7004ekspl93j2a4z6', 'WST', 'WST', 'WST', 2.688400, 1, '2026-05-06 19:49:46.893', '2026-05-06 19:47:03.415', '2026-05-06 19:49:46.894'),
('cmougxto9004fkspl0mnzhu3b', 'XAF', 'XAF', 'XAF', 560.415100, 1, '2026-05-06 19:49:46.895', '2026-05-06 19:47:03.418', '2026-05-06 19:49:46.896'),
('cmougxtob004gkspl26oa5k5k', 'XCD', 'XCD', 'XCD', 2.700000, 1, '2026-05-06 19:49:46.898', '2026-05-06 19:47:03.420', '2026-05-06 19:49:46.898'),
('cmougxtod004hkspl8enqt0bu', 'XCG', 'XCG', 'XCG', 1.790000, 1, '2026-05-06 19:49:46.899', '2026-05-06 19:47:03.422', '2026-05-06 19:49:46.900'),
('cmougxtof004ikspl7vd8x1r7', 'XDR', 'XDR', 'XDR', 0.729700, 1, '2026-05-06 19:49:46.901', '2026-05-06 19:47:03.424', '2026-05-06 19:49:46.901'),
('cmougxtoh004jkspl1suxfxcv', 'XOF', 'XOF', 'XOF', 560.415100, 1, '2026-05-06 19:49:46.902', '2026-05-06 19:47:03.426', '2026-05-06 19:49:46.903'),
('cmougxtoj004kkspl124corcc', 'XPF', 'XPF', 'XPF', 101.951000, 1, '2026-05-06 19:49:46.904', '2026-05-06 19:47:03.427', '2026-05-06 19:49:46.905'),
('cmougxtol004lksplx6kirdyr', 'YER', 'YER', 'YER', 238.635000, 1, '2026-05-06 19:49:46.906', '2026-05-06 19:47:03.429', '2026-05-06 19:49:46.907'),
('cmougxtom004mksplexrkkru1', 'ZAR', 'ZAR', 'ZAR', 16.632000, 1, '2026-05-06 19:49:46.908', '2026-05-06 19:47:03.431', '2026-05-06 19:49:46.909'),
('cmougxtoo004nksplas6er24v', 'ZMW', 'ZMW', 'ZMW', 18.853700, 1, '2026-05-06 19:49:46.910', '2026-05-06 19:47:03.433', '2026-05-06 19:49:46.910'),
('cmougxtoq004oksplchzqml6z', 'ZWG', 'ZWG', 'ZWG', 25.497600, 1, '2026-05-06 19:49:46.911', '2026-05-06 19:47:03.434', '2026-05-06 19:49:46.912'),
('cmougxtor004pksplte8lytsq', 'ZWL', 'ZWL', 'ZWL', 25.497600, 1, '2026-05-06 19:49:46.913', '2026-05-06 19:47:03.436', '2026-05-06 19:49:46.914');

-- --------------------------------------------------------

--
-- Table structure for table `custom_pages`
--

CREATE TABLE `custom_pages` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `short_description` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `meta_title` varchar(191) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `published_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `custom_pages`
--

INSERT INTO `custom_pages` (`id`, `title`, `slug`, `short_description`, `content`, `meta_title`, `meta_description`, `meta_keywords`, `status`, `created_at`, `updated_at`, `published_at`) VALUES
('cmpf3o121000pkslqo6i0m2zm', 'Privacy Policy', 'privacy-policy', 'This is policy', '<p>This is policy</p>', NULL, NULL, NULL, 'published', '2026-05-21 06:18:41.114', '2026-05-21 06:19:46.548', '2026-05-21 06:18:41.113'),
('cmpf3q96i000qkslqdriijotn', 'Terms of Service', 'terms-of-service', 'Terms of Service', '<p>Terms of Service</p>', NULL, NULL, NULL, 'published', '2026-05-21 06:20:24.954', '2026-05-21 06:20:24.954', '2026-05-21 06:20:24.953');

-- --------------------------------------------------------

--
-- Table structure for table `DebtLoan`
--

CREATE TABLE `DebtLoan` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `person_name` varchar(191) NOT NULL,
  `type` enum('borrowed','lent') NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `paid_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `due_date` datetime(3) DEFAULT NULL,
  `status` enum('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
  `note` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DebtPayment`
--

CREATE TABLE `DebtPayment` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `debt_loan_id` varchar(191) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `note` varchar(191) DEFAULT NULL,
  `payment_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ExportLog`
--

CREATE TABLE `ExportLog` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `format` varchar(191) NOT NULL,
  `resource` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `FinanceGroup`
--

CREATE TABLE `FinanceGroup` (
  `id` varchar(191) NOT NULL,
  `owner_id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `FinanceGroupInvite`
--

CREATE TABLE `FinanceGroupInvite` (
  `id` varchar(191) NOT NULL,
  `group_id` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `created_by_id` varchar(191) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `max_uses` int(11) NOT NULL DEFAULT 25,
  `uses_count` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `FinanceGroupMember`
--

CREATE TABLE `FinanceGroupMember` (
  `id` varchar(191) NOT NULL,
  `group_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `role` enum('owner','admin','member','viewer') NOT NULL DEFAULT 'member',
  `status` enum('invited','active','suspended') NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `GroupMessage`
--

CREATE TABLE `GroupMessage` (
  `id` varchar(191) NOT NULL,
  `group_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Notification`
--

CREATE TABLE `Notification` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `type` enum('budget','bill','balance','savings','insight','system') NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `action_url` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Notification`
--

INSERT INTO `Notification` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `action_url`, `created_at`) VALUES
('cmpbao9sn0003ksxjds58tnlh', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-18 14:23:45.047'),
('cmpc5leiu0003ks658rsvojjc', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-19 04:49:19.302'),
('cmpcl2kav0007ks6583g11l4p', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-19 12:02:34.184'),
('cmpezzjoe0007kslqiftxg0at', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-21 04:35:39.999'),
('cmpfdlz0e0007ks6axk7dgn7t', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-21 10:57:01.310'),
('cmpfrcj2j000bks6aicfjbyjb', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-21 17:21:35.372'),
('cmphsoza4000fks6awnp4bbjg', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-23 03:34:48.221'),
('cmphtxcjp000jks6a39yfhxbw', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-23 04:09:18.277'),
('cmphu6a4m000vks6aoil13r0f', 'cmphu2e8p000lks6ao8k9ugt4', 'New wallet created', 'Wallet \"Cash\" was added successfully.', 'balance', 0, '/dashboard/wallets', '2026-05-23 04:16:15.047'),
('cmphu86a8000zks6avq9mpbeo', 'cmphu2e8p000lks6ao8k9ugt4', 'Category created', 'Category \"Car wash\" is ready to use.', 'system', 0, '/dashboard/categories', '2026-05-23 04:17:43.376'),
('cmphuby4w0013ks6awdmex9yz', 'cmphu2e8p000lks6ao8k9ugt4', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-05-23 04:20:39.440'),
('cmphucs2u0017ks6ay7h5fexx', 'cmphu2e8p000lks6ao8k9ugt4', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-05-23 04:21:18.247'),
('cmphuf1ue001bks6avzp630ph', 'cmphu2e8p000lks6ao8k9ugt4', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-05-23 04:23:04.214'),
('cmphufv8n001fks6al9hi1c46', 'cmphu2e8p000lks6ao8k9ugt4', 'Category created', 'Category \"Bazar\" is ready to use.', 'system', 0, '/dashboard/categories', '2026-05-23 04:23:42.311'),
('cmpinlep9001lks6a0sisxab5', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-23 17:59:49.677'),
('cmpk1fnxa001pks6adk0o6fnv', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-24 17:15:02.494'),
('cmpkpzhl6001tks6alac9p0cu', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-25 04:42:18.187'),
('cmpln7qwk001xks6alf4bkd6y', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-25 20:12:30.836'),
('cmpob9byr0021ks6azyznb8qo', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-27 17:01:07.923'),
('cmppgbbvi0025ks6a5qitp4ja', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-28 12:10:25.374'),
('cmpqfih7a002bks6abgbuz3u6', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-29 04:35:45.431'),
('cmpr4h6qq002fks6av5kf2sym', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-29 16:14:35.618'),
('cmptc1dqj002jks6a9glzhurd', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-05-31 05:21:47.468'),
('cmpum8jnb002pks6av2xs40w8', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-01 02:55:04.055'),
('cmpw6c933002vks6amuw3d4zd', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-02 05:05:35.488'),
('cmpw8psqh0031ks6ajteexv55', 'cmphu2e8p000lks6ao8k9ugt4', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-02 06:12:06.713'),
('cmpwfsm7k0035ks6amr49jx75', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-02 09:30:15.536'),
('cmpxkthq90039ks6aixi0403x', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-03 04:38:40.642'),
('cmpydd49v003dks6a047nztyf', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-03 17:57:45.571'),
('cmpydfam6003hks6acmpwg602', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-03 17:59:27.103'),
('cmpz1e0my003lks6a6bn9g6cd', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-04 05:10:18.298'),
('cmpzl3mi4003pks6a4ifqzkxq', 'cmphu2e8p000lks6ao8k9ugt4', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-04 14:22:05.740'),
('cmq0iqwtl003tks6askl5gmiv', 'cmphu2e8p000lks6ao8k9ugt4', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-05 06:03:59.529'),
('cmq0itk93003xks6axjah7h76', 'cmphu2e8p000lks6ao8k9ugt4', 'New expense added', 'A new transaction was saved to your account.', 'balance', 0, '/dashboard', '2026-06-05 06:06:03.207'),
('cmq0sjplm0043ks6a76d5eqwa', 'cmouh1bd70005kswhabvrbt20', 'Category created', 'Category \"Posta\" is ready to use.', 'system', 1, '/dashboard/categories', '2026-06-05 10:38:19.738'),
('cmq0sk66y0047ks6acg1elou8', 'cmouh1bd70005kswhabvrbt20', 'Category created', 'Category \"Magnit\" is ready to use.', 'system', 1, '/dashboard/categories', '2026-06-05 10:38:41.242'),
('cmq0skp39004bks6akyb86hqx', 'cmouh1bd70005kswhabvrbt20', 'New wallet created', 'Wallet \"Posta\" was added successfully.', 'balance', 1, '/dashboard/wallets', '2026-06-05 10:39:05.734'),
('cmq0sl3yt004fks6a5vw01xgy', 'cmouh1bd70005kswhabvrbt20', 'New wallet created', 'Wallet \"Magnit\" was added successfully.', 'balance', 1, '/dashboard/wallets', '2026-06-05 10:39:25.013'),
('cmq1clb8l004jks6aqc4ipnas', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-05 19:59:26.758'),
('cmq1twyi9004nks6atvamymq9', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-06 04:04:23.601'),
('cmq2fn5mc004rks6az7q43tho', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-06 14:12:37.813'),
('cmq4owgmm004vks6a2tiybvso', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-08 04:07:20.878'),
('cmq508vhz004zks6ancwmfn8u', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-08 09:24:55.799'),
('cmq5di4hc0055ks6aux2uxig7', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-08 15:36:02.353'),
('cmq5maws3005hks6as2vm20rp', 'cmq5ma6dc0057ks6awhn1a01h', 'New wallet created', 'Wallet \"Car wash\" was added successfully.', 'balance', 0, '/dashboard/wallets', '2026-06-08 19:42:22.324'),
('cmq5mbfzb005lks6apiskbv34', 'cmq5ma6dc0057ks6awhn1a01h', 'Category created', 'Category \"Car wash\" is ready to use.', 'system', 0, '/dashboard/categories', '2026-06-08 19:42:47.208'),
('cmq652xul005pks6a2mfuaf03', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-09 04:28:03.165'),
('cmq72hlw9005tks6agf7dy97d', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-09 20:03:14.842'),
('cmq72kq9y005xks6ad7fxbx8p', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-09 20:05:40.487'),
('cmq72o7pe0061ks6aapbf35c4', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-09 20:08:23.042'),
('cmq7od9df0065ks6agcodz8vl', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-10 06:15:43.540'),
('cmq919ocw0069ks6at01jzuc7', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-11 05:04:37.521'),
('cmqaiochk006dks6asl8ktuqr', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-12 05:59:41.625'),
('cmqbc2rxi006jks6auoyf6d4h', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-12 19:42:43.686'),
('cmqbc3ja4006pks6awvr7h07l', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-12 19:43:19.133'),
('cmqdsnwbx006tks6a6pdzypia', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-14 13:02:35.373'),
('cmqfbf56d006xks6amt8s4yel', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-15 14:35:25.813'),
('cmqhl5o6y0073ks6aso8il0o7', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-17 04:43:32.410'),
('cmqj123mj0077ks6ay2ok9n6a', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-18 04:56:25.819'),
('cmqkf0c4g007bks6ar3j8ayju', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-19 04:14:44.321'),
('cmqlum5oj007jks6ar9inmdsb', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-20 04:19:22.819'),
('cmqnby8eo007nks6aoq8qcz2y', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-21 05:12:25.872'),
('cmqoqoo3v007rks6akk5liu58', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-22 04:52:40.076'),
('cmqpkcg9x007vks6ao1dmou7e', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-22 18:42:58.533'),
('cmqpkd1ty007zks6ayl6p721a', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-22 18:43:26.470'),
('cmqsfm51w0085ks6as28ixfws', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-24 18:53:50.996'),
('cmqsfn4sr0089ks6af1u3thqs', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-24 18:54:37.324'),
('cmqt0zzid008dks6a0mfhn560', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-25 04:52:28.933'),
('cmqty42de008hks6atpazpfzq', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-25 20:19:26.594'),
('cmqvv60im008nks6ad2kvxwy0', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-27 04:32:31.006'),
('cmqwqd9w9008rks6a0q1jcjp1', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-27 19:05:57.850'),
('cmqxtqwkd008vks6a9n1iyol7', 'cmp0pistw000fksr3uriqctco', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-06-28 13:28:18.782'),
('cmqyqeksg008zks6adoyv6rvr', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-06-29 04:42:30.977'),
('cmr1mb02t0093ks6abxuwxsgc', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-07-01 05:11:04.229'),
('cmr4gz5rx0097ks6ar0tuecry', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-07-03 05:05:12.190'),
('cmrca74vq009fks6a2lon59uc', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 1, '/dashboard', '2026-07-08 16:17:36.375'),
('cmrczf4y5009jks6aqkg6zmfc', 'cmouh1bd70005kswhabvrbt20', 'New income added', 'A new transaction was saved to your account.', 'savings', 0, '/dashboard', '2026-07-09 04:03:40.109');

-- --------------------------------------------------------

--
-- Table structure for table `Receipt`
--

CREATE TABLE `Receipt` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `transaction_id` varchar(191) DEFAULT NULL,
  `file_url` varchar(191) NOT NULL,
  `file_type` varchar(191) NOT NULL,
  `original_name` varchar(191) NOT NULL,
  `uploaded_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `RecurringPayment`
--

CREATE TABLE `RecurringPayment` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `type` enum('income','expense','transfer') NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `category_id` varchar(191) DEFAULT NULL,
  `wallet_id` varchar(191) DEFAULT NULL,
  `frequency` enum('daily','weekly','monthly','yearly') NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) DEFAULT NULL,
  `next_due_date` datetime(3) NOT NULL,
  `auto_create` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SavingsContribution`
--

CREATE TABLE `SavingsContribution` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `savings_goal_id` varchar(191) NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `note` varchar(191) DEFAULT NULL,
  `contribution_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SavingsGoal`
--

CREATE TABLE `SavingsGoal` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `target_amount` decimal(14,2) NOT NULL,
  `current_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `deadline` datetime(3) DEFAULT NULL,
  `status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
  `icon` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `session_token` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` varchar(191) NOT NULL DEFAULT 'global',
  `site_name` varchar(191) NOT NULL DEFAULT 'Finance Tracker',
  `site_tagline` varchar(191) DEFAULT NULL,
  `site_description` text NOT NULL DEFAULT 'Personal finance tracker built with Next.js, Prisma, and MySQL',
  `seo_title` varchar(191) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` text DEFAULT NULL,
  `logo_url` varchar(191) DEFAULT NULL,
  `icon_url` varchar(191) DEFAULT NULL,
  `support_email` varchar(191) DEFAULT NULL,
  `site_url` varchar(191) DEFAULT NULL,
  `smtp_host` varchar(191) DEFAULT NULL,
  `smtp_port` int(11) NOT NULL DEFAULT 587,
  `smtp_secure` tinyint(1) NOT NULL DEFAULT 0,
  `smtp_user` varchar(191) DEFAULT NULL,
  `smtp_pass` text DEFAULT NULL,
  `smtp_from` varchar(191) DEFAULT NULL,
  `require_email_verification` tinyint(1) NOT NULL DEFAULT 1,
  `verification_code_expiry_minutes` int(11) NOT NULL DEFAULT 15,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `site_name`, `site_tagline`, `site_description`, `seo_title`, `seo_description`, `seo_keywords`, `logo_url`, `icon_url`, `support_email`, `site_url`, `smtp_host`, `smtp_port`, `smtp_secure`, `smtp_user`, `smtp_pass`, `smtp_from`, `require_email_verification`, `verification_code_expiry_minutes`, `created_at`, `updated_at`) VALUES
('global', 'Smart finance', 'Smart Finance for Smart People.', 'Smart Finance is a modern AI-powered finance management platform designed to help you track expenses, manage income, monitor savings, and gain smart financial insights in real time. Stay in control of your money with secure analytics, budgeting tools, and an intuitive finance dashboard for personal and business use.', 'Finance Tracker', 'Smart Finance is a modern AI-powered finance management platform designed to help you track expenses, manage income, monitor savings, and gain smart financial insights in real time. Stay in control of your money with secure analytics, budgeting tools, and an intuitive finance dashboard for personal and business use.', 'Smart Finance, finance tracker app, personal finance app, smart budgeting app, expense tracker, income tracker, money management app, financial planning app, savings tracker, investment tracker, AI finance app, finance dashboard, budget planner, daily expense manager, digital wallet app, smart money manager, finance analytics, financial insights, expense management system, wealth management app, secure finance app, modern finance platform, financial monitoring app, cash flow tracker, business finance management, smart accounting app, finance mobile app, financial reports app, expense analytics, personal budgeting solution', '/uploads/site/logo-1779200565856-6bd7ed19-f2fe-471d-9573-6c1038d45cff.png', '/uploads/site/icon-1779201738571-5e6257e5-da87-4267-a6c0-d4fac903f0ad.png', 'no-reply@smart-finance.smshagor.online', 'https://smart-finance.live', 'smart-finance.smshagor.online', 465, 0, 'no-reply@smart-finance.smshagor.online', 'SmShagor1@1', 'no-reply@smart-finance.smshagor.online', 0, 15, '2026-05-06 19:47:02.000', '2026-05-23 04:15:20.000');

-- --------------------------------------------------------

--
-- Table structure for table `Transaction`
--

CREATE TABLE `Transaction` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `group_id` varchar(191) DEFAULT NULL,
  `type` enum('income','expense','transfer') NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `original_amount` decimal(14,2) NOT NULL,
  `converted_amount` decimal(14,2) NOT NULL,
  `category_id` varchar(191) DEFAULT NULL,
  `wallet_id` varchar(191) NOT NULL,
  `note` text DEFAULT NULL,
  `transaction_date` datetime(3) NOT NULL,
  `payment_method` varchar(191) DEFAULT NULL,
  `attachment_url` varchar(191) DEFAULT NULL,
  `currency_id` varchar(191) DEFAULT NULL,
  `exchange_rate` decimal(14,6) DEFAULT NULL,
  `income_source` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Transaction`
--

INSERT INTO `Transaction` (`id`, `user_id`, `group_id`, `type`, `amount`, `original_amount`, `converted_amount`, `category_id`, `wallet_id`, `note`, `transaction_date`, `payment_method`, `attachment_url`, `currency_id`, `exchange_rate`, `income_source`, `created_at`, `updated_at`) VALUES
('cmouiorb20001ksr3hp4prq8z', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2480.00, 2480.00, 2480.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-01 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car Wash', '2026-05-06 20:35:59.678', '2026-05-06 20:35:59.678'),
('cmouj1j900005ksr32wxd1x74', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2000.00, 2000.00, 2000.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-02 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car Wash', '2026-05-06 20:45:55.764', '2026-05-06 20:45:55.764'),
('cmouj2f0f0007ksr3zbiiwvvx', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2265.00, 2265.00, 2265.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-03 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car Wash', '2026-05-06 20:46:36.928', '2026-05-06 20:46:36.928'),
('cmouj34xd0009ksr3r99o2mj4', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2100.00, 2100.00, 2100.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-05 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car Wash', '2026-05-06 20:47:10.513', '2026-05-06 20:47:10.513'),
('cmoxu4drr000bksr3q5ez8kvr', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2538.00, 2538.00, 2538.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-08 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-09 04:19:22.936', '2026-05-09 04:33:29.829'),
('cmp0p4k6k000dksr3tmdlc15e', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1375.00, 1375.00, 1375.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-10 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-11 04:22:51.693', '2026-05-11 04:25:51.536'),
('cmp48zivi000rksr3ewocoo2c', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-13 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'magnit', '2026-05-13 16:02:07.567', '2026-05-13 16:02:07.567'),
('cmp6yh3l7000tksr3jficqrej', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 800.00, 800.00, 800.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-14 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'magnit', '2026-05-15 13:31:10.315', '2026-05-15 13:31:10.315'),
('cmp6yjeie000xksr36ooq0ktv', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1800.00, 1800.00, 1800.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-15 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-15 13:32:57.782', '2026-05-15 13:32:57.782'),
('cmp6ymual000zksr3f9uunobp', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1800.00, 1800.00, 1800.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-12 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-15 13:35:38.206', '2026-05-15 13:35:38.206'),
('cmp7v3wz40011ksr3r45uox0i', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2545.00, 2545.00, 2545.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-15 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-16 04:44:42.543', '2026-05-16 04:44:42.543'),
('cmp8kp6770013ksr3wsf2yhlv', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1800.00, 1800.00, 1800.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-16 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-16 16:41:04.676', '2026-05-16 16:41:04.676'),
('cmp9m3fz20017ksr39rn760kx', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 800.00, 800.00, 800.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-17 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-17 10:07:56.319', '2026-05-18 14:23:03.647'),
('cmpaoixbg0009kse727rtxp7o', 'cmpaoci6z0001kse7yheapt71', NULL, 'income', 4029.00, 4029.00, 4029.00, 'cmpaogmxl0005kse7vr8suenr', 'cmpaoh6q70007kse7orboccp3', NULL, '2026-05-17 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-18 04:03:44.045', '2026-05-18 04:03:44.045'),
('cmpaowcte000lkse7yqzggl8e', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2601.00, 2601.00, 2601.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-17 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car Wash', '2026-05-18 04:14:10.659', '2026-05-18 04:45:13.789'),
('cmpbao9sc0001ksxjabmizgy5', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2500.00, 2500.00, 2500.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-18 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-18 14:23:45.036', '2026-05-18 15:29:01.848'),
('cmpc5leij0001ks65kiimgwq2', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1890.00, 1890.00, 1890.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-18 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-19 04:49:19.291', '2026-05-19 04:49:19.291'),
('cmpcl2kak0005ks650k7dsy6w', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-19 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-19 12:02:34.172', '2026-05-19 12:02:34.172'),
('cmpezzjo80005kslqc3ymyd0s', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2140.00, 2140.00, 2140.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-20 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-21 04:35:39.992', '2026-05-21 04:35:39.992'),
('cmpfdlyzt0005ks6a4puv69v7', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-21 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-21 10:57:01.289', '2026-05-21 10:57:01.289'),
('cmpfrcj280009ks6a8tnbe6vd', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-05-21 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-21 17:21:35.360', '2026-05-21 17:21:35.360'),
('cmphsoz9q000dks6ar8bm85hv', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-23 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-23 03:34:48.206', '2026-05-23 03:34:48.206'),
('cmphtxcjc000hks6azbj1moh6', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1536.00, 1536.00, 1536.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-22 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-23 04:09:18.264', '2026-05-23 04:09:18.264'),
('cmphuby4l0011ks6an7elrnlt', 'cmphu2e8p000lks6ao8k9ugt4', NULL, 'income', 3596.00, 3596.00, 3596.00, 'cmphu86a6000xks6aj70y3o8u', 'cmphu6a4h000tks6arwek4trt', NULL, '2026-05-17 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-23 04:20:39.429', '2026-05-23 04:20:39.429'),
('cmphucs2l0015ks6avdj58ljt', 'cmphu2e8p000lks6ao8k9ugt4', NULL, 'income', 1890.00, 1890.00, 1890.00, 'cmphu86a6000xks6aj70y3o8u', 'cmphu6a4h000tks6arwek4trt', NULL, '2026-05-18 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-23 04:21:18.238', '2026-05-23 04:21:18.238'),
('cmphuf1u20019ks6ampzb3ku0', 'cmphu2e8p000lks6ao8k9ugt4', NULL, 'income', 1536.00, 1536.00, 1536.00, 'cmphu86a6000xks6aj70y3o8u', 'cmphu6a4h000tks6arwek4trt', NULL, '2026-05-22 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-23 04:23:04.203', '2026-05-23 04:23:04.203'),
('cmpinlep0001jks6a2awc6u5i', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-05-24 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-23 17:59:49.669', '2026-05-23 17:59:49.669'),
('cmpk1fnwn001nks6az7e650qd', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-05-25 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-24 17:15:02.471', '2026-05-24 17:15:02.471'),
('cmpkpzhks001rks6atxt1ndu1', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1391.00, 1391.00, 1391.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-24 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-25 04:42:18.172', '2026-05-25 04:42:18.172'),
('cmpln7qw6001vks6aev8vv083', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1800.00, 1800.00, 1800.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-26 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-05-25 20:12:30.822', '2026-05-25 20:12:30.822'),
('cmpob9byh001zks6a64suj8s3', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 850.00, 850.00, 850.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-05-28 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'magnit', '2026-05-27 17:01:07.913', '2026-05-27 17:01:07.913'),
('cmppgbbv60023ks6a9wmap9ek', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-05-28 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-05-28 12:10:25.362', '2026-05-28 12:10:25.362'),
('cmpqfih710029ks6a7h4628rq', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2120.00, 2120.00, 2120.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-28 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-29 04:35:45.421', '2026-05-29 04:35:45.421'),
('cmpr4h6qj002dks6anl4aee5p', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-05-30 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-05-29 16:14:35.612', '2026-05-29 16:14:35.612'),
('cmptc1dqa002hks6aqn9ldv3j', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2300.00, 2300.00, 2300.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-05-30 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-05-31 05:21:47.458', '2026-05-31 05:21:47.458'),
('cmpum8jmu002nks6a82fine80', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-05-31 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-01 02:55:04.038', '2026-06-01 02:55:04.038'),
('cmpw6c92o002tks6aj9t2f3mi', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1048.00, 1048.00, 1048.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-01 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-02 05:05:35.473', '2026-06-02 05:05:35.473'),
('cmpw8psq5002zks6asml1dfve', 'cmphu2e8p000lks6ao8k9ugt4', NULL, 'income', 1048.00, 1048.00, 1048.00, 'cmphu86a6000xks6aj70y3o8u', 'cmphu6a4h000tks6arwek4trt', NULL, '2026-06-01 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'сар уаш', '2026-06-02 06:12:06.702', '2026-06-02 06:12:06.702'),
('cmpwfsm770033ks6avvb5sss6', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 850.00, 850.00, 850.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-02 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-02 09:30:15.523', '2026-06-02 09:30:15.523'),
('cmpxkthq00037ks6as590px19', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2228.00, 2228.00, 2228.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-02 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Catmr Wash', '2026-06-03 04:38:40.632', '2026-06-03 05:17:55.817'),
('cmpydd49i003bks6avy276kyh', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1600.00, 1600.00, 1600.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-03 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-03 17:57:45.558', '2026-06-03 17:57:45.558'),
('cmpydfalw003fks6a8at7ocl0', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-04 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-03 17:59:27.092', '2026-06-03 17:59:27.092'),
('cmpz1e0mf003jks6a6lu4zj4o', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2600.00, 2600.00, 2600.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-03 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-04 05:10:18.279', '2026-06-04 05:10:18.279'),
('cmpzl3mhs003nks6a5vr55bls', 'cmphu2e8p000lks6ao8k9ugt4', NULL, 'income', 2600.00, 2600.00, 2600.00, 'cmphu86a6000xks6aj70y3o8u', 'cmphu6a4h000tks6arwek4trt', NULL, '2026-06-03 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-06-04 14:22:05.728', '2026-06-04 14:22:05.728'),
('cmq0iqwtc003rks6a7zwsuahy', 'cmphu2e8p000lks6ao8k9ugt4', NULL, 'income', 1563.00, 1563.00, 1563.00, 'cmphu86a6000xks6aj70y3o8u', 'cmphu6a4h000tks6arwek4trt', NULL, '2026-06-04 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, NULL, '2026-06-05 06:03:59.520', '2026-06-05 06:03:59.520'),
('cmq1clb8a004hks6a3b7om9ch', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-06-05 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-05 19:59:26.746', '2026-06-05 19:59:26.746'),
('cmq1twyi0004lks6aavfuo98b', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1872.00, 1872.00, 1872.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-05 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-06 04:04:23.593', '2026-06-06 04:04:23.593'),
('cmq2fn5m2004pks6age74d1nl', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1000.00, 1000.00, 1000.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-06 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-06 14:12:37.801', '2026-06-06 14:12:37.801'),
('cmq4owgm8004tks6a1ozuefn5', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1660.00, 1660.00, 1660.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-07 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-08 04:07:20.865', '2026-06-08 04:07:20.865'),
('cmq5di4h00053ks6a1ly845fb', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-07 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-08 15:36:02.341', '2026-06-08 15:36:02.341'),
('cmq652xua005nks6a75bov9wc', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 3150.00, 3150.00, 3150.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-08 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-09 04:28:03.154', '2026-06-09 05:21:57.902'),
('cmq72hlvw005rks6ag79f73bb', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-08 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-09 20:03:14.827', '2026-06-09 20:03:14.827'),
('cmq72kq9h005vks6au1ua7zfi', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-06-09 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-09 20:05:40.467', '2026-06-09 20:05:40.467'),
('cmq72o7p3005zks6atjfl07a2', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-06-01 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-09 20:08:23.032', '2026-06-09 20:08:23.032'),
('cmqaioch4006bks6ahoajv63j', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 4500.00, 4500.00, 4500.00, 'cmq0sjplj0041ks6abf8bsjiv', 'cmq0skp310049ks6a7700p3hc', '765 pick', '2026-06-11 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Posta pick', '2026-06-12 05:59:41.608', '2026-06-25 04:52:58.443'),
('cmqbc2rxa006hks6ao25lchgn', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-06-12 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-12 19:42:43.678', '2026-06-12 19:42:43.678'),
('cmqbc3j9t006nks6a7mls7qy1', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-13 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-12 19:43:19.121', '2026-06-12 19:43:19.121'),
('cmqdsnwbj006rks6a4olqtuzk', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-14 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'magnit', '2026-06-14 13:02:35.359', '2026-06-14 13:02:35.359'),
('cmqfbf561006vks6afllvve92', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-15 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'magnit', '2026-06-15 14:35:25.801', '2026-06-15 14:35:25.801'),
('cmqhl5o6m0071ks6ag3opaxkp', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1237.00, 1237.00, 1237.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-16 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-17 04:43:32.399', '2026-06-17 04:43:32.399'),
('cmqj123m70075ks6atrvb625a', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1613.00, 1613.00, 1613.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-17 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-18 04:56:25.807', '2026-06-18 04:58:47.036'),
('cmqkf0c430079ks6a2i3ov6a7', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2340.00, 2340.00, 2340.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-18 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-19 04:14:44.307', '2026-06-19 04:14:44.307'),
('cmqlum5o9007hks6a5ykvgoun', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2260.00, 2260.00, 2260.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-19 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-20 04:19:22.810', '2026-06-20 04:19:22.810'),
('cmqnby8eb007lks6amcedk9i6', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1560.00, 1560.00, 1560.00, 'cmouhndus0001ksgz2njhovyp', 'cmq0sl3yo004dks6a4jexsc38', NULL, '2026-06-20 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-21 05:12:25.860', '2026-06-21 05:12:25.860'),
('cmqoqoo3k007pks6arlhkusnf', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1970.00, 1970.00, 1970.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-21 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-22 04:52:40.063', '2026-06-22 04:52:40.063'),
('cmqpkcg9o007tks6a1i15lud6', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-06-22 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-22 18:42:58.525', '2026-06-22 18:42:58.525'),
('cmqpkd1tq007xks6a5t2y9k6x', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-23 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-22 18:43:26.463', '2026-06-22 18:43:26.463'),
('cmqsfm51l0083ks6agbmbm9mz', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-06-24 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-24 18:53:50.986', '2026-06-24 18:53:50.986'),
('cmqsfn4sl0087ks6a34fz72k9', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-06-25 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-24 18:54:37.317', '2026-06-24 18:54:37.317'),
('cmqt0zzi4008bks6al7xl63si', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1541.00, 1541.00, 1541.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-24 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-25 04:52:28.924', '2026-06-25 04:52:28.924'),
('cmqty42d0008fks6a4cqu743a', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-26 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-25 20:19:26.580', '2026-06-25 20:19:26.580'),
('cmqvv60ic008lks6a130vyemt', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1110.00, 1110.00, 1110.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-26 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-27 04:32:30.997', '2026-06-27 04:32:30.997'),
('cmqwqd9vw008pks6aiofd7l1z', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 1700.00, 1700.00, 1700.00, 'cmp48vue9000jksr362s96km0', 'cmp48xdak000nksr3cxprel0j', NULL, '2026-06-28 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Magnit', '2026-06-27 19:05:57.836', '2026-06-27 19:05:57.836'),
('cmqxtqwjv008tks6a3x0emr2a', 'cmp0pistw000fksr3uriqctco', NULL, 'income', 2800.00, 2800.00, 2800.00, 'cmp48wbpl000lksr3gyu41pnz', 'cmp48xviq000pksr3ts028c42', NULL, '2026-06-29 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Factory', '2026-06-28 13:28:18.763', '2026-06-28 13:28:18.763'),
('cmqyqeks2008xks6a1qp2m145', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2423.00, 2423.00, 2423.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-28 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-06-29 04:42:30.962', '2026-06-29 04:42:30.962'),
('cmr1mb02g0091ks6a4hc46s2w', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1900.00, 1900.00, 1900.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-06-30 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-07-01 05:11:04.216', '2026-07-01 05:11:04.216'),
('cmr4gz5rh0095ks6ayqvpyp0t', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 2230.00, 2230.00, 2230.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-07-02 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-07-03 05:05:12.174', '2026-07-03 05:05:12.174'),
('cmrca74ve009dks6acrwe7r4t', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1000.00, 1000.00, 1000.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-07-03 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-07-08 16:17:36.362', '2026-07-08 16:17:36.362'),
('cmrczf4xq009hks6ap65zt5nj', 'cmouh1bd70005kswhabvrbt20', NULL, 'income', 1300.00, 1300.00, 1300.00, 'cmouhndus0001ksgz2njhovyp', 'cmouhvudb0003ksgz7pzgc1lp', NULL, '2026-07-08 00:00:00.000', NULL, NULL, 'cmougxt6t0003ksplrrxxphot', 75.472900, 'Car wash', '2026-07-09 04:03:40.094', '2026-07-09 04:03:40.094');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `email_verified_at` datetime(3) DEFAULT NULL,
  `defaultCurrencyId` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `registration_provider` enum('email','google','facebook','telegram') NOT NULL DEFAULT 'email',
  `google_id` varchar(191) DEFAULT NULL,
  `facebook_id` varchar(191) DEFAULT NULL,
  `telegram_id` varchar(191) DEFAULT NULL,
  `provider_meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`provider_meta`)),
  `last_login_provider` enum('email','google','facebook','telegram') DEFAULT NULL,
  `last_login_at` datetime(3) DEFAULT NULL,
  `login_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `image`, `role`, `email_verified_at`, `defaultCurrencyId`, `created_at`, `updated_at`, `avatar`, `registration_provider`, `google_id`, `facebook_id`, `telegram_id`, `provider_meta`, `last_login_provider`, `last_login_at`, `login_count`) VALUES
('cmouh1bd70005kswhabvrbt20', 'Shahanur Islam Shagor', 'smshagor.ru@gmail.com', '$2b$10$pacZcfCi6NiRDquVNKNR7uwh9aA9hKeU.fgll6uI2GLoEXoqitRu2', '/uploads/profiles/1779200648443-9faf93eb-1362-4906-b127-268389931b8d.png', 'admin', '2026-05-06 19:49:46.314', 'cmougxt6t0003ksplrrxxphot', '2026-05-06 19:49:46.315', '2026-07-08 16:16:53.754', '/uploads/profiles/1779200648443-9faf93eb-1362-4906-b127-268389931b8d.png', 'email', NULL, NULL, NULL, NULL, 'email', '2026-07-08 16:16:53.753', 18),
('cmp0pistw000fksr3uriqctco', 'Kaniz', 'kanizfatema2505@gmail.com', '$2b$10$PnxOIQMz2v1ArQfIIlaVsuBDqoY7y6RTSSiwvg76HVjvVMVOVGhAy', '/uploads/profiles/1779200739874-c08d987a-cb33-45f7-8ce8-0ea8239ca179.jpg', 'user', '2026-05-11 04:34:35.765', 'cmougxt6t0003ksplrrxxphot', '2026-05-11 04:33:56.084', '2026-07-07 11:28:30.800', '/uploads/profiles/1779200739874-c08d987a-cb33-45f7-8ce8-0ea8239ca179.jpg', 'email', NULL, NULL, NULL, NULL, 'email', '2026-07-07 11:28:30.799', 12),
('cmpaoci6z0001kse7yheapt71', 'Joy', 'joydas23102002@gmail.com', '$2b$10$BJ7ajcp/RElpty...uqrleyWS2Kzu/jItP5cXTa/voTe5c7C7XwtO', NULL, 'user', '2026-05-18 04:00:21.854', 'cmougxt6t0003ksplrrxxphot', '2026-05-18 03:58:44.507', '2026-05-18 04:00:21.855', NULL, 'email', NULL, NULL, NULL, NULL, NULL, NULL, 0),
('cmpf3zvlf000rkslqekwkfrc5', 'Shahanur Islam Shagor', 'smshagor@yandex.ru', NULL, 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=4959700814302356&height=200&width=200&ext=1781936873&hash=AfsEcnGHPIQH1jhFKj7a7Xcn', 'user', '2026-05-21 06:27:53.907', 'cmougxt6t0003ksplrrxxphot', '2026-05-21 06:27:53.908', '2026-05-21 06:28:06.446', 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=4959700814302356&height=200&width=200&ext=1781936873&hash=AfsEcnGHPIQH1jhFKj7a7Xcn', 'facebook', NULL, '4959700814302356', NULL, '{\"facebook\":{\"firstName\":\"Shahanur\",\"lastName\":\"Shagor\"}}', 'facebook', '2026-05-21 06:27:53.915', 1),
('cmphu2e8p000lks6ao8k9ugt4', 'Avijit Sharma', 'sharmaavijit444444@gmail.com', '$2b$10$xPFjeUA2WmTsurySNAJrbOZssk6oyNTGuTp3FVEACo.psgRQDx0P2', '/uploads/profiles/1779510353989-9999b105-fd21-4999-b19f-51d6a1f9c109.jpg', 'user', '2026-05-23 04:14:31.456', 'cmougxt6t0003ksplrrxxphot', '2026-05-23 04:13:13.754', '2026-06-02 06:10:47.128', '/uploads/profiles/1779510353989-9999b105-fd21-4999-b19f-51d6a1f9c109.jpg', 'email', NULL, NULL, NULL, NULL, 'email', '2026-06-02 06:10:47.127', 2),
('cmq5ma6dc0057ks6awhn1a01h', 'Tushar Das', 'tushardasmb@gmail.com', '$2b$10$nLhuyrIjZovYqtpTOAY7eeSaJvec2DBWDjmjZXHdf3Dj25NJjp6c.', NULL, 'user', '2026-06-08 19:41:48.095', 'cmougxt6t0003ksplrrxxphot', '2026-06-08 19:41:48.096', '2026-06-08 19:41:49.332', NULL, 'email', NULL, NULL, NULL, NULL, 'email', '2026-06-08 19:41:49.331', 1);

-- --------------------------------------------------------

--
-- Table structure for table `UserSetting`
--

CREATE TABLE `UserSetting` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `language` varchar(191) NOT NULL DEFAULT 'en',
  `theme` varchar(191) NOT NULL DEFAULT 'light',
  `timezone` varchar(191) NOT NULL DEFAULT 'UTC',
  `email_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `budget_alerts` tinyint(1) NOT NULL DEFAULT 1,
  `bill_reminders` tinyint(1) NOT NULL DEFAULT 1,
  `low_balance_warnings` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserSetting`
--

INSERT INTO `UserSetting` (`id`, `user_id`, `language`, `theme`, `timezone`, `email_notifications`, `budget_alerts`, `bill_reminders`, `low_balance_warnings`, `created_at`, `updated_at`) VALUES
('cmouiq2wx0003ksr3gdh5414i', 'cmouh1bd70005kswhabvrbt20', 'en', 'light', 'UTC', 1, 1, 1, 1, '2026-05-06 20:37:01.377', '2026-05-06 20:37:01.377'),
('cmp0pisu9000hksr3n065c26h', 'cmp0pistw000fksr3uriqctco', 'en', 'light', 'UTC', 1, 1, 1, 1, '2026-05-11 04:33:56.097', '2026-05-11 04:33:56.097'),
('cmpaoci790003kse7md64i8gm', 'cmpaoci6z0001kse7yheapt71', 'en', 'light', 'UTC', 1, 1, 1, 1, '2026-05-18 03:58:44.518', '2026-05-18 03:58:44.518'),
('cmphu2e90000nks6aqpfbzd15', 'cmphu2e8p000lks6ao8k9ugt4', 'en', 'light', 'UTC', 1, 1, 1, 1, '2026-05-23 04:13:13.764', '2026-05-23 04:13:13.764'),
('cmq5ma6du0059ks6a8b3tbc9z', 'cmq5ma6dc0057ks6awhn1a01h', 'en', 'light', 'UTC', 1, 1, 1, 1, '2026-06-08 19:41:48.114', '2026-06-08 19:41:48.114');

-- --------------------------------------------------------

--
-- Table structure for table `verification_tokens`
--

CREATE TABLE `verification_tokens` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `verification_tokens`
--

INSERT INTO `verification_tokens` (`identifier`, `token`, `expires`) VALUES
('kanizfatema2505@gmail.com', '310497', '2026-05-11 04:48:56.105'),
('joydas23102002@gmail.com', '574662', '2026-05-18 04:13:44.524'),
('sharmaavijit444444@gmail.com', '958269', '2026-05-23 04:28:13.777');

-- --------------------------------------------------------

--
-- Table structure for table `Wallet`
--

CREATE TABLE `Wallet` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `balance` decimal(14,2) NOT NULL,
  `currency_id` varchar(191) DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Wallet`
--

INSERT INTO `Wallet` (`id`, `user_id`, `name`, `type`, `balance`, `currency_id`, `icon`, `color`, `is_default`, `created_at`, `updated_at`) VALUES
('cmouhvudb0003ksgz7pzgc1lp', 'cmouh1bd70005kswhabvrbt20', 'Car Wash', 'cash', 62763.00, 'cmougxt6t0003ksplrrxxphot', 'credit-card', '#0f766e', 0, '2026-05-06 20:13:30.623', '2026-07-09 04:03:40.103'),
('cmp48xdak000nksr3cxprel0j', 'cmp0pistw000fksr3uriqctco', 'Magnit', 'cash', 37700.00, 'cmougxt6t0003ksplrrxxphot', 'wallet', '#0f766e', 0, '2026-05-13 16:00:27.020', '2026-06-27 19:05:57.845'),
('cmp48xviq000pksr3ts028c42', 'cmp0pistw000fksr3uriqctco', 'Factory', 'cash', 39200.00, 'cmougxt6t0003ksplrrxxphot', 'wallet', '#0f766e', 0, '2026-05-13 16:00:50.642', '2026-06-28 13:28:18.776'),
('cmpaoh6q70007kse7orboccp3', 'cmpaoci6z0001kse7yheapt71', 'Car wash', 'cash', 4029.00, 'cmougxt6t0003ksplrrxxphot', 'wallet', '#0f766e', 0, '2026-05-18 04:02:22.927', '2026-05-18 04:03:44.055'),
('cmphu6a4h000tks6arwek4trt', 'cmphu2e8p000lks6ao8k9ugt4', 'Cash', 'cash', 12233.00, 'cmougxt6t0003ksplrrxxphot', 'banknote', '#0f766e', 0, '2026-05-23 04:16:15.041', '2026-06-05 06:07:23.275'),
('cmq0skp310049ks6a7700p3hc', 'cmouh1bd70005kswhabvrbt20', 'Posta', 'cash', 4500.00, 'cmougxt6t0003ksplrrxxphot', 'banknote', '#0f766e', 0, '2026-06-05 10:39:05.725', '2026-06-25 04:53:06.192'),
('cmq0sl3yo004dks6a4jexsc38', 'cmouh1bd70005kswhabvrbt20', 'Magnit', 'cash', 1560.00, 'cmougxt6t0003ksplrrxxphot', 'credit-card', '#0f766e', 0, '2026-06-05 10:39:25.008', '2026-06-21 05:12:25.867'),
('cmq5mawrx005fks6a1pry1cot', 'cmq5ma6dc0057ks6awhn1a01h', 'Car wash', 'cash', 0.00, 'cmougxt6t0003ksplrrxxphot', 'wallet', '#0f766e', 0, '2026-06-08 19:42:22.317', '2026-06-08 19:42:22.317');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('5c95e18c-e5d4-4d16-afc1-1ffa76634e05', 'd5b6894e029c7caff50d6f8ee48f15d9eeda3006d1b5dcd44e36ace06312cf0d', '2026-05-19 13:54:53.015', '20260519090000_social_auth_and_provider_settings', NULL, NULL, '2026-05-19 13:54:52.945', 1),
('659f47cd-a06c-47b8-9c03-8daa28fd6333', '01fdf7deadb00dc3d57b41db017f2ccf4b2f855220c57b4014af55313a9d0a01', '2026-05-20 15:55:38.654', '20260520150000_custom_pages', NULL, NULL, '2026-05-20 15:55:38.643', 1),
('87fe3f96-2529-4e97-a025-5ac72162733a', 'e31c0b312fe62525556d099f98c3503acf2d12ddfadc772862a7f225b4378625', '2026-05-06 18:58:29.583', '20260504000000_init', NULL, NULL, '2026-05-06 18:58:29.021', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_provider_provider_account_id_key` (`provider`,`provider_account_id`),
  ADD KEY `accounts_user_id_idx` (`user_id`);

--
-- Indexes for table `AIInsight`
--
ALTER TABLE `AIInsight`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AIInsight_user_id_generated_at_idx` (`user_id`,`generated_at`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_actor_user_id_idx` (`actor_user_id`),
  ADD KEY `audit_logs_entity_type_entity_id_idx` (`entity_type`,`entity_id`),
  ADD KEY `audit_logs_created_at_idx` (`created_at`);

--
-- Indexes for table `auth_provider_settings`
--
ALTER TABLE `auth_provider_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_provider_settings_provider_key` (`provider`);

--
-- Indexes for table `Budget`
--
ALTER TABLE `Budget`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Budget_user_id_month_year_idx` (`user_id`,`month`,`year`),
  ADD KEY `Budget_category_id_fkey` (`category_id`),
  ADD KEY `Budget_wallet_id_fkey` (`wallet_id`);

--
-- Indexes for table `Category`
--
ALTER TABLE `Category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Category_user_id_type_idx` (`user_id`,`type`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `currencies_code_key` (`code`);

--
-- Indexes for table `custom_pages`
--
ALTER TABLE `custom_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `custom_pages_slug_key` (`slug`),
  ADD KEY `custom_pages_status_created_at_idx` (`status`,`created_at`),
  ADD KEY `custom_pages_title_idx` (`title`);

--
-- Indexes for table `DebtLoan`
--
ALTER TABLE `DebtLoan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DebtLoan_user_id_status_idx` (`user_id`,`status`);

--
-- Indexes for table `DebtPayment`
--
ALTER TABLE `DebtPayment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `DebtPayment_user_id_debt_loan_id_idx` (`user_id`,`debt_loan_id`),
  ADD KEY `DebtPayment_debt_loan_id_fkey` (`debt_loan_id`);

--
-- Indexes for table `ExportLog`
--
ALTER TABLE `ExportLog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ExportLog_user_id_format_idx` (`user_id`,`format`);

--
-- Indexes for table `FinanceGroup`
--
ALTER TABLE `FinanceGroup`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FinanceGroup_owner_id_idx` (`owner_id`);

--
-- Indexes for table `FinanceGroupInvite`
--
ALTER TABLE `FinanceGroupInvite`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `FinanceGroupInvite_token_key` (`token`),
  ADD KEY `FinanceGroupInvite_group_id_is_active_idx` (`group_id`,`is_active`),
  ADD KEY `FinanceGroupInvite_created_by_id_idx` (`created_by_id`);

--
-- Indexes for table `FinanceGroupMember`
--
ALTER TABLE `FinanceGroupMember`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `FinanceGroupMember_group_id_user_id_key` (`group_id`,`user_id`),
  ADD KEY `FinanceGroupMember_user_id_fkey` (`user_id`);

--
-- Indexes for table `GroupMessage`
--
ALTER TABLE `GroupMessage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `GroupMessage_group_id_created_at_idx` (`group_id`,`created_at`),
  ADD KEY `GroupMessage_user_id_idx` (`user_id`);

--
-- Indexes for table `Notification`
--
ALTER TABLE `Notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_user_id_is_read_idx` (`user_id`,`is_read`);

--
-- Indexes for table `Receipt`
--
ALTER TABLE `Receipt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Receipt_user_id_transaction_id_idx` (`user_id`,`transaction_id`),
  ADD KEY `Receipt_transaction_id_fkey` (`transaction_id`);

--
-- Indexes for table `RecurringPayment`
--
ALTER TABLE `RecurringPayment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `RecurringPayment_user_id_next_due_date_idx` (`user_id`,`next_due_date`),
  ADD KEY `RecurringPayment_category_id_fkey` (`category_id`),
  ADD KEY `RecurringPayment_wallet_id_fkey` (`wallet_id`);

--
-- Indexes for table `SavingsContribution`
--
ALTER TABLE `SavingsContribution`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SavingsContribution_user_id_savings_goal_id_idx` (`user_id`,`savings_goal_id`),
  ADD KEY `SavingsContribution_savings_goal_id_fkey` (`savings_goal_id`);

--
-- Indexes for table `SavingsGoal`
--
ALTER TABLE `SavingsGoal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SavingsGoal_user_id_status_idx` (`user_id`,`status`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessions_session_token_key` (`session_token`),
  ADD KEY `sessions_user_id_idx` (`user_id`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Transaction`
--
ALTER TABLE `Transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Transaction_user_id_type_transaction_date_idx` (`user_id`,`type`,`transaction_date`),
  ADD KEY `Transaction_currency_id_idx` (`currency_id`),
  ADD KEY `Transaction_wallet_id_idx` (`wallet_id`),
  ADD KEY `Transaction_category_id_fkey` (`category_id`),
  ADD KEY `Transaction_group_id_fkey` (`group_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_google_id_key` (`google_id`),
  ADD UNIQUE KEY `users_facebook_id_key` (`facebook_id`),
  ADD UNIQUE KEY `users_telegram_id_key` (`telegram_id`),
  ADD KEY `users_defaultCurrencyId_idx` (`defaultCurrencyId`),
  ADD KEY `users_registration_provider_idx` (`registration_provider`),
  ADD KEY `users_last_login_provider_idx` (`last_login_provider`);

--
-- Indexes for table `UserSetting`
--
ALTER TABLE `UserSetting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserSetting_user_id_key` (`user_id`);

--
-- Indexes for table `verification_tokens`
--
ALTER TABLE `verification_tokens`
  ADD UNIQUE KEY `verification_tokens_token_key` (`token`),
  ADD UNIQUE KEY `verification_tokens_identifier_token_key` (`identifier`,`token`);

--
-- Indexes for table `Wallet`
--
ALTER TABLE `Wallet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Wallet_user_id_idx` (`user_id`),
  ADD KEY `Wallet_currency_id_idx` (`currency_id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `AIInsight`
--
ALTER TABLE `AIInsight`
  ADD CONSTRAINT `AIInsight_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Budget`
--
ALTER TABLE `Budget`
  ADD CONSTRAINT `Budget_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Budget_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Budget_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `Wallet` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Category`
--
ALTER TABLE `Category`
  ADD CONSTRAINT `Category_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DebtLoan`
--
ALTER TABLE `DebtLoan`
  ADD CONSTRAINT `DebtLoan_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `DebtPayment`
--
ALTER TABLE `DebtPayment`
  ADD CONSTRAINT `DebtPayment_debt_loan_id_fkey` FOREIGN KEY (`debt_loan_id`) REFERENCES `DebtLoan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `DebtPayment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ExportLog`
--
ALTER TABLE `ExportLog`
  ADD CONSTRAINT `ExportLog_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `FinanceGroup`
--
ALTER TABLE `FinanceGroup`
  ADD CONSTRAINT `FinanceGroup_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `FinanceGroupInvite`
--
ALTER TABLE `FinanceGroupInvite`
  ADD CONSTRAINT `FinanceGroupInvite_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FinanceGroupInvite_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `FinanceGroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `FinanceGroupMember`
--
ALTER TABLE `FinanceGroupMember`
  ADD CONSTRAINT `FinanceGroupMember_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `FinanceGroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FinanceGroupMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `GroupMessage`
--
ALTER TABLE `GroupMessage`
  ADD CONSTRAINT `GroupMessage_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `FinanceGroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `GroupMessage_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Notification`
--
ALTER TABLE `Notification`
  ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Receipt`
--
ALTER TABLE `Receipt`
  ADD CONSTRAINT `Receipt_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Receipt_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `RecurringPayment`
--
ALTER TABLE `RecurringPayment`
  ADD CONSTRAINT `RecurringPayment_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `RecurringPayment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `RecurringPayment_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `Wallet` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `SavingsContribution`
--
ALTER TABLE `SavingsContribution`
  ADD CONSTRAINT `SavingsContribution_savings_goal_id_fkey` FOREIGN KEY (`savings_goal_id`) REFERENCES `SavingsGoal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `SavingsContribution_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `SavingsGoal`
--
ALTER TABLE `SavingsGoal`
  ADD CONSTRAINT `SavingsGoal_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Transaction`
--
ALTER TABLE `Transaction`
  ADD CONSTRAINT `Transaction_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Transaction_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Transaction_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `FinanceGroup` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Transaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Transaction_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `Wallet` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_defaultCurrencyId_fkey` FOREIGN KEY (`defaultCurrencyId`) REFERENCES `currencies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `UserSetting`
--
ALTER TABLE `UserSetting`
  ADD CONSTRAINT `UserSetting_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Wallet`
--
ALTER TABLE `Wallet`
  ADD CONSTRAINT `Wallet_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Wallet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
