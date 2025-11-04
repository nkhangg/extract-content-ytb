/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError, HttpStatusCode } from "axios";
import { toast } from "sonner";

interface IResponse<R> {
  message: string;
  data: R;
}

export class ApiHelper {
  /**
   * Lấy message từ AxiosError hoặc unknown error
   */
  public getErrorMessage(error: unknown): string {
    const response = (error as AxiosError)?.response as
      | Record<string, any>
      | undefined;
    const data = response?.data;

    if (!response) return "Internal Server Error";

    // Bỏ qua nếu bị Forbidden
    if (response.status === HttpStatusCode.Forbidden) return "";

    // Trường hợp có errors dạng mảng
    if (data?.errors && Array.isArray(data.errors) && data.errors.length) {
      let newMessage = data.errors[0]?.errors?.[0] ?? "Internal Server Error";

      if (data.errors.length > 1) {
        newMessage = `${newMessage} and ${data.errors.length} errors`;
      }

      return newMessage;
    }

    // Trường hợp có message trực tiếp
    return (data?.message as string) || "Internal Server Error";
  }

  /**
   * Xử lý lỗi và hiện toast
   */
  public handleError(error: unknown) {
    const response = (error as AxiosError)?.response as
      | Record<string, any>
      | undefined;

    if (!response) {
      toast.error("Internal Server Error");
      return;
    }

    const data = response.data;

    if (response.status === HttpStatusCode.Forbidden) return;

    if (data?.errors && (data.errors as []).length) {
      let newMessage = data.errors[0].errors[0];

      if ((data.errors as []).length > 1) {
        newMessage = `${newMessage} and ${data.errors.length} errors`;
      }

      toast.error(newMessage || "Internal Server Error");
      return;
    }

    toast.error((response?.data?.message as string) || "Internal Server Error");
  }

  /**
   * Xử lý success và hiện toast
   */
  public handleSuccess<R>(data: IResponse<R>, key?: string) {
    toast.success(data.message.replaceAll("@key", key || ""));
  }

  /**
   * Chuyển params sang định dạng NestJS
   */
  public generateNestParams(params: Record<string, any>) {
    const excludeKeys = ["page"];
    const prefixSortKey = "";

    if (!params) return params;

    const newParams = Object.keys(params).reduce((prev, cur) => {
      if (excludeKeys.includes(cur)) {
        prev[cur] = params[cur];
      } else if (cur.includes(prefixSortKey)) {
        prev["sortBy"] = `${cur.replace("", "")}:${String(
          params[cur]
        ).toLocaleUpperCase()}`;
      } else if (cur === "per_page") {
        prev["limit"] = params[cur];
      } else if (cur === "") {
        prev["search"] = params[cur];
      } else {
        prev[`filter.${cur}`] = params[cur];
      }

      return prev;
    }, {} as Record<string, any>);

    return newParams;
  }

  public static getImageUrl(uri: string | null) {
    if (!uri) return null;

    const base = (import.meta.env.VITE_BASE_URL || "")
      // xóa cả "/api/member/" lẫn "/api/member"
      .replace(/\/api\/member\/?$/, "");

    return `${base}/storage/${uri}`;
  }
}
