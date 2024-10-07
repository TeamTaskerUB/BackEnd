-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema teamtasker
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema teamtasker
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `teamtasker` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
USE `teamtasker` ;

-- -----------------------------------------------------
-- Table `teamtasker`.`Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`Usuario` (
  `idUsuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(70) NOT NULL,
  `apellido` VARCHAR(60) NOT NULL,
  `mail` VARCHAR(100) NOT NULL,
  `contraseña` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idUsuario`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamtasker`.`TareaGlobal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`TareaGlobal` (
  `idProyecto` INT NOT NULL AUTO_INCREMENT,
  `nombre_proyecto` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(200) NOT NULL,
  `dateIn` DATETIME NOT NULL,
  `dateEnd` DATETIME NOT NULL,
  `progreso` DOUBLE NULL,
  `duracion` INT NULL,
  `admin_id` INT NOT NULL,
  PRIMARY KEY (`idProyecto`, `admin_id`),
  UNIQUE INDEX `idProyecto_UNIQUE` (`idProyecto` ASC) VISIBLE,
  INDEX `fk_Proyecto_Usuario1_idx` (`admin_id` ASC) VISIBLE,
  CONSTRAINT `fk_Proyecto_Usuario1`
    FOREIGN KEY (`admin_id`)
    REFERENCES `teamtasker`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamtasker`.`Etiqueta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`Etiqueta` (
  `idEtiqueta` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NULL,
  `idProyecto` INT NOT NULL,
  PRIMARY KEY (`idEtiqueta`, `idProyecto`),
  INDEX `fk_Etiqueta_Proyecto1_idx` (`idProyecto` ASC) VISIBLE,
  CONSTRAINT `fk_Etiqueta_Proyecto1`
    FOREIGN KEY (`idProyecto`)
    REFERENCES `teamtasker`.`TareaGlobal` (`idProyecto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamtasker`.`Prioridad`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`Prioridad` (
  `idPrioridad` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(60) NOT NULL,
  PRIMARY KEY (`idPrioridad`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamtasker`.`TareaGrupal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`TareaGrupal` (
  `idGrupo` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(200) NOT NULL,
  `idProyecto` INT NOT NULL,
  `admin` INT NOT NULL,
  `completada` TINYINT NOT NULL,
  `dateIn` DATETIME NOT NULL,
  `dateEnd` DATETIME NOT NULL,
  `progreso` DOUBLE NULL,
  `duracion` INT NULL,
  `estado` VARCHAR(70) NOT NULL,
  `etiqueta` INT NOT NULL,
  `prioridad` INT NOT NULL,
  PRIMARY KEY (`idGrupo`, `idProyecto`, `admin`, `etiqueta`, `prioridad`),
  INDEX `fk_Grupo_Proyecto_idx` (`idProyecto` ASC) VISIBLE,
  INDEX `fk_Grupo_Usuario1_idx` (`admin` ASC) VISIBLE,
  INDEX `fk_Grupo_Etiqueta1_idx` (`etiqueta` ASC) VISIBLE,
  INDEX `fk_Grupo_Prioridad1_idx` (`prioridad` ASC) VISIBLE,
  CONSTRAINT `fk_Grupo_Proyecto`
    FOREIGN KEY (`idProyecto`)
    REFERENCES `teamtasker`.`TareaGlobal` (`idProyecto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Grupo_Usuario1`
    FOREIGN KEY (`admin`)
    REFERENCES `teamtasker`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Grupo_Etiqueta1`
    FOREIGN KEY (`etiqueta`)
    REFERENCES `teamtasker`.`Etiqueta` (`idEtiqueta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Grupo_Prioridad1`
    FOREIGN KEY (`prioridad`)
    REFERENCES `teamtasker`.`Prioridad` (`idPrioridad`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamtasker`.`TareaUnitaria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`TareaUnitaria` (
  `idTareaUnitaria` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `grupo` INT NOT NULL,
  `usuario` INT NOT NULL,
  `dateIn` DATETIME NULL,
  `dateEnd` DATETIME NULL,
  `progreso` DOUBLE NULL,
  `duracion` INT NULL,
  `hito` TINYINT NULL,
  `etiqueta` INT NOT NULL,
  `prioridad` INT NOT NULL,
  PRIMARY KEY (`idTareaUnitaria`, `grupo`, `usuario`, `etiqueta`, `prioridad`),
  INDEX `fk_TareaUnitaria_Grupo1_idx` (`grupo` ASC) VISIBLE,
  INDEX `fk_TareaUnitaria_Usuario1_idx` (`usuario` ASC) VISIBLE,
  INDEX `fk_TareaUnitaria_Etiqueta1_idx` (`etiqueta` ASC) VISIBLE,
  INDEX `fk_TareaUnitaria_Prioridad1_idx` (`prioridad` ASC) VISIBLE,
  CONSTRAINT `fk_TareaUnitaria_Grupo1`
    FOREIGN KEY (`grupo`)
    REFERENCES `teamtasker`.`TareaGrupal` (`idGrupo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TareaUnitaria_Usuario1`
    FOREIGN KEY (`usuario`)
    REFERENCES `teamtasker`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TareaUnitaria_Etiqueta1`
    FOREIGN KEY (`etiqueta`)
    REFERENCES `teamtasker`.`Etiqueta` (`idEtiqueta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TareaUnitaria_Prioridad1`
    FOREIGN KEY (`prioridad`)
    REFERENCES `teamtasker`.`Prioridad` (`idPrioridad`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamtasker`.`Perfil`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`Perfil` (
  `idPerfil` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(60) NOT NULL,
  PRIMARY KEY (`idPerfil`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamtasker`.`TareaGrupal_has_Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`TareaGrupal_has_Usuario` (
  `grupo` INT NOT NULL,
  `proyecto` INT NOT NULL,
  `usuario` INT NOT NULL,
  PRIMARY KEY (`grupo`, `proyecto`, `usuario`),
  INDEX `fk_Grupo_has_Usuario_Usuario1_idx` (`usuario` ASC) VISIBLE,
  INDEX `fk_Grupo_has_Usuario_Grupo1_idx` (`grupo` ASC, `proyecto` ASC) VISIBLE,
  CONSTRAINT `fk_Grupo_has_Usuario_Grupo1`
    FOREIGN KEY (`grupo` , `proyecto`)
    REFERENCES `teamtasker`.`TareaGrupal` (`idGrupo` , `idProyecto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Grupo_has_Usuario_Usuario1`
    FOREIGN KEY (`usuario`)
    REFERENCES `teamtasker`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `teamtasker`.`Usuario_has_Perfil`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `teamtasker`.`Usuario_has_Perfil` (
  `idUsuario` INT NOT NULL,
  `idPerfil` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idUsuario`, `idPerfil`),
  INDEX `fk_Usuario_has_Perfil_Perfil1_idx` (`idPerfil` ASC) VISIBLE,
  INDEX `fk_Usuario_has_Perfil_Usuario1_idx` (`idUsuario` ASC) VISIBLE,
  CONSTRAINT `fk_Usuario_has_Perfil_Usuario1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `teamtasker`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_has_Perfil_Perfil1`
    FOREIGN KEY (`idPerfil`)
    REFERENCES `teamtasker`.`Perfil` (`idPerfil`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
