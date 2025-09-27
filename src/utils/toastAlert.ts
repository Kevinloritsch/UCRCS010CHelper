import { toast } from "sonner";

export function overrideAlerts() {
  window.alert = (message?: string) => {
    toast(message ?? "", {
      style: {
        background: "black",
        color: "white",
      },
    });
  };
}
