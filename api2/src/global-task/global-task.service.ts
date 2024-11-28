import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { GlobalTask } from "./schemas/global-task.schema";
import { GroupalTask } from "../groupal-tasks/schemas/groupal-task.schema";
import { Task } from "../tasks/schemas/task.schema";
import { CreateGlobalTaskDto } from "./dtos/create-global-task.dto";
import { UserService } from "src/user/user.service";
import { User } from "src/user/schemas/user.schema";

@Injectable()
export class GlobalTasksService {
  constructor(
    @InjectModel(GlobalTask.name)
    private readonly globalTaskModel: Model<GlobalTask>,
    @InjectModel(GroupalTask.name)
    private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(User.name) protected readonly userModel: Model<User>,
    private readonly userService: UserService
  ) {}

  async getGroupalTasksByGlobalTaskId(userId: string, globalTaskId: string) {
    // Verificar el rol del usuario
    const userRole = await this.getUserRoleInGlobalTask(globalTaskId, userId);
    if (userRole === "noUser") {
      throw new ForbiddenException(
        "No puedes acceder no siendo parte del proyecto"
      );
    }

    // Buscar la tarea global
    const globalTask = await this.globalTaskModel.findById(globalTaskId).lean();
    if (!globalTask) {
      throw new NotFoundException(
        `Global Task with ID "${globalTaskId}" not found`
      );
    }

    // Buscar las tareas grupales asociadas
    const groupalTasks = await this.groupalTaskModel
      .find({ _id: { $in: globalTask.groupalTasks } })
      .select("_id name description members tasks")
      .lean();

    // Preparar los datos con los detalles adicionales
    const groupalTasksDetails = await Promise.all(
      groupalTasks.map(async (task) => {
        const completedTasks = await this.taskModel.countDocuments({
          _id: { $in: task.tasks },
          status: true,
        });
        const pendingTasks = await this.taskModel.countDocuments({
          _id: { $in: task.tasks },
          status: false,
        });

        return {
          id: task._id,
          name: task.name,
          description: task.description,
          membersCount: task.members.length,
          completedTasks,
          pendingTasks,
        };
      })
    );

    return groupalTasksDetails;
  }

