from flask import jsonify
from flask_login import UserMixin
from MySQLConnector import MySQLConnector
from werkzeug.security import generate_password_hash, check_password_hash
from mysql.connector import Error

class Usuario(UserMixin):
    def __init__(self, idUser, email, contraseña, nombre, apellido):
        self.idUser = idUser
        self.email = email
        self.contraseña = contraseña
        self.nombre = nombre
        self.apellido = apellido

    @classmethod
    def register(cls, mail, password, nombre, apellido):
        db = MySQLConnector()
        db.connect()

        query = 'SELECT email FROM usuarios WHERE email = {}'.format(mail)

        try:
            if not db.execute_query(query):
                query = 'INSERT INTO usuarios (nombre, apellido, mail, password) VALUES ({0}, {1}, {2}, {3})'.format(
                    nombre, apellido, mail, password)
                db.execute_query(query)
                return jsonify({"message": "El usuario fue registrado."}), 200
            else:
                return None, jsonify({"error": "El usuario ya existe."}), 409
        except Error as e:
            return None, jsonify({"error": "Error al registrar el usuario en la base de datos: {}".format(e)})
        finally:
            db.disconnect()

    @classmethod
    def login(cls, mail, password):
        db = MySQLConnector()
        db.connect()

        query = 'SELECT * FROM usuarios WHERE email = %s'.format(mail)
        try:
            result = db.fetch_data(query)
            if result:
                email, nombre, apellido, hashed_password, perfil, id_user = result[0]
                if check_password_hash(hashed_password, password):
                    return cls(id_user, email, password, nombre, apellido), jsonify({"message": "Usuario logueado."}), 200
                else:
                    return None, jsonify({"error": "Credenciales inválidas."}), 401
            else:
                return None, jsonify({"error": "No se encontró usuario con ese correo."}), 402
        except Error as e:
            return None, jsonify({"error": "Error al iniciar sesión: {}".format(e)}), 403

    @classmethod
    def get_by_email(cls, email):
        db = MySQLConnector()
        db.connect()

        query = 'SELECT email, nombre_completo, contraseña, perfil FROM usuarios WHERE email = %s'.format(email)
        try:
            result = db.fetch_data(query)
            if result:
                email, nombre, apellido, hashed_password, perfil, id_user = result[0]
                return cls(id_user, email, hashed_password, nombre, apellido)
            else:
                return None
        except Exception as e:
            return None, jsonify({"error": "Error al obtener el usuario por email: {}".format(e)})

    def sugerirTarea(nombre, descripcion):
        pass

    def completarTarea(self):
        pass

class AdministradorProyecto:
    def __init__(self, *args):
        pass
        