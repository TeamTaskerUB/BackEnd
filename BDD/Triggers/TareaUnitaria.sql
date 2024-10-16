

DELIMITER //

CREATE TRIGGER Demasiadas_Actividades
BEFORE INSERT ON TareaUnitaria
FOR EACH ROW
BEGIN
    IF (SELECT COUNT(*) FROM TareaUnitaria WHERE usuario = NEW.usuario) >= 3 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El usuario ya tiene el número máximo de tareas asignadas';
    END IF;
END//

DELIMITER ;


