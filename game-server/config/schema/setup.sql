# Dump of table User
# ------------------------------------------

#DROP TABLE IF EXISTS `User`;

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

# Dump of table Player
# ------------------------------------------

#DROP TABLE IF EXISTS `Player`;

CREATE TABLE IF NOT EXISTS `Player` (
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`userId` bigint(20) unsigned NOT NULL DEFAULT '0',
	`name` varchar(50) COLLATE utf8_unicode_ci DEFAULT '',
	`areaId` bigint(20) unsigned DEFAULT '1',
	`x` float DEFAULT '0',
	`y` float DEFAULT '0',
	`z` float DEFAULT '0',
	/*quaternion of player transformation*/
	`qx` float(32) DEFAULT '0',
	`qy` float(32) DEFAULT '0',
	`qz` float(32) DEFAULT '0',
	`qw` float(32) DEFAULT '1',
	/*optional interface for future use*/
	`kindId` varchar(10) COLLATE utf8_unicode_ci DEFAULT '0000',
	`kindName` varchar(30) COLLATE utf8_unicode_ci DEFAULT 'universal user',
	PRIMARY KEY (`id`),
	UNIQUE KEY `INDEX_GAME_NAME` (`name`),
	KEY `INDEX_PLAYER_USER_ID` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Car
# ------------------------------------------

#DROP TABLE IF EXISTS `Car`;

CREATE TABLE IF NOT EXISTS `Car` (
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
	`mass` float DEFAULT '0',
	`width` float DEFAULT '0',
	`height` float DEFAULT '0',
	`length` float DEFAULT '0',
	`wheelRadius` float DEFAULT '0',
	`wheelHeight` float DEFAULT '0',
	`wheelDepth` float DEFAULT '0',
	PRIMARY KEY (`id`),
	KEY `INDEX_PLAYER_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
