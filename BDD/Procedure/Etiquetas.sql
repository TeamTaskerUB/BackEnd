DELIMITER $$

CREATE PROCEDURE get_etiquetas_tareaGrupal (
    IN idTareaGrupal INT
)
BEGIN
    -- Manejar errores con un bloque HANDLER
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Si ocurre un error, selecciona el mensaje de error
        SELECT 'Error: No se pudo obtener las etiquetas para la tarea grupal' AS Error;
        ROLLBACK;
    END;

    -- Iniciar la transacción
    START TRANSACTION;

    -- Obtener las etiquetas asociadas a la tarea grupal
    SELECT e.idEtiqueta, e.nombre
    FROM Etiqueta e
    JOIN TareaGrupal tg ON e.idProyecto = tg.idProyecto
    WHERE tg.idGrupo = idTareaGrupal;

    -- Si no se encuentran etiquetas, devolver un mensaje
    IF ROW_COUNT() = 0 THEN
        SELECT 'Error: No se encontraron etiquetas para la tarea grupal' AS Error;
    END IF;

    -- Finalizar la transacción
    COMMIT;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_etiquetas_tareaUnitaria (
    IN idTareaUnitaria INT
)
BEGIN
    -- Manejar errores con un bloque HANDLER
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Si ocurre un error, selecciona el mensaje de error
        SELECT 'Error: No se pudo obtener las etiquetas para la tarea unitaria' AS Error;
        ROLLBACK;
    END;

    -- Iniciar la transacción
    START TRANSACTION;

    -- Obtener las etiquetas asociadas a la tarea unitaria
    SELECT e.idEtiqueta, e.nombre
    FROM Etiqueta e
    JOIN TareaUnitaria tu ON e.idEtiqueta = tu.etiqueta
    WHERE tu.idTareaUnitaria = idTareaUnitaria;

    -- Si no se encuentran etiquetas, devolver un mensaje
    IF ROW_COUNT() = 0 THEN
        SELECT 'Error: No se encontraron etiquetas para la tarea unitaria' AS Error;
    END IF;

    -- Finalizar la transacción
    COMMIT;
END$$

DELIMITER ;
