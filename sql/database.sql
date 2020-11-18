-- MySQL Administrator dump 1.4
--
-- ------------------------------------------------------
-- Server version	5.7.31-log


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


--
-- Create schema sw7up
--

CREATE DATABASE IF NOT EXISTS sw7up;
USE sw7up;

--
-- Definition of table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `_id` varchar(10) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(10) NOT NULL,
  `email` varchar(45) NOT NULL,
  `phoneNumber` varchar(45) NOT NULL,
  `department` tinyint(1) unsigned NOT NULL,
  `role` tinyint(1) unsigned NOT NULL,
  `token` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `accounts`
--

/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` (`id`,`_id`,`password`,`name`,`email`,`phoneNumber`,`department`,`role`,`token`) VALUES 
 (1,'admin','$2a$10$hptYHxypEhFqqze2p2IUv.jZU7u6ZgXutvMoOZvSNOOc.uDSf.H96','관리자','admin@cbnu.ac.kr','01000000000',0,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiX2lkIjoiYWRtaW4iLCJuYW1lIjoi6rSA66as7J6QIiwiZW1haWwiOiJhZG1pbkBjYm51LmFjLmtyIiwicGhvbmVOdW1iZXIiOiIwMTAwMDAwMDAwMCIsImRlcGFydG1lbnQiOjAsInJvbGUiOjMsImlzQWRtaW4iOnRydWUsImlhdCI6MTYwNTUwNzcxMiwiZXhwIjoxNjA1NTExMzEyfQ.In4nwky3Bk1LJYeIK3YL3pKr0_Pkgvqdc5bJO9d0gQI');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;


--
-- Definition of table `courses`
--

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `year` varchar(4) NOT NULL,
  `semester` varchar(1) NOT NULL,
  `department` tinyint(1) unsigned NOT NULL,
  `courseName` varchar(20) NOT NULL,
  `professorName` varchar(10) NOT NULL,
  `tutorName` varchar(10) NOT NULL,
  `tutorNumber` varchar(10) NOT NULL,
  `limit` tinyint(1) unsigned NOT NULL,
  `fileId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `courses`
--

/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;


--
-- Definition of table `files`
--

DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `originalFileName` varchar(45) NOT NULL,
  `serverFileName` varchar(45) NOT NULL,
  `type` tinyint(1) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `files`
--

/*!40000 ALTER TABLE `files` DISABLE KEYS */;
/*!40000 ALTER TABLE `files` ENABLE KEYS */;


--
-- Definition of table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `accountId` int(10) unsigned NOT NULL,
  `courseId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `registrations`
--

/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;


--
-- Definition of table `reports`
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `accountId` int(10) unsigned NOT NULL,
  `courseId` int(10) unsigned NOT NULL,
  `week` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `reports`
--

/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;




/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
