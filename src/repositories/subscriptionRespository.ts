import User from "../models/User";

export const findUserByStripeCustomerId = async (customerId: string) => {
  return User.findOne({ stripeCustomerId: customerId });
};


export const findUserBySubscriptionId = async (subscriptionId: string) => {
  return User.findOne({ stripeSubscriptionId: subscriptionId });
};

export const updateUserSubscription = async (
  userId: string,
  data: {
    plan?:                 "free" | "pro";
    stripeCustomerId?:     string;
    stripeSubscriptionId?: string;
    subscriptionStatus?:   string;
    currentPeriodEnd?:     Date;
  }
) => {
  return User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true }
  );
};


export const downgradeToFree = async (userId: string) => {
  return User.findByIdAndUpdate(
    userId,
    {
      $set: {
        plan:               "free",
        subscriptionStatus: "canceled",
      },
      $unset: {
        stripeSubscriptionId: "",
        currentPeriodEnd:     "",
      },
    },
    { new: true }
  );
};