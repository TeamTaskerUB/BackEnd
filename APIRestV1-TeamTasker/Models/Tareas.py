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
        
        query = """INSERT INTO tareagrupal (nombre, descripcion, idProyecto, admin, dateIn, dateEnd, completada, estado, etiqueta, prioridad)
        VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""

        dbConnection.execute_query(query,(nombre, descripcion, idTareaGlobal, idUserLider, self.fecha_inicio, self.fecha_fin, 0, "",1,1))
        print("Consulta ejecutada correctamente")

        #Se le asignara a los integrantes esta tarea grupal.
        query = "get_id_grupo_proyecto"
        result = dbConnection.execute_stored_procedure(query, (idTareaGlobal, nombre))
        if result == None:
            return "Error: Grupo no encontrado"
        try:
            self.idTarea = result[0][0]
        except Exception as e:
            return f"Error: {e}"
        for integrante in integrantes:
            result = dbConnection.fetch_data("SELECT set_grupo_proyecto_usuario(%s, %s)", (self.idTarea, integrante))
            try:
                if result[0][0] == 1:
                    return "OK"
            except:
                return "Error: Al agregar"
        return "OK"
    
    def getTareasUnitarias(self, dbConnection: MySQLConnector):
        #Consigue todas las tareas unitarias de un grupo.
        query = """
        SELECT idTareaUnitaria
        FROM tareaunitaria tu
        JOIN tareagrupal tg ON tu.grupo = tg.idGrupo
        WHERE tg.idGrupo = %s """
        tareasUnitarias = dbConnection.fetch_data(query,(self.idTarea,))
        return tareasUnitarias
    
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
    
    # Función para calcular el progreso real vs el progreso esperado
    def calcularProgreso(self, dbConnection: MySQLConnector):
        #Obtener todas las tareas unitarias asociadas
        tareasUnitarias = self.getTareasUnitarias(dbConnection)
        if not tareasUnitarias:
            return jsonify({'message': 'No hay tareas unitarias asociadas a esta tarea grupal'}), 404
        
        #Sumar los progresos de todas las tareas unitarias
        progreso_total = sum([tarea['progreso'] for tarea in tareasUnitarias])
        
        #Dividir el progreso total entre el número de tareas unitarias para obtener el progreso promedio
        total_tareas = len(tareasUnitarias)
        progreso_promedio = progreso_total / total_tareas if total_tareas > 0 else 0
        
        # Calcular los días de duración de la tarea grupal
        duracion_total_dias = (self.fecha_fin - self.fecha_inicio).days
        if duracion_total_dias <= 0:
            return jsonify({'message': 'Duración inválida para la tarea grupal'}), 400

        # Calcular los días transcurridos desde la fecha de inicio hasta hoy
        dias_transcurridos = (datetime.now() - self.fecha_inicio).days

        # Si la fecha actual supera la fecha de finalización, se espera un progreso del 100%
        if datetime.now() > self.fecha_fin:
            progreso_esperado = 100
        else:
            # Calcular el progreso esperado en función de los días transcurridos
            # Asegurarse de no exceder la duración total
            dias_transcurridos = min(dias_transcurridos, duracion_total_dias)
        
            progreso_diario_esperado = 100 / duracion_total_dias
            progreso_esperado = progreso_diario_esperado * dias_transcurridos
        
        # 5. Comparar el progreso actual con el esperado
        if progreso_promedio >= progreso_esperado:
            estado = "Verde"
        elif progreso_promedio >= (progreso_esperado * 0.75):
            estado = "Amarillo"
        else:
            estado = "Rojo"
        
        # Retornar el estado del progreso actual comparado con el esperado
        return jsonify({
            'progreso_promedio': progreso_promedio,
            'estado': estado
        }), 200
