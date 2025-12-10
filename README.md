# CityCyclingHelper（城市骑行助手）
A system helping city cycling experience.
一个帮助人们在城市中骑行体验的助手系统

# dependencies
one is from conda and another is from pip

/env/environment.yml

/env/requirements.txt

# SQL STATEMENT:
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
