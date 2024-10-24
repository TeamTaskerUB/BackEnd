import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Task extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  priority: string;

  @Prop({
    type: [{ id: { type: Types.ObjectId, ref: 'User' }, text: { type: String } }],
    default: [],
  })
  comments: { id: Types.ObjectId; text: string }[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignees: Types.ObjectId[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
