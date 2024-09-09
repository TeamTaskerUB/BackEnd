import mysql.connector
from mysql.connector import Error
import json

class MySQLConnector:
    _instance = None

    def __new__(cls, *args, **kwargs):
        # Sobreescribe el metodo new __new__ para implementar patron Singleton
        if cls._instance is None:
            cls._instance = super(MySQLConnector, cls).__new__(cls)
        return cls._instance

    def __init__(self, config_file="config.json"):
        # Inicializa la clase connector a traves de un json config
        if not hasattr(self, 'initialized'):  # Esta linea EVITA
            self.load_config(config_file)
            self.connection = None
            self.initialized = True

    def load_config(self, config_file):
        try:
            with open(config_file, 'r') as file:
                config = json.load(file)
                self.host = config["host"]
                self.user = config["user"]
                self.password = config["password"]
                self.database = config["database"]
        except Exception as ex:
            print(f"Error al cargar el archivo de configuracion: {ex}")

    def connect(self):
        # Establece la conexion a la base de datos
        try:
            self.connection = mysql.connector.connect(
                host = self.host,
                user = self.user,
                password = self.password,
                database = self.database
            )
            if self.connection.is_connected():
                print("Conexión a base de datos establecida")
            else:
                print("No se pudo establecer la conexión a la base de datos")
        except Error as error:
            print(f"Error al conectar a la base de datos: {error}")

    def disconnect(self):
        # Cierra la conexión a la base de datos
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("Conexión cerrada")

    def execute_query(self, query, params=None):
        # Ejecuta una consulta en la base de datos
        cursor = None
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            self.connection.commit()
            print("Consulta ejecutada correctamente")
        except Error as e:
            print(f"Error al ejecutar la consulta: {e}")
        finally:
            if cursor:
                cursor.close()

    def fetch_data(self, query, params=None):
        # Ejecuta una consulta SELECT y devuelve los resultados
        cursor = None
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            return cursor.fetchall()
        except Error as e:
            print(f"Error al obtener datos: {e}")
            return None
        finally:
            if cursor:
                cursor.close()

    def execute_stored_procedure(self, procedure_name, params=None):
        # Ejecuta un stored procedure
        cursor = None
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.callproc(procedure_name, params)
            else:
                cursor.callproc(procedure_name)

            # Obtener los resultados de los procedimientos almacenados
            results = []
            for result in cursor.stored_results():
                results.append(result.fetchall())
            self.connection.commit()
            print(f"Procedimiento {procedure_name} ejecutado correctamente")
            return results
        except Error as e:
            print(f"Error al ejecutar el procedimiento almacenado: {e}")
            return None
        finally:
            if cursor:
                cursor.close()