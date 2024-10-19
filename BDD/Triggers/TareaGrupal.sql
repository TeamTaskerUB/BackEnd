DELIMITER $$

CREATE TRIGGER verificar_duracion_tarea_grupal
BEFORE INSERT ON TareaGrupal
FOR EACH ROW
BEGIN
  DECLARE proyecto_duracion INT;

  -- Obtener la duración del proyecto asociado
  SELECT TIMESTAMPDIFF(DAY, dateIn, dateEnd) INTO proyecto_duracion
  FROM TareaGlobal
  WHERE idProyecto = NEW.idProyecto;

  -- Verificar si la duración de la tarea grupal excede la del proyecto
  IF NEW.duracion > proyecto_duracion THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'La duración de la tarea grupal excede el límite de tiempo del proyecto.';
  END IF;
END$$

DELIMITER ;




