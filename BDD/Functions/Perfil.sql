DELIMITER //

CREATE FUNCTION delete_perfil_usuario(
    idUsuario INT,
    perfil VARCHAR(100)
)
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    DECLARE resultado VARCHAR(100);
    DECLARE idPerfil INT;

    -- Buscamos el idPerfil basado en el nombre del perfil y el idUsuario
    SELECT p.idPerfil
    INTO idPerfil
    FROM Perfil p
    JOIN Usuario_has_Perfil up ON p.idPerfil = up.idPerfil
    WHERE p.nombre = perfil AND up.idUsuario = idUsuario
    LIMIT 1;

    -- Verificamos si el perfil asignado existe para ese usuario
    IF EXISTS (SELECT 1 
               FROM Usuario_has_Perfil 
               WHERE idUsuario = idUsuario 
               AND idPerfil = idPerfil) THEN
        -- Eliminamos el perfil asignado al usuario
        DELETE FROM Usuario_has_Perfil
        WHERE idUsuario = idUsuario
        AND idPerfil = idPerfil LIMIT 1;

        SET resultado = 'El perfil ha sido removido exitosamente del usuario.';
    ELSE
        -- Si no existe, retornamos un mensaje de error
        SET resultado = 'Error: El perfil no existe para este usuario.';
    END IF;

    RETURN resultado;
END //

DELIMITER ;

DELIMITER //

CREATE FUNCTION set_perfil_usuario(
    idUsuario INT,
    perfilAsignado VARCHAR(100)
)
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    DECLARE resultado VARCHAR(100);
    DECLARE idPerfil INT;

    -- Buscamos el idPerfil basado en el nombre del perfilAsignado y el idUsuario
    SELECT p.idPerfil
    INTO idPerfil
    FROM Perfil p
    JOIN Usuario_has_Perfil up ON up.idPerfil = p.idPerfil
    WHERE up.idUsuario = idUsuario AND p.nombre = perfilAsignado
    LIMIT 1;

    -- Verificamos si el perfil ya está asignado al usuario
    IF EXISTS (SELECT 1 
               FROM Usuario_has_Perfil 
               WHERE idUsuario = idUsuario 
               AND idPerfil = idPerfil) THEN
        -- Si el perfil ya está asignado, devolvemos un mensaje
        SET resultado = 'Error: El perfil ya está asignado al usuario.';
    ELSE
        -- Si el perfil no está asignado, lo insertamos en la tabla Usuario_has_Perfil
        INSERT INTO Usuario_has_Perfil (idUsuario, idPerfil)
        VALUES (idUsuario, idPerfil);

        SET resultado = 'El perfil ha sido asignado exitosamente al usuario.';
    END IF;

    RETURN resultado;
END //

DELIMITER ;