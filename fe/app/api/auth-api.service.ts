import axios from "@/lib/axios";
import { ApiHelper } from ".";

export interface IJwtPayload {
  exp: number; // expiration time (Unix timestamp)
  iat?: number; // issued at
  [key: string]: any;
}

class AuthApiService extends ApiHelper {
  async login(credentials: { email: string; password: string }) {
    const { data } = await axios({
      url: "auth/login",
      data: credentials,
      method: "POST",
      skipAuthRedirect: true,
      showToastHasExpired: false,
    } as any);

    return data as IResponse<{ token: string; user: IUser }>;
  }

  async forgotPassword(credentials: { email: string }) {
    const { data } = await axios({
      url: "auth/forgot-password",
      data: credentials,
      method: "POST",
    });

    return data as IResponse<{ token: string }>;
  }

  async resetPassword(credentials: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }) {
    const { data } = await axios({
      url: "auth/reset-password",
      data: credentials,
      method: "POST",
    });

    return data as IResponse<{ token: string }>;
  }

  async logout() {
    const { data } = await axios({
      url: "auth/logout",
      method: "POST",
    });

    return data as IResponse<boolean>;
  }

  async changePassword(credentials: { newPassword: string; password: string }) {
    const { data } = await axios({
      url: "auth/change-password",
      data: credentials,
      method: "POST",
    });

    this.handleSuccess(data);
    return data as IResponse<boolean>;
  }

  async me() {
    try {
      const { data } = await axios({
        url: "auth/profile",
        method: "GET",
      });

      return data as IResponse<IUser>;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateMe(credentials: {
    first_name: string;
    last_name: string;
    email: string;
    position?: string;
    phonenumber?: string;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
    facebook?: string;
    github?: string;
    linkedin?: string;
  }) {
    try {
      const { data } = await axios({
        url: "auth/profile/update",
        data: credentials,
        method: "PUT",
      });

      this.handleSuccess(data);
      return data as IResponse<boolean>;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateAvatar(credentials: FormData) {
    try {
      const { data } = await axios({
        url: "auth/avatar/update",
        data: credentials,
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
      });

      this.handleSuccess(data);
      return data as IResponse<boolean>;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const authApi = new AuthApiService();
