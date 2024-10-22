from Models.MySQLConnector import MySQLConnector

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
    def crearTareaGrupal(self, nombre, descripcion, idTareaGlobal, idUserLider, fecha_inicio, fecha_fin, integrantes, dbConnection: MySQLConnector):
        self.idTareaGlobal = idTareaGlobal
        self.nombre = nombre
        
        query = """INSERT INTO tareagrupal (nombre, descripcion, idProyecto, admin, dateIn, dateEnd, completada, estado, etiqueta, prioridad)
        VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

        dbConnection.execute_query(query,(nombre, descripcion, idTareaGlobal, idUserLider, fecha_inicio, fecha_fin, 0, "",1,1))
        print("Consulta ejecutada correctamente")

        #Se le asignara a los integrantes esta tarea grupal.
        """query = "get_id_grupo_proyecto"
        result = dbConnection.execute_stored_procedure(query, (idTareaGlobal, nombre))
        if result == None:
            return "Error: Grupo no encontrado"
        try:
            self.idTarea = result[0][0]
        except Exception as e:
            return f"Error: {e}" """
        self.idTarea = 42
        for integrante in integrantes:
            result = dbConnection.fetch_data("SELECT set_grupo_proyecto_usuario(%s, %s)", (self.idTarea, integrante))
            try:
                if result[0][0] == 1:
                    return "OK"
            except:
                return "Error: Al agregar"
        return "OK"
    
    def modificarTareaGrupal(self, idTarea, nombre=None, descripcion=None, fecha_inicio=None, fecha_fin=None, prioridad=None, estado=None, etiqueta=None, dbConnection: MySQLConnector):
        # Verificar si la tarea grupal existe
        tarea_existente = dbConnection.fetch_data("SELECT * FROM tareagrupal WHERE idTareaGlobal = %s", (idTarea,))
        
        if not tarea_existente:
            return "Error: La tarea grupal no existe"
        
        # Construir la consulta de actualización
        query = "UPDATE tareagrupal SET"
        params = []
        
        # Solo agregar al query los campos que no sean None
        if nombre:
            query += " nombre = %s,"
            params.append(nombre)
        if descripcion:
            query += " descripcion = %s,"
            params.append(descripcion)
        if fecha_inicio:
            query += " dateIn = %s,"
            params.append(fecha_inicio)
        if fecha_fin:
            query += " dateEnd = %s,"
            params.append(fecha_fin)
        if prioridad is not None:
            query += " prioridad = %s,"
            params.append(prioridad)
        if estado is not None:
            query += " estado = %s,"
            params.append(estado)
        if etiqueta:
            query += " etiqueta = %s,"
            params.append(etiqueta)
        
        # Eliminar la última coma
        query = query.rstrip(",")
        query += " WHERE idTareaGlobal = %s"
        params.append(idTarea)
        
        # Ejecutar la consulta
        try:
            dbConnection.execute_query(query, tuple(params))
            return "OK"
        except Exception as e:
            return f"Error: Al modificar la tarea grupal: {e}"
    
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