import {model, Schema} from "mongoose";

export const sch = new Schema({
    discord_id: {
        type: String,
        required: true
    },
    discord_name: {
        type: String,
        required: true
    },
}, { timestamps: true });

export const Channel = new model("Channel", sch);