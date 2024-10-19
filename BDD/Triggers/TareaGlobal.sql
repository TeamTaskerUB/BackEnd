DELIMITER $$

CREATE TRIGGER after_tareaglobal_delete
AFTER DELETE ON tareaglobal
FOR EACH ROW
BEGIN
    -- Eliminar las tareas grupales asociadas al proyecto
    DELETE FROM TareaGrupal
    WHERE idProyecto = OLD.idProyecto;

    -- Eliminar las tareas unitarias asociadas a los grupos de tareas eliminados
    DELETE tu FROM TareaUnitaria tu
    INNER JOIN TareaGrupal tg ON tu.grupo = tg.idGrupo
    WHERE tg.idProyecto = OLD.idProyecto;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER after_tareaglobal_delete_unlink_users
AFTER DELETE ON tareaglobal
FOR EACH ROW
BEGIN
    -- Desvincular a los usuarios asociados al proyecto eliminado
    DELETE FROM TareaGrupal_has_Usuario
    WHERE proyecto = OLD.idProyecto;
END$$

DELIMITER ;

