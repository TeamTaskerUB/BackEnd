import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroupalTask } from './schemas/groupal-task.schema';
import { GlobalTask } from '../global-task/schemas/global-task.schema';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';
import { Task } from 'src/tasks/schemas/task.schema';
import { User } from 'src/user/schemas/user.schema'; 

@Injectable()
export class GroupalTasksService {
  constructor(
    @InjectModel(GroupalTask.name) private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(GlobalTask.name) private readonly globalTaskModel: Model<GlobalTask>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async createGroupalTask(globalTaskId: string, createGroupalTaskDto: CreateGroupalTaskDto): Promise<GroupalTask> {
    const groupalTask = new this.groupalTaskModel({
      ...createGroupalTaskDto,
    });

    const createdGroupalTask = await groupalTask.save();

    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }

    // Solo usar createdGroupalTask._id directamente
    globalTask.groupalTasks.push(createdGroupalTask._id); 
    await globalTask.save();

    return createdGroupalTask;
  }

  async getGroupalTaskPreview(groupalTaskId: string) {
    // Buscar la tarea grupal por su ID
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    // Buscar las tareas normales asociadas
    const tasks = await this.taskModel.find({ _id: { $in: groupalTask.tasks } }).select('name startDate endDate description').exec();

    return {
      groupalTask: groupalTask.toObject(),
      tasksPreview: tasks,  // Devolvemos solo la vista previa de las tareas
    };
  }

  // Método para asignar un admin a una tarea grupal
  async assignAdmin(groupalTaskId: string, newAdminId: string): Promise<GroupalTask> {
    // Buscar la tarea grupal
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);

    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    // Asignar el nuevo admin a la tarea grupal
    groupalTask.admin = new Types.ObjectId(newAdminId);

    // Cambiar el rol del usuario a GManager
    const user = await this.userModel.findById(newAdminId);
    if (!user) {
      throw new NotFoundException(`User with ID "${newAdminId}" not found`);
    }

    user.role = 'GManager';  // Cambiar el rol del usuario
    await user.save();  // Guardar los cambios del usuario

    // Guardar la tarea grupal con el nuevo admin
    await groupalTask.save();

    return groupalTask;
  }


  async deleteGroupalTask(groupalTaskId: string): Promise<void> {
    // Buscar la tarea grupal
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }
  
    // Eliminar todas las tareas individuales asociadas a la tarea grupal
    for (const taskId of groupalTask.tasks) {
      // Eliminar la tarea individual
      await this.taskModel.deleteOne({ _id: taskId });
  
      // Eliminar la referencia de la tarea en la tarea global
      await this.globalTaskModel.updateOne(
        { tasks: taskId },
        { $pull: { tasks: taskId } }
      );
    }
  
    // Eliminar la tarea grupal
    await this.groupalTaskModel.deleteOne({ _id: groupalTaskId });
  
    // Actualizar la tarea global para remover la referencia a la tarea grupal eliminada
    await this.globalTaskModel.updateOne(
      { groupalTasks: groupalTaskId },
      { $pull: { groupalTasks: groupalTaskId } }
    );
  }
  


  async removeAdminFromGroupalTask(groupalTaskId: string): Promise<GroupalTask> {
    // Buscar la tarea grupal
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
  
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }
  
    // Si hay un admin asignado, cambiar el rol de ese admin a 'User'
    if (groupalTask.admin) {
      const user = await this.userModel.findById(groupalTask.admin);
      if (user) {
        user.role = 'User';  // Cambiar el rol del admin a 'User'
        await user.save();  // Guardar los cambios en el usuario
      }
    }
  
    // Eliminar el admin de la tarea grupal
    groupalTask.admin = null;
  
    // Guardar la tarea grupal sin admin
    await groupalTask.save();
  
    return groupalTask;
  }
  
  
}
