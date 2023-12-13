-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sign_upin
-- ------------------------------------------------------
-- Server version	8.0.26

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(100) NOT NULL COMMENT '사용자 로그인 아이디',
  `pw` varchar(200) NOT NULL COMMENT '사용자 로그인 패스워드',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('a','$2b$10$7YLgnO55/1SNOvhLX3iE..uz73H8nLQyrHM3nurDE0NqhipSmZy66'),('aa','$2b$10$JTynAc1kLGEfHsJcGJijeuV6z05iq7hQeubpcTA5F9qHqKhodoThK'),('aaa','$2b$10$la9NO/xtAEb8jMDSP/ToK.YApN3scbrOLpUtw4Mdh56fY8CCVZSaC'),('aaaa','$2b$10$B4CFmSrXnI410fmhaXEB8Oc.sWSEdvMEw6lMWTsM9JJzj4DFjTcBW'),('aaaaa','$2b$10$9SBfKVjo/f29VPXIuJksHOffE4DXPUkf8lwuuahXwAkYsBb6U0DZ6'),('b','$2b$10$QM/jo3acsLlEPha6kg4DouU0JnB7PQdBzo3rfKAs993KrUVZRXpQa'),('hong','$2b$10$nHwZ/Q/lstzEZMSKNhMMk.pc/xi8k1JKrW2BzhM/dzEgx9FFTGN.6'),('joo','$2b$10$6HfTXyJzTuD1v4yuNMzSNu5QNuQp9.R7.ZBbe9f8uixF0VyN4WG8e'),('kim','$2b$10$bbV73Gt97a6dO1PlS8T59O8aQU35tqewQozgS7HB.iPL4nVykMWWe'),('yu','$2b$10$oz1kDEUIIA1yVnj1GI2RweS45dUJR/Sh8mvUo9S5xQ6gpJDWbABa2');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-13 21:20:35
