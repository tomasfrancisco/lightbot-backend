-- Adminer 4.7.0 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `lightbot`;
CREATE DATABASE `lightbot` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `lightbot`;

DROP TABLE IF EXISTS `agent`;
CREATE TABLE `agent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `company` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_agent_uuid` (`uuid`),
  UNIQUE KEY `idx_name_company` (`company`,`name`),
  CONSTRAINT `fk_agent_company` FOREIGN KEY (`company`) REFERENCES `company` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `agent_data`;
CREATE TABLE `agent_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `key` varchar(255) NOT NULL,
  `data` text NOT NULL,
  `agent` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_agent_key` (`agent`,`key`),
  CONSTRAINT `fk_agent_data_agent` FOREIGN KEY (`agent`) REFERENCES `agent` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `company`;
CREATE TABLE `company` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `unique_token` varchar(255) NOT NULL,
  `admin` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_f933c34eb3cf85e6d22ee4ac01` (`admin`),
  CONSTRAINT `fk_company_admin` FOREIGN KEY (`admin`) REFERENCES `user` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `dictionary`;
CREATE TABLE `dictionary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `company` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_dictionary_company` (`company`),
  CONSTRAINT `fk_dictionary_company` FOREIGN KEY (`company`) REFERENCES `company` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `dictionary_value`;
CREATE TABLE `dictionary_value` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `value` varchar(255) NOT NULL,
  `dictionary` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_dictionary_value_dictionary` (`dictionary`),
  CONSTRAINT `fk_dictionary_value_dictionary` FOREIGN KEY (`dictionary`) REFERENCES `dictionary` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `intent`;
CREATE TABLE `intent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `events` text NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `is_fallback` tinyint(4) NOT NULL,
  `outputs` text NOT NULL,
  `agent` int(11) NOT NULL,
  `parent` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_intent_agent` (`agent`),
  KEY `fk_intent_parent` (`parent`),
  CONSTRAINT `fk_intent_agent` FOREIGN KEY (`agent`) REFERENCES `agent` (`id`),
  CONSTRAINT `fk_intent_parent` FOREIGN KEY (`parent`) REFERENCES `intent` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `intent_trigger`;
CREATE TABLE `intent_trigger` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `type` enum('PLAIN','COMBINATION') NOT NULL,
  `value` text NOT NULL,
  `intent` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_intent_trigger_intent` (`intent`),
  CONSTRAINT `fk_intent_trigger_intent` FOREIGN KEY (`intent`) REFERENCES `intent` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `unknown_trigger`;
CREATE TABLE `unknown_trigger` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `value` varchar(255) NOT NULL,
  `agent` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_unknown_trigger_agent` (`agent`),
  CONSTRAINT `fk_unknown_trigger_agent` FOREIGN KEY (`agent`) REFERENCES `agent` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(4) NOT NULL DEFAULT '0',
  `reset_token` varchar(255) DEFAULT NULL,
  `is_activated` tinyint(4) NOT NULL DEFAULT '0',
  `company` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_email` (`email`),
  UNIQUE KEY `idx_user_google_id` (`google_id`),
  KEY `fk_user_company` (`company`),
  CONSTRAINT `fk_user_company` FOREIGN KEY (`company`) REFERENCES `company` (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
