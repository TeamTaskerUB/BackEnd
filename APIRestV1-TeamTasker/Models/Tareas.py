from mysql.connector import Error
 
# Clase Tarea (Clase base)
class Tarea:
    def __init__(self):
        self.idTarea = None
        self.nombre = None
        self.descripcion = None
        self.estado = None
        self.fecha_inicio = None 
        self.fecha_fin = None
        self.progreso = None
        self.prioridad = None
        self.etiqueta = None
    

# Clase TareaGrupal (Heredada de Tarea)
class TareaGrupal(Tarea):
    
    def __init__(self):
        super().__init__()
        self.idTareaGlobal = None
        self.idAdminGrupo = None
        self.tareasUnitarias = None

    # Funcion para crear Tareas Grupales
    def crearTareaGrupal(self, nombre, descripcion, idTareaGlobal, idUserLider, fecha_inicio, fecha_fin, integrantes, dbConnection):
        self.idTareaGlobal = idTareaGlobal
        self.nombre = nombre
        
        query = """
        INSERT INTO tareagrupal (nombre, descripcion, idProyecto, admin, dateIn, dateEnd, completada, estado, etiqueta, prioridad)
        VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

        dbConnection.execute_query(query,(nombre, descripcion, idTareaGlobal, idUserLider, fecha_inicio, fecha_fin, 0, "",1,1))
        print("Consulta ejecutada correctamente")

        #Se le asignara a los integrantes esta tarea grupal.
        query = "get_id_grupo_proyecto"
        result = dbConnection.execute_stored_procedure(query, (idTareaGlobal, nombre))
        if not result:
            return "Error: Grupo no encontrado"
        self.idTarea = result[0][0]
        for integrante in integrantes:
            result = dbConnection.fetch_data("SELECT set_grupo_proyecto_usuario(%s, %s)", (self.idTarea, integrante))
            if result == None:
                return "Error: No se pudo agregar la tarea grupal al integrante"
        return "OK"
    
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
    
    def asignarTareaGrupal(self, dbConnection):
        data_tareagrupal = dbConnection.execute_stored_procedure("get_id_grupo_proyecto", (self.idTareaGlobal, self.nombre))
        self.idTarea = data_tareagrupal[0][0]
        self.descripcion = data_tareagrupal[0][2]
        self.estado = data_tareagrupal[0][10]
        self.fecha_inicio = data_tareagrupal[0][6]
        self.fecha_fin = data_tareagrupal[0][7]
        self.progreso = data_tareagrupal[0][8]
        self.etiqueta = data_tareagrupal[0][10]
        self.idAdminGrupo = data_tareagrupal[0][4]