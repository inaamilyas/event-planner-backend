import { getMessaging } from "firebase-admin/messaging";

const sendFCMNotification = async (user_tokens, notification, data) => {

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: data,
    tokens: user_tokens,
  };
  const fcmResponse = await getMessaging().sendEachForMulticast(message);
  return fcmResponse;
};

export default sendFCMNotification;