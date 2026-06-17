import { Types } from "mongoose";
import User from "../models/User";
import { IUser } from "../models/User";

export const findAllUsers = () => User.find();

export const findUserById = (id: string) => User.findById(new Types.ObjectId(id));

export const findUserByIdAndUpdate = (id: string, query: object) => User.findByIdAndUpdate(new Types.ObjectId(id), query);

export const findByEmail = (email: string) => User.findOne({email}).select("+password +refreshTokens");

export const findByEmailOrUsername = (email: string, username: string) => User.findOne({$or: [{username}, {email}]});

export const createUser = ( {email, password, username} : {email: string; password: string; username: string;}) => User.create({email, password, username});

export const saveRefreshToken = (user: IUser, refreshToken: string) => user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7*24*60*60*1000)
});

export const updateUser = (userId: string, data: {email?: string; password?: string; username?: string}) => User.findByIdAndUpdate(new Types.ObjectId(userId), data);

export const removeUser = (userId: string) => User.findByIdAndDelete(new Types.ObjectId(userId));

export const findOrCreateGoogleUser = async ({googleId, email, username}: {googleId: string; email:string; username: string}) => {
    let user = await User.findOne({googleId});
    if(user) return user;

    user = await User.findOne({email});

    if(user){
        user.googleId = googleId;
        await user.save();
        return user;
    }

    return User.create({
        googleId,
        email,
        username
    })
}