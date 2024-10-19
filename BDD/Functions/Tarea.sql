DELIMITER //

CREATE FUNCTION modify_tarea_prioridad(
    idTareaUnitaria INT,
    nuevaPrioridad INT
)
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    DECLARE resultado VARCHAR(100);
    
    -- Verificamos si la tarea existe
    IF EXISTS (SELECT 1 FROM TareaUnitaria WHERE idTareaUnitaria = idTareaUnitaria) THEN
        -- Actualizamos la prioridad de la tarea
        UPDATE TareaUnitaria
        SET prioridad = nuevaPrioridad
        WHERE idTareaUnitaria = idTareaUnitaria LIMIT 1;
        
        SET resultado = 'La prioridad ha sido modificada exitosamente.';
    ELSE
        -- Si no existe la tarea, retornamos un mensaje de error
        SET resultado = 'Error: La tarea no existe.';
    END IF;
    
    RETURN resultado;
END //

DELIMITER ;

DELIMITER //

CREATE FUNCTION set_tarea_usuario_proyecto(
    idTareaUnitaria INT,
    idUsuario INT
)
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    DECLARE resultado VARCHAR(100);

    -- Verificamos si la tarea existe
    IF EXISTS (SELECT 1 FROM TareaUnitaria WHERE idTareaUnitaria = idTareaUnitaria) THEN
        -- Actualizamos la tarea con el usuario asignado
        UPDATE TareaUnitaria
        SET usuario = idUsuario
        WHERE idTareaUnitaria = idTareaUnitaria LIMIT 1;
        
        SET resultado = 'La tarea ha sido asignada exitosamente al usuario.';
    ELSE
        SET resultado = 'Error: La tarea no existe.';
    END IF;

    RETURN resultado;
END //

DELIMITER ;

DELIMITER //

CREATE FUNCTION set_etiquetas_tarea(
    idTareaUnitaria INT,
    etiqueta INT
)
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    DECLARE resultado VARCHAR(100);

    -- Verificamos si la tarea existe
    IF EXISTS (SELECT 1 FROM TareaUnitaria WHERE idTareaUnitaria = idTareaUnitaria) THEN
        -- Actualizamos la tarea con la etiqueta
        UPDATE TareaUnitaria
        SET etiqueta = etiqueta
        WHERE idTareaUnitaria = idTareaUnitaria LIMIT 1;
        
        SET resultado = 'La etiqueta ha sido asignada exitosamente a la tarea.';
    ELSE
        SET resultado = 'Error: La tarea no existe.';
    END IF;

    RETURN resultado;
END //

DELIMITER ;

DELIMITER //

DELIMITER //

CREATE FUNCTION get_count_tarea_completed_proyecto_usuario(
    idUsuario INT,
    fechaIni DATE,
    fechaEnd DATE,
    idTareaGlobal INT
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE cuenta INT;

    -- Contar las tareas donde el progreso es 100 (tareas completadas)
    SELECT COUNT(*) INTO cuenta
    FROM TareaUnitaria
    WHERE usuario = idUsuario
    AND idTareaGlobal = idTareaGlobal
    AND dateIn >= fechaIni
    AND dateEnd <= fechaEnd
    AND progreso = 100;  -- Progreso de 100 marca la tarea como completada

    RETURN cuenta;
END //

DELIMITER ;


