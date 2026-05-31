import { createUser, findByEmail, findByEmailOrUsername } from "../repositories/authRepository";

export const registerUser = async (email: string, password: string, username: string) => {
    const existingUser = await findByEmailOrUsername(email, username);
    if(existingUser){
        const field = existingUser.username === username ? "Username" : "Email";
        throw new Error(`An account with this ${field} already exists`);
    }
    const newUser = await createUser({email, password, username});
    return newUser;
};

export const loginUser = async (email: string, password: string) => {
    const user = await findByEmail(email);
    if(!user){
        throw new Error("Invalid email or password");
    }

    const isPasswordMatch = await user.comparePassword(password);

    if(!isPasswordMatch){
        throw new Error("Invalid email or password");
    }

    return user;
};