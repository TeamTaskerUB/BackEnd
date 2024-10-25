# API REST en Python

Este proyecto consiste en el desarrollo de una API REST utilizando Python. La API está diseñada para manejar operaciones relacionadas con [describe brevemente el propósito general de la API, como gestión de tareas, usuarios, productos, etc.].

## Tecnologías utilizadas

- **Python 3.x**: Lenguaje de programación utilizado para desarrollar la API.
- **Flask**: Framework web utilizado para crear la API.

## Endpoints

A continuación se describen los endpoints disponibles en la API (por ahora):

### Autenticación

- **POST /auth/login**: 
    - **Descripción**: Autentica a un usuario y devuelve un token de acceso.
    - **Parámetros**: `username`, `password`
    - **Respuesta**: `200 OK` con el token de acceso.

- **POST /auth/register**: 
    - **Descripción**: Registra a un nuevo usuario.
    - **Parámetros**: `username`, `password`, `email`
    - **Respuesta**: `201 Created` con los detalles del nuevo usuario.

### Gestión de Usuarios
### Gestión de Grupos
- **POST /grouptask/create**:
    - **Descripción**: Crea una tarea grupal.
    - **Parámetros**: `idTareaGlobal`, `idUsuario`, `idAdminGrupo`, `fechaInicio`, `fechaFin`, `titulo`, `descripcion`, `integrantes`
    - **Respuesta**: `200 Created` con los detalles del nuevo grupo.
- **DELETE /grouptask/delete**:
      - **Descripción**: Elimina una tarea grupal.
      - **Parámetros**: `idUsuario`, `idTareaGrupal`, `accion`
      - **Respuesta**: `200 OK`.
### Gestión de tareas
