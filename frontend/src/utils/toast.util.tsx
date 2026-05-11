import { NotificationProps, showNotification } from "@mantine/notifications";
import { TbCheck, TbX } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import notificationHistory from "./notificationHistory.util";

const error = (
  message: string,
  config?: Omit<NotificationProps, "message">,
) => {
  notificationHistory.add({
    type: "error",
    title: "错误",
    message,
  });

  return showNotification({
    icon: <TbX />,
    color: "red",
    radius: "md",
    title: <FormattedMessage id="common.error" />,
    message: message,

    autoClose: true,

    ...config,
  });
};

const axiosError = (axiosError: any) => {
  const apiError = axiosError?.response?.data?.error;
  const message =
    axiosError?.response?.data?.message ??
    (apiError == "api_unavailable"
      ? "API service is unavailable. Please start the backend service."
      : undefined) ??
    "An unknown error occurred";

  return error(message);
};

const success = (
  message: string,
  config?: Omit<NotificationProps, "message">,
) => {
  notificationHistory.add({
    type: "success",
    title: "成功",
    message,
  });

  return showNotification({
    icon: <TbCheck />,
    color: "green",
    radius: "md",
    title: <FormattedMessage id="common.success" />,
    message: message,
    autoClose: true,
    ...config,
  });
};

const toast = {
  error,
  success,
  axiosError,
};
export default toast;
