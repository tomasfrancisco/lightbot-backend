-- Adminer 4.7.0 MySQL dump

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

USE `lightbot`;

INSERT INTO `agent` (`id`, `uuid`, `created_at`, `name`, `company`) VALUES
  (1, '4565b699-6d3a-4915-9722-f00fc9f1a032',	1548152981,	'Test',	1);

INSERT INTO `agent_data` (`id`, `created_at`, `key`, `data`, `agent`) VALUES
  (1,	1548165377,	'deployedOnPlatform',	'RASA',	1);

INSERT INTO `company` (`id`, `created_at`, `name`, `unique_token`, `admin`) VALUES
  (1,	1549449045,	'private',	'5ccc54cc-c567-43d7-a5bc-c5e4a6ccfa4b',	1);

INSERT INTO `dictionary` (`id`, `created_at`, `name`, `company`) VALUES
  (1,	1548169696,	'bot',	1);

INSERT INTO `dictionary_value` (`id`, `created_at`, `value`, `dictionary`) VALUES
  (1,	1548170323,	'testbot',	1),
  (2,	1548170324,	'mybot',	1);

INSERT INTO `intent` (`id`, `created_at`, `name`, `events`, `action`, `is_fallback`, `outputs`, `agent`, `parent`) VALUES
  (1,	1548153577,	'Welkom',	'[\"LIGHTBOT_WELCOME\"]',	NULL,	0,	'[{\"type\":\"PLAIN\",\"value\":{\"label\":\"Dit is de Ligthbot test bot\"}}]',	1,	NULL),
  (2,	1548164288,	'Fallback',	'[]',	NULL,	1,	'[{\"type\":\"JUMPS\",\"value\":{\"jumps\":[{\"intentId\":1,\"label\":\"Welcome\"}]}},{\"type\":\"PLAIN\",\"value\":{\"label\":\"Can\'t hear you. LLALALALALALA\"}}]',	1,	NULL),
(3,	1548165418,	'child',	'[]',	NULL,	0,	'[{\"type\":\"PLAIN\",\"value\":{\"label\":\"wow, didn\'t expect that, did ya...\"}}]',	1,	1);

INSERT INTO `intent_trigger` (`id`, `created_at`, `type`, `value`, `intent`) VALUES
  (1,	1548153577,	'PLAIN',	'[\"Hallo\"]',	1),
  (2,	1548153577,	'PLAIN',	'[\"Goedendag\"]',	1),
  (3,	1548153577,	'PLAIN',	'[\"Hi\"]',	1),
  (4,	1548165468,	'PLAIN',	'[\"CHILD\"]',	3);

INSERT INTO `unknown_trigger` (`id`, `created_at`, `value`, `agent`) VALUES
  (1,	1548170331,	'Wat?',	1),
  (2,	1548170332,	'Who are you?',	1);

INSERT INTO `user` (`id`, `created_at`, `email`, `google_id`, `password`, `is_admin`, `reset_token`, `is_activated`, `company`) VALUES
  (1,	1549449045,	'test@lightbot.io',	NULL,	'$2b$11$gEoNQDtVrjiuERNfDdBLFedszG9w0YrcvCCDcuKcdYuF0ETb/0UB.',	0,	NULL,	1,	1);

SET foreign_key_checks = 1;
-- 2019-02-06 10:40:18
