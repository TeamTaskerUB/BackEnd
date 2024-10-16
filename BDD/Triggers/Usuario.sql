
DELIMITER $$

CREATE TRIGGER after_usuario_delete
AFTER DELETE ON Usuario
FOR EACH ROW
BEGIN
    -- Desvincular al usuario de los proyectos en los que estaba
    DELETE FROM TareaGrupal_has_Usuario
    WHERE usuario = OLD.idUsuario;
    
    -- Las tareas unitarias asociadas a este usuario deben quedar sin asignar (usuario NULL)
    UPDATE TareaUnitaria
    SET usuario = NULL
    WHERE usuario = OLD.idUsuario;
END$$

DELIMITER ;
