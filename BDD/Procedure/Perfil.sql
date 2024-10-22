DELIMITER $$

CREATE PROCEDURE get_perfil_usuario(IN p_idUsuario INT)
BEGIN
    -- Seleccionamos los perfiles asociados al idUsuario
    SELECT p.*
    FROM Perfil p
    INNER JOIN Usuario_has_Perfil up ON p.idPerfil = up.idPerfil
    WHERE up.idUsuario = p_idUsuario;
END$$

DELIMITER ;
