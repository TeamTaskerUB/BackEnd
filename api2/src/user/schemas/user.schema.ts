import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class User {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    age: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Proyect' }], default: [] })
    proyects: Types.ObjectId[]; // Referencia a una colección de proyectos
}

export const UserSchema = SchemaFactory.createForClass(User);
