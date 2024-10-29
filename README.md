

# Team Tasker API Documentation

## Overview

This API provides endpoints for managing users, tasks, group tasks, and global tasks within a project management system. The API also includes authentication mechanisms for login and registration using JWT tokens.

## Users

### Get User by ID
**Endpoint**: `GET /user/:id`

**Description**: Retrieve all details of a specific user by their ID. This route is protected and requires authentication via JWT.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Response**:
- Status: `200 OK`
- Body: 
```json
{
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "PManager",
  "bio": "Software engineer",
  "profilePhoto": "https://example.com/photo.jpg",
  "followers": [],
  "following": [],
  "posts": [],
  "createdAt": "2024-10-24T12:00:00Z",
  "isVerified": true
}


## Authentication

### Register User
**Endpoint**: `POST /auth/register`

**Description**: Register a new user with the system.

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "password123",
  "role": "PManager"
}
```

**Response**:
- Status: `201 Created`
- Body: Newly created user information.

### Login User
**Endpoint**: `POST /auth/login`

**Description**: Authenticate an existing user and receive a JWT token.

**Request Body**:
```json
{
  "email": "johndoe@example.com",
  "password": "password123"
}
```

**Response**:
- Status: `200 OK`
- Body: 
```json
{
  "access_token": "jwt_token_here"
}
```

## Global Tasks

### Create Global Task
**Endpoint**: `POST /global-tasks/create`

**Description**: Create a new global task. Only accessible to authenticated users with the role of `PManager`.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Request Body**:
```json
{
  "name": "Desarrollo del teamtasker",
  "description": "Development of the team tasker system",
  "startDate": "2024-11-01",
  "endDate": "2024-11-30",
  "priority": "high"
}
```

**Response**:
- Status: `201 Created`
- Body: Newly created global task information.

### Get Global Task Preview
**Endpoint**: `GET /global-tasks/:id`

**Description**: Retrieve the global task, along with its associated groupal tasks and their tasks.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Response**:
- Status: `200 OK`
- Body: 
```json
{
  "_id": "global_task_id",
  "name": "Global Task Name",
  "groupalTasks": [
    {
      "_id": "groupal_task_id",
      "name": "Groupal Task Name",
      "tasks": [
        {
          "_id": "task_id",
          "name": "Task Name"
        }
      ]
    }
  ]
}
```

### Delete Global Task
**Endpoint**: `DELETE /global-tasks/:id`

**Description**: Delete a global task and its associated groupal tasks and tasks. Only accessible by the user who created it or a `PManager`.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Response**:
- Status: `200 OK`
- Body: Success message.

## Groupal Tasks

### Create Groupal Task
**Endpoint**: `POST /groupal-tasks/create/:globalTaskId`

**Description**: Create a new groupal task associated with a global task.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Request Body**:
```json
{
  "name": "Groupal Task Name",
  "description": "Groupal Task Description",
  "startDate": "2024-11-02",
  "endDate": "2024-11-30",
  "priority": "medium"
}
```

**Response**:
- Status: `201 Created`
- Body: Newly created groupal task information.

### Get Groupal Task Preview
**Endpoint**: `GET /groupal-tasks/:id`

**Description**: Retrieve a groupal task and its associated tasks.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Response**:
- Status: `200 OK`
- Body: 
```json
{
  "_id": "groupal_task_id",
  "name": "Groupal Task Name",
  "tasks": [
    {
      "_id": "task_id",
      "name": "Task Name"
    }
  ]
}
```

### Assign Admin to Groupal Task
**Endpoint**: `POST /groupal-tasks/assign-admin/:id`

**Description**: Assign an admin to a groupal task. Only accessible by users with the role of `PManager`.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Request Body**:
```json
{
  "newAdminId": "user_id_of_new_admin"
}
```

**Response**:
- Status: `200 OK`
- Body: Updated groupal task information.

### Remove Admin from Groupal Task
**Endpoint**: `POST /groupal-tasks/remove-admin/:id`

**Description**: Remove the admin from a groupal task and revert their role to `User`.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Response**:
- Status: `200 OK`
- Body: Success message.

### Delete Groupal Task
**Endpoint**: `DELETE /groupal-tasks/:id`

**Description**: Delete a groupal task and its associated tasks.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Response**:
- Status: `200 OK`
- Body: Success message.

## Tasks

### Create Task
**Endpoint**: `POST /tasks/create`

**Description**: Create a new task.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Request Body**:
```json
{
  "name": "Task Name",
  "description": "Task Description",
  "startDate": "2024-11-01",
  "endDate": "2024-11-15",
  "priority": "low",
  "groupalTaskId": "groupal_task_id",
  "globalTaskId": "global_task_id"
}
```

**Response**:
- Status: `201 Created`
- Body: Newly created task information.

### Get Task by ID
**Endpoint**: `GET /tasks/:id`

**Description**: Retrieve a task by its ID.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Response**:
- Status: `200 OK`
- Body: Task information.

### Assign Assignees to Task
**Endpoint**: `POST /tasks/assign/:id`

**Description**: Assign users to a task. Only accessible by users with the role of `PManager` or `GManager`.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Request Body**:
```json
{
  "assignees": ["user_id_1", "user_id_2"]
}
```

**Response**:
- Status: `200 OK`
- Body: Updated task information.

### Delete Task
**Endpoint**: `DELETE /tasks/:id`

**Description**: Delete a task. Only accessible by `PManager`.

**Headers**: 
- `Authorization: Bearer {jwt_token}`

**Response**:
- Status: `200 OK`
- Body: Success message.

## Requirements

- Node.js
- NestJS
- MongoDB (Mongoose)
- JWT for authentication

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongo_db_connection_string
   ```

4. Start the application:
   ```bash
   npm run start
   ```

