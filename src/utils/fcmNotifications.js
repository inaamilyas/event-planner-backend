import { getMessaging } from "firebase-admin/messaging";

const sendFCMNotification = async (user_tokens, notification, data = {}) => {
  // Generate a unique identifier for each message to prevent collapsing
  const uniqueId = Date.now().toString(); // Using timestamp for simplicity

  const message = {
    data: {
      title: notification.title,
      body: notification.body,
      uniqueId,
      ...data,
    },
    tokens: user_tokens,
  };

  const fcmResponse = await getMessaging().sendEachForMulticast(message);

  return fcmResponse;
};

// const sendFCMNotification = async (user_tokens, notification, data={}) => {

//   const message = {
//     notification: {
//       title: notification.title,
//       body: notification.body,
//     },
//     data,
//     tokens: user_tokens,
//   };
//   const fcmResponse = await getMessaging().sendEachForMulticast(message);

//   return fcmResponse;
// };

export default sendFCMNotification;
