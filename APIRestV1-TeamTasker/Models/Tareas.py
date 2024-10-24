from datetime import datetime
from flask import jsonify
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
        
    #Funcion para verificar que las fechas esten en el formato necesario.
    def verificarFechas(self, fechaInicio, fechaFin):
        #Primero se dividen los strings en listas a base del separador
        fechaInicio = fechaInicio.split("/")
        fechaFin = fechaFin.split("/")
        if not (len(fechaInicio) == 3 and len(fechaFin) == 3):
            return jsonify({'message': 'Error en la sintaxis'}), 400
        #Se convierte cada string en un numero
        for fecha in fechaInicio:
            try:
                fecha = int(fecha)
            except Exception as e:
                return jsonify({'message': f"Parametro invalido para la fecha de Inicio: {e}"}), 400
        for fecha in fechaFin:
            try:
                fecha = int(fecha)
            except Exception as e:
                return jsonify({'message': f"Parametro invalido para la fecha de Fin: {e}"}), 400
        try:
            #Para finalizar se pasan al formato indicado.
            self.fecha_inicio = datetime(int(fechaInicio[0]), int(fechaInicio[1]), int(fechaInicio[2]))
            self.fecha_fin = datetime(int(fechaFin[0]), int(fechaFin[1]), int(fechaFin[2]))
        except Exception as e:
            return jsonify({'message': 'Problema con la sintaxis'}), 400
        return jsonify({'message': 'OK'}), 200

# Clase TareaGrupal (Heredada de Tarea)
class TareaGrupal(Tarea):
    
    def __init__(self):
        super().__init__()
        self.idTareaGlobal = None
        self.idAdminGrupo = None
        self.tareasUnitarias = None

    # Funcion para crear Tareas Grupales
    def crearTareaGrupal(self, nombre, descripcion, idTareaGlobal, idUserLider, integrantes, dbConnection: MySQLConnector):
        self.idTareaGlobal = idTareaGlobal
        self.nombre = nombre
        
        #Se insertan todos los datos en la base de datos
        query = """INSERT INTO tareagrupal (nombre, descripcion, idProyecto, admin, dateIn, dateEnd, completada, estado, etiqueta, prioridad)
        VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        dbConnection.execute_query(query,(nombre, descripcion, idTareaGlobal, idUserLider, self.fecha_inicio, self.fecha_fin, 0, "Verde",1,1))
        print("Consulta ejecutada correctamente")

        #Se le asignara a los integrantes esta tarea grupal.
        query = "get_id_grupo_proyecto"
        result = dbConnection.execute_stored_procedure(query, (idTareaGlobal, nombre))
        
        #Para confirmar que se lograra obtener el id de la tareas se realiza esta verificacion
        if result == None:
            return jsonify({"message" : "Error: Grupo no encontrado"})
        try:
            self.idTarea = result[0][0]
        except Exception as e:
            return jsonify({"message" : f"Error: {e}"})
        
        for integrante in integrantes:
            result = dbConnection.fetch_data("SELECT set_grupo_proyecto_usuario(%s, %s)", (self.idTarea, integrante))
            try:
                if result[0][0] == 1:
                    return "OK"
            except:
                return jsonify({"message" : "Error: Al agregar"})
        return "OK"
    
    #Funcion para encontrar todas las tareas unitarias asociadas a una tarea grupal.
    def getTareasUnitarias(self, dbConnection: MySQLConnector):
        #Consigue todas las tareas unitarias de un grupo.
        query = """
        SELECT *
        FROM tareaunitaria tu
        JOIN tareagrupal tg ON tu.grupo = tg.idGrupo
        WHERE tg.idGrupo = %s """
        tareasUnitarias = dbConnection.fetch_data(query,(self.idTarea,))
        return tareasUnitarias
    
    #Funcion para conseguir todos los atributos de una tarea grupal usando su nombre y el id de la tarea global
    def asignarTareaGrupal(self, dbConnection: MySQLConnector):
        data_tareagrupal = dbConnection.execute_stored_procedure("get_id_grupo_proyecto", (self.idTareaGlobal, self.nombre))
        self.idTarea = data_tareagrupal[0][0]
        self.descripcion = data_tareagrupal[0][2]
        self.estado = data_tareagrupal[0][10]
        self.fecha_inicio = data_tareagrupal[0][6]
        self.fecha_fin = data_tareagrupal[0][7]
        self.progreso = data_tareagrupal[0][8]
        self.etiqueta = data_tareagrupal[0][10]
        self.idAdminGrupo = data_tareagrupal[0][4]
    
    #Función para calcular el progreso real vs el progreso esperado
    def calcularProgreso(self, dbConnection: MySQLConnector):
        #Obtener todas las tareas unitarias asociadas
        tareasUnitarias = dbConnection.execute_stored_procedure("get_grupo_tareas_proyecto", (self.idTarea,))
        if not tareasUnitarias:
            return jsonify({'message': 'No hay tareas unitarias asociadas a esta tarea grupal'}), 404
        try:
            #Calcular el promedio del progreso de las tareas unitarias
            progreso_total = sum([tarea[6] for tarea in tareasUnitarias])
            total_tareas = len(tareasUnitarias)
            self.progreso = progreso_total / total_tareas if total_tareas > 0 else 0
            
            # Calcular los días de duración de la tarea grupal
            duracion_total_dias = (self.fecha_fin - self.fecha_inicio).days
            if duracion_total_dias <= 0:
                return jsonify({'message': 'Duración inválida para la tarea grupal'}), 400

            # Si la fecha actual supera la fecha de finalización, se espera un progreso del 100%
            if datetime.now() > self.fecha_fin:
                progreso_esperado = 100
            else:
                # Calcular los días transcurridos desde la fecha de inicio hasta hoy
                dias_transcurridos = (datetime.now() - self.fecha_inicio).days
                
                # Calcular el progreso esperado en función de los días transcurridos
                dias_transcurridos = min(dias_transcurridos, duracion_total_dias)
                progreso_diario_esperado = 100 / duracion_total_dias
                progreso_esperado = progreso_diario_esperado * dias_transcurridos
            
            #Comparar el progreso actual con el esperado
            if self.progreso >= progreso_esperado:
                self.estado = "Verde"
            elif self.progreso >= (progreso_esperado * 0.75):
                self.estado = "Amarillo"
            else:
                self.estado = "Rojo"
        except:
            return jsonify({"message" : "Error al calcular el progreso."})
        
        # Retornar el estado del progreso actual comparado con el esperado
        return jsonify({
            'progreso': self.progreso,
            'estado': self.estado
        }), 200
