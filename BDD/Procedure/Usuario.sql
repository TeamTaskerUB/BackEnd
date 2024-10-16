use teamtasker;
DELIMITER //

CREATE PROCEDURE get_usuarios_grupo_proyecto (IN idTareaGrupal INT)
BEGIN
   SELECT * FROM Usuario
   INNER JOIN tareagrupal_has_usuario tgu ON u.idUsuario = tgu.Usuario
    INNER JOIN tareagrupal tg ON tgu.Grupo = tg.IdGrupo
    WHERE tg.idGrupo = IdTareaGrupal;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE get_adminsGrupo_grupo_proyecto(IN idTareaGrupal INT)
BEGIN
    SELECT tg.admin, u.nombre, u.apellido, u.mail
    FROM TareaGrupal tg
    JOIN Usuario u ON tg.admin = u.idUsuario
    WHERE tg.idGrupo = idTareaGrupal;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE get_usuario_proyecto(IN idUsuario INT)
BEGIN
    SELECT tg.idProyecto, tg.nombre_proyecto, tg.descripcion, tg.dateIn, tg.dateEnd, tg.progreso, tg.duracion
    FROM TareaGlobal tg
    JOIN TareaGrupal_has_Usuario tgu ON tg.idProyecto = tgu.proyecto
    JOIN Usuario u ON u.idUsuario = tgu.usuario
    WHERE u.idUsuario = idUsuario;
END //

DELIMITER ;

