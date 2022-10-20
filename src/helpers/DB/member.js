import {model, Schema} from "mongoose";

export const sch = new Schema({
    discord_id: {
        type: String,
        required: true
    },
    guild_id: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Member = new model("Member", sch);