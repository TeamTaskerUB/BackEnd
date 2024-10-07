from mysql.connector import Error
 
# Clase Tarea (Clase base)
class Tarea:
    def __init__(self):
        self.idTarea = None
        self.titulo = None
        self.descripcion = None
        self.estado = None
        self.fecha_inicio =None 
        self.fecha_fin = None
        self.progreso = None
        self.prioridad = None
        self.hito = None
        self.etiqueta = None
    

# Clase TareaGrupal (Heredada de Tarea)
class TareaGrupal(Tarea):
    
    def __init__(self):
        super().__init__()
        self.idAdminGrupo = None
        self.tareasUnitarias = None
    
    def crearTareaGrupal(self, titulo, descripcion, idTareaGlobal, idUserLider, fecha_inicio, fecha_fin, integrantes, dbConnection):
        # Funcion para crear Tareas Grupales
        query = """
        INSERT INTO tareagrupal (nombre, descripcion, idProyecto, admin, dateIn, dateEnd, completada, estado, etiqueta, prioridad)
        VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        cursor = None
        try:
            cursor = dbConnection.connection.cursor()
            cursor.execute(query,(titulo, descripcion, idTareaGlobal, idUserLider, fecha_inicio, fecha_fin, 0, "",-1,-1))
            self.idTarea = cursor.lastrowid
            dbConnection.connection.commit()
            print("Consulta ejecutada correctamente")

            #Si se ejecuta correctamente ahora toca crear una tarea unitaria que vincule
            #A los integrantes con esta tarea grupal.
            query = """
            INSERT INTO tareaunitaria (usuario, grupo, nombre, etiqueta, prioridad)
            VALUES (%s, %s, %s, %s, %s)
            """

            #Se vinculara a los integrantes de la tarea grupal que no sean admin de grupo con una
            #Tarea unitaria la cual no debera ser vista por el usuario, servira unicamente como nexo.
            for integrante in integrantes:
                cursor.execute(query,(integrante, self.idTarea, "#ignore", -1, -1))
            print("Integrantes agregados")
            
        except Error as e:
            print(f"Error al ejecutar la consulta: {e}")
        finally:
            if cursor:
                cursor.close()

    def getTareasUnitarias(self, dbConnection):
        #Consigue todas las tareas unitarias de un grupo.
        query = """
        SELECT idTareaUnitaria
        FROM tareaunitaria tu
        JOIN tareagrupal tg ON tu.grupo = tg.idGrupo
        WHERE tg.idGrupo = %s """
        tareasUnitarias = dbConnection.fetch_data(query,(self.idTarea,))
        for tarea in tareasUnitarias:
            print(f"Tarea ID: {tarea}")

