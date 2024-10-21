from datetime import datetime
from flask import Flask, request, jsonify
from Models.MySQLConnector import MySQLConnector
from Models.Usuarios import *
from Models.Tareas import *


app = Flask(__name__)

# Endpoint para que el Administrador de Proyecto cree una tarea grupal, usando el id del proyecto en la ruta
@app.route('/<int:idTareaGlobal>/crear_tarea_grupal', methods=['POST'])
def crearTareaGrupal(idTareaGlobal):
    #Primero chequear que la solicitud sea un post
    if request.method == 'POST':
        data = request.json
        idUsuario = data['idUsuario']
        idAdminGrupo = data['idAdminGrupo']
        fechaInicio = data['fechaInicio']
        fechaFin = data['fechaFin']
        nombre = data['nombre']
        descripcion = data['descripcion']
        # Verificacion general con los datos mas importantes no esten vacios.
        if not idUsuario or not idAdminGrupo or not (fechaFin and fechaInicio) or not nombre:
            return jsonify({'message': 'Faltan campos obligatorios'}), 400
        if not descripcion:
            descripcion = ""

        #Verificar que el adminProyecto es el que usa este metodo.
        check = verificarAdminProyecto(db, idUsuario, idTareaGlobal)
        if not check == "OK":
            return check, 401
        
        #Verificar que no exista una tareaGrupal con el mismo nombre en el mismo proyecto.
        check = existeTareaGrupal(db, idTareaGlobal, nombre)
        if not  check == "OK":
            return check, 401
        
        #Tambien se realizaran verificaciones de que los integrantes y el admin del nuevo grupo pertenezcan al proyecto.
        integrantes = data['integrantes']
        if not integrantes:
            integrantes = []
        
        check = verificarIntegrantes(db, integrantes, idTareaGlobal, idAdminGrupo, idUsuario)    
        if not check == "OK":
            return check, 401
        
        # Instanciar la tarea grupal y pasarle los parametros que se enviaron y comprobaron.
        tareaGrupal = TareaGrupal()
        #Verificar formato de que el formato de las fechas sea valido. Y pasar el string a un int
        check = tareaGrupal.verificarFechas(fechaInicio, fechaFin)
        if not check == "OK":
            return check
        
        result = tareaGrupal.crearTareaGrupal(nombre, descripcion, idTareaGlobal, idAdminGrupo, integrantes, db) 
        if (result == "OK"):
            return jsonify({'message': "OK"}), 200
        else:
            return jsonify({"message": "Error al crear tarea grupal"}), 500
        
    return jsonify({'message': 'Metodo no valido'}), 405

# Endpoint para que el Administrador de Proyecto elimine una tarea grupal
@app.route('/<int:idTareaGrupal>/eliminar_tarea_grupal', methods=['DELETE'])
def eliminarTareaGrupal(idTareaGrupal):
    if request.method == 'DELETE':
        data = request.json
        idUsuario = data['idUsuario']
        accion = data.get('accion', 'continuar')  # Opción seleccionada por el usuario ('continuar' o 'asignar')

        # Obtener el idTareaGlobal asociado a la tarea grupal
        query = """SELECT idProyecto FROM tareagrupal WHERE idGrupo = %s"""
        tareaGlobalResult = db.fetch_data(query, (idTareaGrupal,))

        if not tareaGlobalResult or len(tareaGlobalResult) == 0:
            return jsonify({'message': 'Tarea grupal no encontrada'}), 404

        idTareaGlobal = tareaGlobalResult[0][0]

        # Verificar que el idUsuario sea el admin del proyecto que puede eliminar la tarea
        check = verificarAdminProyecto(db, idUsuario, idTareaGlobal)
        if not check == "OK":
            return check, 401

        # Obtener la tarea grupal y sus tareas unitarias
        tareaGrupal = TareaGrupal()
        tareaGrupal.idTarea = idTareaGrupal  # Asignar el id de la tarea grupal que se desea eliminar
        tareasUnitarias = tareaGrupal.getTareasUnitarias(db)

        # Verificar si hay tareas unitarias asociadas a la tarea grupal
        if tareasUnitarias:
            # Verificar si las tareas unitarias han comenzado (suponiendo que el progreso indica si han comenzado)
            tareasEmpezadas = [tarea for tarea in tareasUnitarias if tarea['etiqueta'] == "Inactiva"]

            if tareasEmpezadas:
                if accion == 'asignar':
                    # Lógica para asignar las tareas unitarias a otros grupos
                    nuevosGrupos = data.get('nuevosGrupos', [])
                    if not nuevosGrupos or len(nuevosGrupos) != len(tareasUnitarias):
                        return jsonify({'message': 'No se han asignado todas las tareas a nuevos grupos'}), 400

                    # Asignar las tareas a los nuevos grupos
                    for tarea, nuevoGrupo in zip(tareasUnitarias, nuevosGrupos):
                        query = "UPDATE tareaunitaria SET grupo = %s WHERE idTareaUnitaria = %s"
                        db.execute_query(query, (nuevoGrupo, tarea['idTareaUnitaria']))

                elif accion == 'continuar':
                    # El usuario decide continuar sin asignar las tareas, se elimina la tarea grupal
                    pass
                else:
                    # En caso de que no se seleccione ninguna acción válida
                    return jsonify({'message': 'Acción no válida'}), 400

        # Proceder con la eliminación de la tarea grupal
        query = """DELETE FROM tareagrupal WHERE idGrupo = %s"""
        result = db.execute_query(query, (idTareaGrupal,))

        if result == "OK":
            return jsonify({'message': 'Tarea grupal eliminada correctamente'}), 200
        else:
            return jsonify({'message': 'Error al eliminar la tarea grupal'}), 500

    return jsonify({'message': 'Método no válido'}), 405


#Funcion para verificar que el id pertenece al del admin del proyecto
def verificarAdminProyecto(db: MySQLConnector, id: int, idTareaGlobal: int):
    query = """SELECT admin_id FROM tareaglobal WHERE idProyecto = %s"""
    result = db.fetch_data(query, (idTareaGlobal,))
    if not (result[0][0] == id):
        return jsonify({'message': "No es el admin del proyecto"})
    else:
        return "OK"
    
#Funcion para verificar que todos los integrantes pertenezcan al proyecto.
def verificarIntegrantes(db: MySQLConnector, integrantes, idTareaGlobal: int, idAdminGrupo, idAdminProyecto):
    result = db.execute_stored_procedure("get_usuarios_proyecto", (idTareaGlobal,))
    if not result == None:
        for usuario in result:
            if len(usuario) >= 1 and len(usuario[0]) >= 1:
                if not (usuario[0][0] in integrantes or usuario[0][0] == idAdminGrupo or usuario[0][0] == idAdminProyecto):
                    return jsonify({'message': f"El integrante {usuario[0]} no pertenece al proyecto"})
    return "OK"

#Verificar que exista una tarea grupal con el mismo nombre
def existeTareaGrupal(db: MySQLConnector, idTareaGlobal: int, nombre):
    query = """SELECT nombre FROM tareagrupal WHERE idProyecto = %s"""
    result = db.fetch_data(query, (idTareaGlobal,))
    try:
        for resultado in result:
            if resultado[0] == nombre:
                return "Error: Ya existe una tarea grupal con ese nombre."
    except:
        return "OK"
    return "OK"
db = MySQLConnector('APIRestV1-TeamTasker/config.json')
db.connect()
if __name__ == '__main__':
    app.run(port=3000,debug=True)
    
db.disconnect()