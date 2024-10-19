DELIMITER //

CREATE PROCEDURE get_usuarios_proyecto(
    IN idTareaGrupal INT
)
BEGIN
    -- Seleccionamos los usuarios asociados al proyecto (TareaGrupal)
    SELECT u.idUsuario, u.nombre, u.apellido
    FROM Usuario u
    JOIN TareaGrupal_has_Usuario tgu ON u.idUsuario = tgu.usuario
    JOIN TareaGrupal tg ON tg.idGrupo = tgu.grupo
    WHERE tg.idGrupo = idTareaGrupal
    ORDER BY u.nombre;
END //

DELIMITER ;

