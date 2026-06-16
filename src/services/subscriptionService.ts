import stripe from "../config/stripe";
import {
  findUserByStripeCustomerId,
  updateUserSubscription,
  downgradeToFree,
} from "../repositories/subscriptionRespository";
import User from "../models/User";

export const createCheckoutSessionService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // reuse existing Stripe customer or create a new one
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
      metadata: { userId: userId.toString() },
    });
    customerId = customer.id;

    // save customerId so we can reuse it
    await updateUserSubscription(userId, { stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    // where to redirect after payment
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: userId.toString() },
    },
    metadata: { userId: userId.toString() },
  });
  return { url: session.url, sessionId: session.id };
};

export const createPortalSessionService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (!user.stripeCustomerId) throw new Error("No active subscription found");
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/settings`,
  });

  return { url: session.url };
};

export const getSubscriptionService = async (userId: string) => {
  const user = await User.findById(userId).select(
    "plan subscriptionStatus currentPeriodEnd stripeSubscriptionId",
  );
  if (!user) throw new Error("User not found");

  return {
    plan: user.plan ?? "free",
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
    isActive:
      user.plan === "pro" &&
      (user.subscriptionStatus === "active" ||
        user.subscriptionStatus === "trialing"),
  };
};

export const handleWebhookService = async (
  payload: Buffer,
  signature: string,
) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    throw new Error("Invalid webhook signature!");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      if (!userId) break;
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription,
      );
      await updateUserSubscription(userId, {
        plan: "pro",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000,
        ),
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      const customerId = invoice.customer;
      const user = await findUserByStripeCustomerId(customerId);
      if (!user) break;

      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription,
      );

      await updateUserSubscription(user._id.toString(), {
        plan:               "pro",
        subscriptionStatus: subscription.status as any,
        currentPeriodEnd:   new Date(
          (subscription as any).current_period_end * 1000
        ),
      });
      break;
    }

     case "invoice.payment_failed": {
      const invoice    = event.data.object as any;
      const customerId = invoice.customer;
      const user       = await findUserByStripeCustomerId(customerId);
      if (!user) break;

      await updateUserSubscription(user._id.toString(), {
        subscriptionStatus: "past_due",
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const customerId   = subscription.customer;
      const user         = await findUserByStripeCustomerId(customerId);
      if (!user) break;

      await downgradeToFree(user._id.toString());
      break;
    }

     case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      const customerId   = subscription.customer;
      const user         = await findUserByStripeCustomerId(customerId);
      if (!user) break;

      await updateUserSubscription(user._id.toString(), {
        subscriptionStatus: subscription.status,
        currentPeriodEnd:   new Date(subscription.current_period_end * 1000),
        // if subscription becomes active after trial, ensure plan is pro
        ...(subscription.status === "active" && { plan: "pro" }),
        // if cancelled, downgrade
        ...(subscription.status === "canceled" && { plan: "free" }),
      });
      break;
    }
  }
  return { received: true };
};
