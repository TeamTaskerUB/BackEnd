SET GLOBAL log_bin_trust_function_creators = 1;

DROP FUNCTION IF EXISTS teamtasker.set_usuario_join_proyecto;
DELIMITER //
CREATE FUNCTION teamtasker.set_usuario_join_proyecto (idTareaGlobal INT, idUsuario INT)
RETURNS TINYINT
BEGIN
	DECLARE check_id INT;
    SET @check_id = -1;
    
    #Se fija que los IDs ingresados sean válidos (números positivos.)
    IF idTareaGlobal < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idTareaGlobal es un valor inválido. Ingrese un número mayor a 0.';
    END IF;
    
    IF idUsuario < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idUsuario es un valor inválido. Ingrese un número mayor a 0.';
    END IF;
    
    #Se verifica que exista el usuario con su ID.
    SELECT Usuario.idUsuario INTO @check_id FROM teamtasker.Usuario WHERE Usuario.idUsuario = idUsuario;
    IF @check_id = -1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idUsuario no pertenece al ID de un usuario en la base de datos.';
    END IF;
    SET @check_id = -1;
    
    #Se verifica que exista la tarea global con su ID.
    SELECT TareaGlobal.idProyecto INTO @check_id FROM teamtasker.TareaGlobal WHERE TareaGlobal.idProyecto = idTareaGlobal;
     IF @check_id = -1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idTareaGlobal no pertenece al ID de una tarea global en la base de datos.';
    END IF;
    INSERT INTO Usuario_has_TareaGlobal (Usuario_idUsuario, TareaGlobal_idProyecto) VALUES (idUsuario, idTareaGlobal);
    RETURN 1;
END;

DROP FUNCTION IF EXISTS teamtasker.get_usuario_join_proyecto;
DELIMITER //
CREATE FUNCTION teamtasker.get_usuario_join_proyecto (idTareaGlobal INT, idUsuario INT)
RETURNS TINYINT
BEGIN
	DECLARE check_id INT;
    SET @check_id = -1;
    
    #Se fija que los IDs ingresados sean válidos (números positivos.)
    IF idTareaGlobal < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idTareaGlobal es un valor inválido. Ingrese un número mayor a 0.';
    END IF;
    
    IF idUsuario < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idUsuario es un valor inválido. Ingrese un número mayor a 0.';
    END IF;
    
    #Se verifica que exista el usuario con su ID.
    SELECT Usuario.idUsuario INTO @check_id FROM teamtasker.Usuario WHERE Usuario.idUsuario = idUsuario;
    IF @check_id = -1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idUsuario no pertenece al ID de un usuario en la base de datos.';
    END IF;
    SET @check_id = -1;
    
    #Se verifica que exista la tarea global con su ID.
    SELECT TareaGlobal.idProyecto INTO @check_id FROM teamtasker.TareaGlobal WHERE TareaGlobal.idProyecto = idTareaGlobal;
     IF @check_id = -1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idTareaGlobal no pertenece al ID de una tarea global en la base de datos.';
    END IF;
    SET @check_id = -1;
    
    SELECT Usuario_has_TareaGlobal.Usuario_idUsuario INTO @check_id FROM teamtasker.Usuario_has_tareaGlobal WHERE Usuario_has_TareaGlobal.Usuario_idUsuario = idUsuario AND Usuario_has_TareaGlobal.TareaGlobal_idProyecto = idTareaGlobal;
    #Si @check_id = -1 significa que el usuario no pertenece a esa tarea global.
    IF @check_id = -1 THEN
		RETURN 0;
    END IF;
    RETURN 1;
END;

DROP FUNCTION IF EXISTS teamtasker.set_admin_proyecto;
DELIMITER //
CREATE FUNCTION teamtasker.set_admin_proyecto (idTareaGlobal INT, idUsuario INT)
RETURNS TINYINT
BEGIN
	DECLARE check_id INT;
    SET @check_id = -1;
    
    #Se fija que los IDs ingresados sean válidos (números positivos.)
    IF idTareaGlobal < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idTareaGlobal es un valor inválido. Ingrese un número mayor a 0.';
    END IF;
    
    IF idUsuario < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idUsuario es un valor inválido. Ingrese un número mayor a 0.';
    END IF;
    
    #Se verifica que exista el usuario con su ID.
    SELECT Usuario.idUsuario INTO @check_id FROM teamtasker.Usuario WHERE Usuario.idUsuario = idUsuario;
    IF @check_id = -1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idUsuario no pertenece al ID de un usuario en la base de datos.';
    END IF;
    SET @check_id = -1;
    
    #Se verifica que exista la tarea global con su ID.
    SELECT TareaGlobal.idProyecto INTO @check_id FROM teamtasker.TareaGlobal WHERE TareaGlobal.idProyecto = idTareaGlobal;
     IF @check_id = -1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idTareaGlobal no pertenece al ID de una tarea global en la base de datos.';
    END IF;
    SET @check_id = -1;
    
    UPDATE teamtasker.TareaGlobal SET TareaGlobal.admin_id = idUsuario WHERE TareaGlobal.idProyecto = idTareaGlobal;
    RETURN 1;
END;

DROP FUNCTION IF EXISTS teamtasker.quit_tareaGlobal_usuario;
DELIMITER //
CREATE FUNCTION teamtasker.quit_tareaGlobal_usuario (idTareaGlobal INT, idUsuario INT)
RETURNS TINYINT
BEGIN
	DECLARE check_id INT;
    SET @check_id = -1;
    
    #Se fija que los IDs ingresados sean válidos (números positivos.)
    IF idTareaGlobal < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idTareaGlobal es un valor inválido. Ingrese un número mayor a 0.';
    END IF;
    
    IF idUsuario < 0 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idUsuario es un valor inválido. Ingrese un número mayor a 0.';
    END IF;
    
    #Se verifica que exista el usuario con su ID.
    SELECT Usuario.idUsuario INTO @check_id FROM teamtasker.Usuario WHERE Usuario.idUsuario = idUsuario;
    IF @check_id = -1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idUsuario no pertenece al ID de un usuario en la base de datos.';
    END IF;
    SET @check_id = -1;
    
    #Se verifica que exista la tarea global con su ID.
    SELECT TareaGlobal.idProyecto INTO @check_id FROM teamtasker.TareaGlobal WHERE TareaGlobal.idProyecto = idTareaGlobal;
     IF @check_id = -1 THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'idTareaGlobal no pertenece al ID de una tarea global en la base de datos.';
    END IF;
    SET @check_id = -1;
    
    DELETE FROM teamtasker.Usuario_has_TareaGlobal WHERE Usuario_has_TareaGlobal.Usuario_idUsuario = idUsuario AND Usuario_has_TareaGlobal.TareaGlobal_idProyecto = idTareaGlobal;
    SELECT ROW_COUNT() INTO @check_id;
    
    #Significa que el usuario no estaba asignado a ese proyecto.
    IF @check_id = 0 THEN
		RETURN 0;
	END IF;
    
    DELETE FROM teamtasker.TareaGrupal_has_Usuario WHERE TareaGrupal_has_Usuario.usuario = idUsuario AND TareaGrupal_has_Usuario.proyecto = idTareaGlobal;
    #Consultar como eliminar las tareas unitarias sin poder iterar a través de los grupos.
    RETURN 1;
END;

