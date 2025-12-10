-- create database dbbikes

create database if not exists dbbikes;

-- create table station

use dbbikes;
drop table if exists station;
create table station(
	`number` integer not null,
    `name` varchar(128),
    address varchar(128),
    position_lat decimal(8,6),
    position_lng decimal(9,6),
    banking integer,
    bonus integer,
    bike_stands integer,
    primary key(`number`),
    unique(`name`)
);

-- create table availability

drop table if exists availability;
create table availability(
	`number` integer not null,
    available_bike_stands integer,
    available_bikes integer,
    `status` varcharacter(128),
    last_update integer,
    primary key(`number`, last_update)
);

-- create table tb_weather

drop table if exists tb_weather;
create table tb_weather(
	`updatedTime` integer not null,
	`weatherId` integer not null,
	`weatherMain` varchar(128),
	`temp` float,
	feels_like float,
	temp_min float,
	temp_max float,
	humidity float,
	visibility integer,
	windSpeed float,
	windDeg float,
	sunrise integer,
	sunset integer,
	primary key(`updatedTime`)
);