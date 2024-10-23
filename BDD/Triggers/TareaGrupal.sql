DELIMITER $$

CREATE TRIGGER verificar_duracion_tarea_grupal
BEFORE INSERT ON TareaGrupal
FOR EACH ROW
BEGIN
  DECLARE proyecto_duracion INT;


  SELECT TIMESTAMPDIFF(DAY, dateIn, dateEnd) INTO proyecto_duracion
  FROM TareaGlobal
  WHERE idProyecto = NEW.idProyecto;

  IF NEW.duracion > proyecto_duracion THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'La duración de la tarea grupal excede el límite de tiempo del proyecto.';
  END IF;
END$$

DELIMITER ;

DELIMITER //

CREATE TRIGGER Eliminar_Tareas_Asociadas
AFTER DELETE ON TareaGrupal
FOR EACH ROW
BEGIN
    DELETE FROM TareaUnitaria
    WHERE grupo = OLD.idGrupo;
END//

DELIMITER ;


