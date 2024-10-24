import sqlite3
import json

class SQLiteConnector:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(SQLiteConnector, cls).__new__(cls)
        return cls._instance

    def __init__(self, config_file="config.json"):
        if not hasattr(self, 'initialized'):
            self.load_config(config_file)
            self.connection = None
            self.initialized = True

    def load_config(self, config_file):
        try:
            with open(config_file, 'r') as file:
                config = json.load(file)
                self.database = config["database"]
        except Exception as ex:
            print(f"Error al cargar el archivo de configuración: {ex}")

    def connect(self):
        try:
            self.connection = sqlite3.connect(self.database)
            print(f"Conexión a la base de datos {self.database} establecida")
        except sqlite3.Error as e:
            print(f"Error al conectar a la base de datos: {e}")

    def disconnect(self):
        if self.connection:
            self.connection.close()
            print("Conexión cerrada")

    def execute_query(self, query, params=None):
        cursor = None
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            self.connection.commit()
            print("Consulta ejecutada correctamente")
        except sqlite3.Error as e:
            print(f"Error al ejecutar la consulta: {e}")
        finally:
            if cursor:
                cursor.close()

    def fetch_data(self, query, params=None):
        cursor = None
        try:
            cursor = self.connection.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            return cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Error al obtener datos: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
