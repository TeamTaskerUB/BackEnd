use teamtasker;
DELIMITER $$

CREATE PROCEDURE get_tarea_proyecto_usuario_etiquetas (
    IN p_etiqueta INT,
    IN p_idTareaGlobal INT,
    IN p_idUsuario INT
)
BEGIN
    -- Verificar si existen tareas que coincidan con los parámetros
    IF EXISTS (
        SELECT 1 
        FROM TareaUnitaria tu
        INNER JOIN TareaGrupal tg ON tu.grupo = tg.idGrupo
        WHERE tu.etiqueta = p_etiqueta 
        AND tg.idProyecto = p_idTareaGlobal
        AND tu.usuario = p_idUsuario
    ) THEN
        -- Si existen, devolver las tareas correspondientes
        SELECT tu.* 
        FROM TareaUnitaria tu
        INNER JOIN TareaGrupal tg ON tu.grupo = tg.idGrupo
        WHERE tu.etiqueta = p_etiqueta 
        AND tg.idProyecto = p_idTareaGlobal
        AND tu.usuario = p_idUsuario;
    ELSE
        -- Si no existen, devolver un error
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se encontraron tareas que coincidan con los parámetros proporcionados.';
    END IF;
    
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_tareas_late_proyecto_usuario (
    IN p_idUsuario INT, 
    IN p_idTareaGlobal INT, 
    IN p_FechaHoy DATETIME
)
BEGIN
    -- Iniciar un bloque de manejo de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Si ocurre un error, devolver un mensaje de error
        SELECT 'Error: ocurrió un problema al intentar obtener las tareas atrasadas.' AS Error;
        ROLLBACK;
    END;

    -- Iniciar una transacción
    START TRANSACTION;

    -- Seleccionar las tareas unitarias que están atrasadas (dateEnd < FechaHoy) asignadas a un usuario en un proyecto específico
    SELECT tu.*
    FROM TareaUnitaria tu
    INNER JOIN TareaGrupal tg ON tu.grupo = tg.idGrupo
    WHERE tu.usuario = p_idUsuario
      AND tg.idProyecto = p_idTareaGlobal
      AND tu.dateEnd < p_FechaHoy
      AND tu.progreso < 100; -- Verificar que la tarea no esté completada (asumo que progreso = 100 es completada)

    -- Si no hay errores, confirmar la transacción
    COMMIT;

END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_tareas_proyecto_usuario (
    IN p_idUsuario INT,
    IN p_idTareaGlobal INT
)
BEGIN
    -- Declare variables
    DECLARE errorMsg VARCHAR(255) DEFAULT '';
    DECLARE tasks_found INT DEFAULT 0;

    -- Check if there are tasks assigned to the user in the project
    SELECT COUNT(*)
    INTO tasks_found
    FROM TareaUnitaria tu
    JOIN TareaGrupal tg ON tu.grupo = tg.idGrupo
    WHERE tu.usuario = p_idUsuario
      AND tg.idProyecto = p_idTareaGlobal;

    -- If no tasks are found, return an error
    IF tasks_found = 0 THEN
        SET errorMsg = 'No se encontraron tareas para el usuario en el proyecto especificado.';
        SELECT errorMsg AS error;
    ELSE
        -- Return the tasks assigned to the user in the project
        SELECT tu.idTareaUnitaria, tu.nombre, tu.dateIn, tu.dateEnd, tu.progreso, tu.duracion, tu.hito, tu.etiqueta, tu.prioridad
        FROM TareaUnitaria tu
        JOIN TareaGrupal tg ON tu.grupo = tg.idGrupo
        WHERE tu.usuario = p_idUsuario
          AND tg.idProyecto = p_idTareaGlobal;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_tarea_prioridad_grupo_proyecto (
    IN p_idTareaGlobal INT,
    IN p_prioridad VARCHAR(60)
)
BEGIN
    -- Declare variables
    DECLARE errorMsg VARCHAR(255) DEFAULT '';
    DECLARE tasks_found INT DEFAULT 0;
    DECLARE priority_id INT;

    -- Get the priority ID based on the provided priority text
    SELECT idPrioridad
    INTO priority_id
    FROM Prioridad
    WHERE tipo = p_prioridad;

    -- Check if any task exists with the specified priority in the project
    SELECT COUNT(*)
    INTO tasks_found
    FROM TareaUnitaria tu
    JOIN TareaGrupal tg ON tu.grupo = tg.idGrupo
    WHERE tg.idProyecto = p_idTareaGlobal
      AND tu.prioridad = priority_id;

    -- If no tasks are found, return an error message
    IF tasks_found = 0 THEN
        SET errorMsg = 'No se encontraron tareas con la prioridad especificada en el proyecto.';
        SELECT errorMsg AS error;
    ELSE
        -- Return the tasks with the specified priority in the project
        SELECT tu.idTareaUnitaria, tu.nombre, tu.dateIn, tu.dateEnd, tu.progreso, tu.duracion, tu.hito, tu.etiqueta, p.tipo AS Prioridad
        FROM TareaUnitaria tu
        JOIN TareaGrupal tg ON tu.grupo = tg.idGrupo
        JOIN Prioridad p ON tu.prioridad = p.idPrioridad
        WHERE tg.idProyecto = p_idTareaGlobal
          AND tu.prioridad = priority_id;
    END IF;
END$$

DELIMITER ;

DELIMITER //

CREATE PROCEDURE get_usuario_tarea_workload_proyectos(
    IN project_id INT,
    IN start_date DATETIME,
    IN end_date DATETIME
)
BEGIN
    -- Variable para controlar errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Retornar mensaje de error en caso de excepción
        SELECT 'Error' AS Error;
    END;

    -- Consulta para obtener usuarios con más de 3 tareas en el rango de fechas dado
    SELECT
        u.idUsuario,
        u.nombre,
        u.apellido,
        COUNT(tu.idTareaUnitaria) AS total_tareas
    FROM
        Usuario u
    JOIN
        TareaUnitaria tu ON u.idUsuario = tu.usuario
    JOIN
        TareaGrupal tg ON tu.grupo = tg.idGrupo
    WHERE
        tg.idProyecto = project_id
        AND tu.dateIn BETWEEN start_date AND end_date
        AND tu.dateEnd BETWEEN start_date AND end_date
    GROUP BY
        u.idUsuario
    HAVING
        COUNT(tu.idTareaUnitaria) > 3;

END //

DELIMITER ;