  async getGlobalTaskById(globalTaskId: string): Promise<GlobalTask> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId).exec();
    if (!globalTask) {
      throw new NotFoundException(
        `Global Task with ID "${globalTaskId}" not found`
      );
    }
    return globalTask;
  }

  async getProgress(globalTaskId: string) {
    const globalTask = await this.globalTaskModel.findById(globalTaskId).lean();
    if (!globalTask) {
      throw new NotFoundException(
        `Global Task with ID "${globalTaskId}" not found`
      );
    }

    // Calcular el porcentaje de avance del proyecto
    const totalTasks = globalTask.tasks.length;
    const completedTasks = await this.taskModel.countDocuments({
      _id: { $in: globalTask.tasks },
      status: true,
    });

    

    const totalItems = totalTasks 
    const completedItems = completedTasks 
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return progress;
  }

  async getGlobalTaskPreview(userId: string, globalTaskId: string) {
    let res;
    await this.getUserRoleInGlobalTask(globalTaskId, userId).then(
      async (userRole) => {
        if (userRole === "noUser") {
          throw new ForbiddenException(
            "No puedes acceder no siendo parte del proyecto"
          );
        }

        const globalTask = await this.globalTaskModel
          .findById(globalTaskId)
          .lean();
        if (!globalTask) {
          throw new NotFoundException(
            `Global Task with  "${globalTaskId}" not found`
          );
        }

        const progress = await this.getProgress(globalTaskId);
        // Obtener el administrador del proyecto
        const admin = await this.userModel
          .findById(globalTask.admin)
          .select("name")
          .lean();
        if (!admin) {
          throw new NotFoundException("Admin not found");
        }

        // Obtener los miembros del proyecto (nombre y correo)
        const members = await this.userModel
          .find({ _id: { $in: globalTask.members } })
          .select("name email")
          .lean();

        // Mapear el rol del usuario que hace la solicitud
        const roleMapping = {
          PManager: "ProjectAdmin",
          GManager: "GroupAdmin",
          User: "User",
        };

        const role = await this.getUserRoleInGlobalTask(globalTaskId, userId);

        const tasks = await this.taskModel
          .find({ _id: { $in: globalTask.tasks } })
          .select("name status description endDate")
          .lean();

        res = {
          ...globalTask,
          createdBy: admin.name,
          tasks: {
            count: tasks.length,
            list: tasks, // Lista de tareas con `name` y `status`
          },
          members: {
            count: members.length,
            list: members, // Lista con `name` y `email` de cada miembro
          },
          teams: globalTask.groupalTasks.length,
          progress: progress,
          role: role, // Rol de la persona que hace la solicitud
        };
      }
    );
    return res;
  }

  async createGlobalTask(
    createGlobalTaskDto: CreateGlobalTaskDto,
    userId: string
  ): Promise<GlobalTask> {
    const globalTask = new this.globalTaskModel({
      ...createGlobalTaskDto,
      admin: userId,
      grupalTasks: [],
      tasks: [],
      status: false,
    });

    const createdGlobalTask = await globalTask.save();

    // Agregar el ID de la tarea global al usuario que la creó
    await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { tasks: createdGlobalTask._id } }, // Agregar el ID de la tarea al array tasks del usuario
      { new: true } // Opcional: Devuelve el usuario actualizado
    );

    return createdGlobalTask;
  }

  async deleteGlobalTask(globalTaskId: string, userId: string): Promise<void> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(
        `Global Task with ID "${globalTaskId}" not found`
      );
    }

    // Eliminar todas las tareas grupales e individuales asociadas a la tarea global
    for (const groupalTaskId of globalTask.groupalTasks) {
      const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
      if (groupalTask) {
        for (const taskId of groupalTask.tasks) {
          await this.taskModel.deleteOne({ _id: taskId });
        }
        await this.groupalTaskModel.deleteOne({ _id: groupalTaskId });
      }
    }

    // Eliminar la tarea global
    await this.globalTaskModel.deleteOne({ _id: globalTaskId });

    // Eliminar el ID de la tarea global del array de tareas del usuario
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { tasks: globalTaskId } }, // Elimina el ID de la tarea del array `tasks`
      { new: true }
    );
  }

  async getUserGlobalTasks(userId: string): Promise<any[]> {
    // Obtener el usuario y sus IDs de tareas
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Buscar todas las Global Tasks usando los IDs obtenidos del usuario
    const globalTasks = await this.globalTaskModel
      .find({ _id: { $in: user.tasks } })
      .lean();

    // Añadir el nombre del administrador y el progreso a cada tarea
    const tasksWithAdminDetails = await Promise.all(
      globalTasks.map(async (task) => {
        // Obtener el nombre del administrador
        const admin = await this.userModel
          .findById(task.admin)
          .select("name")
          .lean();

        // Obtener el progreso usando el método getProgress
        const progress = await this.getProgress(task._id.toString());

        return {
          ...task,
          creator: admin?.name || "Unknown Admin", // Incluye el nombre del admin
          progress: progress, // Usa el progreso calculado por getProgress
        };
      })
    );

    return tasksWithAdminDetails;
  }

  async addMemberToGlobalTask(
    globalTaskId: string,
    userId: string,
    requesterId: string
  ): Promise<GlobalTask> {
    // Buscar la tarea global
    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(
        `Global Task with ID "${globalTaskId}" not found`
      );
    }

    // Verificar si el requester es el administrador de la tarea global
    if (globalTask.admin.toString() !== requesterId) {
      throw new ForbiddenException(
        "Only the admin can add members to this global task."
      );
    }

    // Convertir el userId a ObjectId
    const userObjectId = new Types.ObjectId(userId);

    // Verificar si el usuario ya es miembro de la tarea global
    if (!globalTask.members.includes(userObjectId)) {
      globalTask.members.push(userObjectId); // Agregar como ObjectId
      await globalTask.save();
    }

    // Buscar el usuario
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Convertir el globalTask._id a un string antes de crear el ObjectId
    const globalTaskObjectId = new Types.ObjectId(globalTask._id.toString());

    // Verificar si la tarea global ya está en el array de tasks del usuario
    if (!user.tasks.some((taskId) => taskId.equals(globalTaskObjectId))) {
      user.tasks.push(globalTaskObjectId); // Agregar el ID de la tarea global al array de tasks del usuario
      await user.save();
    }

    return globalTask;
  }

  async removeMemberFromGlobalTask(
    globalTaskId: string,
    userId: string,
    requesterId: string
  ): Promise<GlobalTask> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(
        `Global Task with ID "${globalTaskId}" not found`
      );
    }

    // Verificar si el requester es el admin
    if (globalTask.admin.toString() !== requesterId) {
      throw new ForbiddenException(
        "Only the admin can remove members from this global task."
      );
    }

    const userObjectId = new Types.ObjectId(userId); // Convertir userId a ObjectId

    // Verificar si el usuario está en la lista de miembros
    if (globalTask.members.includes(userObjectId)) {
      globalTask.members = globalTask.members.filter(
        (memberId) => memberId.toString() !== userObjectId.toString()
      ); // Filtrar al usuario
      await globalTask.save();
    } else {
      throw new NotFoundException("User is not a member of this global task.");
    }

    return globalTask;
  }

  async getUserRoleInGlobalTask(
    globalTaskId: string,
    userId: string
  ): Promise<string> {
    let response = "noUser";
    // Buscar la GlobalTask por su ObjectId
    await this.globalTaskModel
      .findById(globalTaskId)
      .lean()
      .then(async (globalTask) => {
        if (!globalTask) {
          throw new NotFoundException(
            `Global Task with "${globalTaskId}" not found`
          );
        }
        // Verificar si el usuario es admin de la GlobalTask (como string)
        if (globalTask.admin.toString() === userId) {
          response = "ProjectAdmin";
        }

        // Verificar si el usuario es admin de alguna GroupalTask asociada
        const groupalTasks = await this.groupalTaskModel.find({
          globalTaskId: globalTaskId,
        });
        const isGroupAdmin = groupalTasks.some(
          (groupalTask) => groupalTask.admin.toString() === userId
        );
        if (isGroupAdmin) {
          response = "GroupAdmin";
        }

        // Verificar si el usuario está en el array `members` (comparación como string)
        const isMember = globalTask.members.some(
          (memberId) => memberId.toString() === userId
        );
        if (isMember) {
          response = "User";
        }
        // Si no es ProjectAdmin, GroupAdmin o miembro
      });
    return response;
  }
}
