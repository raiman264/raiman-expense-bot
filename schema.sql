# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.12)
# Database: expenses-bot
# Generation Time: 2021-04-03 06:15:35 +0000
# ************************************************************


# Dump of table expenses
# ------------------------------------------------------------

-- Create syntax for TABLE 'expenses'
CREATE TABLE `expenses` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `list_id` int(11) NOT NULL,
  `amount` double NOT NULL,
  `description` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total` double NOT NULL DEFAULT '0',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `list_id` (`list_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create syntax for TABLE 'expenses_lists'
CREATE TABLE `expenses_lists` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create syntax for TABLE 'users_lists'
CREATE TABLE `users_lists` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` double unsigned NOT NULL,
  `list_id` int(11) DEFAULT NULL,
  `is_default_list` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
