import { model, Schema, Types } from "mongoose";

export const sch = new Schema(
    {
        channel: {
            type: Types.ObjectId,
            required: true,
            ref: "Channel",
        },
        member: {
            type: Types.ObjectId,
            required: true,
            ref: "Member",
        },
    },
    { timestamps: true }
);

export const ChannelMember = new model("ChannelMember", sch);
