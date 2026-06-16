import mongoose, { Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IRefreshToken {
  token: string;
  createdAt?: Date;
  expiresAt: Date;
  isRevoked?: boolean;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  refreshTokens: IRefreshToken[];
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicProfile(): object;
  plan: "free" | "pro";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?:
    | "active"
    | "canceled"
    | "past_due"
    | "trialing"
    | "incomplete";
  currentPeriodEnd?: Date;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicProfile(): object;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be atleast 3 characters long"],
      maxlength: [15, "Username must be at most 15 characters long"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      minlength: [7, "Password must be at least 7 characters long"],
      select: false, // Exclude password from query results by default
    },
    refreshTokens: [
      {
        token: {
          type: String,
        },
        createdAt: { type: Date, default: Date.now, required: false },
        expiresAt: { type: Date, required: true },
      },
    ],
    googleId: {
      type: String,
      default: undefined,
      sparse: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    stripeCustomerId: {
      type: String,
      default: undefined,
      sparse: true,
      unique: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: undefined,
      sparse: true,
      unique: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "canceled", "past_due", "trialing", "incomplete"],
      default: undefined,
    },
    currentPeriodEnd: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
