# Dump of table User
# ------------------------------------------

DROP TABLE IF EXISTS `User`;

CREATE TABLE IF NOT EXISTS `User` (
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
	`password` varchar(60) COLLATE utf8_unicode_ci DEFAULT '',
	`salt` varchar(29) COLLATE utf8_unicode_ci DEFAULT '',
	`loginCount` smallint(6) unsigned DEFAULT '0',
	`from` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL,
	`lastLoginTime` bigint(20) unsigned DEFAULT '0',
	PRIMARY KEY (`id`),
	UNIQUE KEY `INDEX_ACCOUNT_NAME` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;