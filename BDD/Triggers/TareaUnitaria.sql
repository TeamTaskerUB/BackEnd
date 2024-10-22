
DELIMITER $$

CREATE TRIGGER desvincular_tarea
AFTER DELETE ON `TareaUnitaria` FOR EACH ROW
BEGIN
  
  DELETE FROM `Grupo_has_Usuario`
  WHERE `usuario` = OLD.usuario 
    AND `grupo` = OLD.grupo 
    AND `Grupo_Proyecto` = (SELECT `proyecto` FROM `Grupo` WHERE `idGrupo` = OLD.grupo);
END $$

DELIMITER ;

DELIMITER //

CREATE TRIGGER Demasiadas_Actividades
BEFORE INSERT ON TareaUnitaria
FOR EACH ROW
BEGIN
    DECLARE total_tareas INT;

    SELECT COUNT(*) INTO total_tareas
    FROM TareaUnitaria 
    WHERE usuario = NEW.usuario
    AND grupo = NEW.grupo
    AND (
        (NEW.dateIn BETWEEN dateIn AND dateEnd) OR
        (NEW.dateEnd BETWEEN dateIn AND dateEnd) OR
        (dateIn BETWEEN NEW.dateIn AND NEW.dateEnd) OR
        (dateEnd BETWEEN NEW.dateIn AND NEW.dateEnd)
    );

    IF total_tareas >= 3 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario ya tiene el número máximo de tareas asignadas en la misma franja de tiempo para este proyecto';
    END IF;
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER Validar_Fecha_Tarea
BEFORE INSERT ON TareaUnitaria
FOR EACH ROW
BEGIN
    DECLARE proyecto_dateEnd DATETIME;

    SELECT dateEnd INTO proyecto_dateEnd
    FROM TareaGlobal
    WHERE idProyecto = (SELECT idProyecto FROM TareaGrupal WHERE idGrupo = NEW.grupo);

    IF NEW.dateIn > proyecto_dateEnd OR NEW.dateEnd > proyecto_dateEnd THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La tarea excede la fecha de finalización del proyecto';
    END IF;
END//

DELIMITER ;
