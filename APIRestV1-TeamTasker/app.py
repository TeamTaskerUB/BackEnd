from datetime import datetime
from flask import Flask, request, jsonify
from Models.MySQLConnector import MySQLConnector
from Models.Usuarios import *
from Models.Tareas import *


app = Flask(__name__)

#Endpoint para que el Administrador de Proyecto cree una tarea grupal, usando el id del proyecto en la ruta
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
        if not check == "OK":
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

#Endpoint para que el Administrador de Proyecto elimine una tarea grupal
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
        
        try:
            # Verificar si hay tareas unitarias asociadas a la tarea grupal
            if tareasUnitarias:
                # Verificar si las tareas unitarias han comenzado (esto se sabra por la etiqueta)
                tareasEmpezadas = [tarea for tarea in tareasUnitarias if not tarea[9] == "Inactiva"]

                if tareasEmpezadas:
                    if accion == 'asignar':
                        # Obtener los nuevos grupos desde el JSON
                        nuevosGrupos = data.get('nuevosGrupos', [])

                        # Validar que se han proporcionado suficientes grupos para todas las tareas unitarias
                        if not nuevosGrupos or len(nuevosGrupos) != len(tareasUnitarias):
                            return jsonify({'message': 'No se han asignado todas las tareas a nuevos grupos'}), 400

                        # Verificar que todos los nuevos grupos existen en la base de datos
                        query = "SELECT idGrupo FROM tareagrupal WHERE idGrupo IN (%s)" % ','.join(['%s'] * len(nuevosGrupos))
                        grupos_existentes = db.fetch_data(query, tuple(nuevosGrupos))

                        if len(grupos_existentes) != len(nuevosGrupos):
                            return jsonify({'message': 'Algunos de los grupos proporcionados no existen'}), 400

                        # Asignar cada tarea unitaria a un nuevo grupo existente
                        for tarea, nuevoGrupo in zip(tareasUnitarias, nuevosGrupos):
                            query = "UPDATE tareaunitaria SET grupo = %s WHERE idTareaUnitaria = %s"
                            db.execute_query(query, (nuevoGrupo, tarea[0]))

                    elif accion == 'continuar':
                        # El usuario decide continuar sin asignar las tareas, se elimina la tarea grupal
                        query = "DELETE FROM tareaunitaria WHERE grupo = %s"
                        db.execute_query(query, (idTareaGrupal,))
                    else:
                        # En caso de que no se seleccione ninguna acción válida
                        return jsonify({'message': 'Acción no válida'}), 400
                else:
                    query = "DELETE FROM tareaunitaria WHERE grupo = %s"
                    db.execute_query(query, (idTareaGrupal,))
        except:
            pass

        # Proceder con la eliminación de la tarea grupal
        query = """DELETE FROM tareagrupal WHERE idGrupo = %s"""
        db.execute_query(query, (idTareaGrupal,))
        query = """SELECT idGrupo FROM tareagrupal WHERE idGrupo = %s"""
        result = db.fetch_data(query, (idTareaGrupal,))
        if not result:
            return jsonify({"message" : "Tarea Grupal eliminada satisfactoriamente"})
        return jsonify({'message': 'Error al eliminar la tarea grupal'}), 500

    return jsonify({'message': 'Método no válido'}), 405

#Endpoint que le dara toda la informacion de las tareas unitarias asociadas
@app.route('/<int:idTareaGrupal>/get_tareas_unitarias', methods=['GET'])
def getTareasUnitarias(idTareaGrupal):
    if request.method == 'GET':
        tareaGrupal = TareaGrupal()
        tareaGrupal.idTarea = idTareaGrupal
        tareasUnitarias = tareaGrupal.getTareasUnitarias(db)
        if tareasUnitarias:
            return jsonify({"message" : tareasUnitarias}), 200
        else:
            return jsonify({"message" : "Este grupo no tiene tareas grupales"}), 200
    return jsonify({'message': 'Método no válido'}), 405

#Endpoint que conseguira todas las tareas grupales asociadas a la tareaGlobal
@app.route('/<int:idTareaGlobal>/get_tareas_grupales', methods=['GET'])
def getTareasGrupales(idTareaGlobal):
    if request.method == 'GET':
        query = "SELECT * FROM tareagrupal WHERE idProyecto = %s"
        result = db.fetch_data(query, (idTareaGlobal, ))
        if result:
            return jsonify({"message" : result}), 200
    return jsonify({'message': 'Método no válido'}), 405

#Funcion para verificar que el id pertenece al del admin del proyecto
def verificarAdminProyecto(id: int, idTareaGlobal: int):
    query = """SELECT admin_id FROM tareaglobal WHERE idProyecto = %s"""
    result = db.fetch_data(query, (idTareaGlobal,))
    try:
        if not (result[0][0] == id):
            return jsonify({'message': "No es el admin del proyecto"})
        else:
            return "OK"
    except:
        return jsonify({'message': "No es el admin del proyecto"})

#Funcion para verificar que todos los integrantes pertenezcan al proyecto.
def verificarIntegrantes(integrantes, idTareaGlobal: int, idAdminGrupo, idAdminProyecto):
    result = db.execute_stored_procedure("get_usuarios_proyecto", (idTareaGlobal,))
    if not result == None:
        for usuario in result:
            if len(usuario) >= 1 and len(usuario[0]) >= 1:
                if not (usuario[0][0] in integrantes or usuario[0][0] == idAdminGrupo or usuario[0][0] == idAdminProyecto):
                    return jsonify({'message': f"El integrante {usuario[0]} no pertenece al proyecto"})
    return "OK"

#Verificar que exista una tarea grupal con el mismo nombre
def existeTareaGrupal(idTareaGlobal: int, nombre):
    query = """SELECT nombre FROM tareagrupal WHERE idProyecto = %s"""
    result = db.fetch_data(query, (idTareaGlobal,))
    try:
        for resultado in result:
            if resultado[0] == nombre:
                return jsonify({"message" : "Error: Ya existe una tarea grupal con ese nombre."})
    except:
        return "OK"
    return "OK"

db = MySQLConnector('APIRestV1-TeamTasker/config.json')
db.connect()
if __name__ == '__main__':
    app.run(port=3000,debug=True)
    
db.disconnect()