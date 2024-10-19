DELIMITER //

CREATE TRIGGER Eliminar_Etiqueta_Tarea
AFTER DELETE ON Etiqueta
FOR EACH ROW
BEGIN
    DELETE FROM TareaUnitaria
    WHERE etiqueta = OLD.idEtiqueta
    AND grupo IN (SELECT idGrupo FROM TareaGrupal WHERE idProyecto = OLD.idProyecto);
END//

DELIMITER ;