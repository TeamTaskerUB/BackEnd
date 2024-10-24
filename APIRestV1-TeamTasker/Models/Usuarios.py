from flask import jsonify
from flask_login import UserMixin
from .MySQLConnector import MySQLConnector
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(UserMixin):
    def __init__(self, idUser, mail, contraseña, nombre, apellido):
        self.idUser = idUser
        self.mail = mail
        self.contraseña = contraseña
        self.nombre = nombre
        self.apellido = apellido

    @classmethod
    def register(cls, mail, password, nombre, apellido):
        db = MySQLConnector(config_file="config.json")
        db.connect()

        #Valida que el usuario no exista
        query = 'SELECT mail FROM usuario WHERE mail = %s'
        params = (mail,)

        try:
            if not db.execute_query(query, params):
                query = 'INSERT INTO usuario (nombre, apellido, mail, contraseña) VALUES (%s, %s, %s, %s)'
                params = (nombre, apellido, mail, password)
                db.execute_query(query, params)
                return jsonify({"message": "El usuario fue registrado."}), 200
            else:
                return jsonify({"error": "El usuario ya existe."}), 409
        except Exception as e:
            return jsonify({"error": "Error al registrar el usuario en la base de datos: {}".format(e)}), 500
        finally:
            db.disconnect()

    @classmethod
    def login(cls, mail, password):
        db = MySQLConnector()
        db.connect()

        query = 'SELECT mail FROM usuario WHERE mail = %s'
        params = (mail,)
        try:
            result = db.fetch_data(query, params)
            if result:
                email, nombre, apellido, hashed_password, perfil, id_user = result[0]
                if check_password_hash(hashed_password, password):
                    return cls(id_user, email, password, nombre, apellido), jsonify({"message": "Usuario logueado."}), 200
                else:
                    return jsonify({"error": "Credenciales inválidas."}), 401
            else:
                return jsonify({"error": "No se encontró usuario con ese correo."}), 402
        except Exception as e:
            return jsonify({"error": "Error al iniciar sesión: {}".format(e)}), 403

    @classmethod
    def get_by_email(cls, mail):
        db = MySQLConnector()
        db.connect()

        query = 'SELECT email, nombre_completo, contraseña FROM usuario WHERE mail = %s'
        params = (mail,)
        try:
            result = db.fetch_data(query, params)
            if result:
                email, nombre, apellido, hashed_password, perfil, id_user = result[0]
                return cls(id_user, email, hashed_password, nombre, apellido)
            else:
                return None
        except Exception as e:
            return jsonify({"error": "Error al obtener el usuario por email: {}".format(e)})

    def sugerirTarea(nombre, descripcion):
        pass

    def completarTarea(self):
        pass

class AdministradorProyecto:
    def __init__(self, *args):
        pass
        