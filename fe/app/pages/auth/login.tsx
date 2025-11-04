"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useForm } from "react-hook-form";

import InputPassword from "@/components/input-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
// ⬇️ các Form primitives của shadcn/ui
import { authApi, type IJwtPayload } from "@/api/auth-api.service";
import Loader from "@/components/loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Links } from "@/config/links";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { Constant } from "@/lib/constant";
import { setUser } from "@/store/slices/app.slice";
import {
  authenSchema,
  type LoginValues,
} from "@/validation/schema/auth/authen-schema";
import { useMutation } from "@tanstack/react-query";

export function meta() {
  return [{ title: `${import.meta.env.VITE_APP_NAME} | Login` }];
}

const Login = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  // 3) Khởi tạo RHF với zodResolver
  const form = useForm<LoginValues>({
    resolver: zodResolver(authenSchema.login),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) => {
      return authApi.login(credentials);
    },
    onSuccess: (data) => {
      const token = data?.data.token;

      const user = data?.data?.user;

      if (!token || !user) return;

      try {
        // Decode JWT
        const decoded = jwtDecode<IJwtPayload>(token);

        // Convert exp (seconds) -> datetime
        const expireDate = new Date(decoded.exp * 1000);

        // Lưu token vào cookie với thời hạn chính xác
        Cookies.set(Constant.ACCESS_TOKEN, token, {
          expires: expireDate, // cookie sẽ hết hạn đúng lúc token hết hạn
          secure: true, // dùng https
          sameSite: "Strict",
        });

        dispatch(setUser(user));
        navigate(Links.PROFILE);
        // navigate(Links.HOME);
      } catch (error) {
        console.error("Invalid JWT token", error);
      }
    },
    onError(error) {
      authApi.handleError(error);
    },
  });

  // 4) Submit handler
  const onSubmit = async (values: LoginValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Link2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Member Sign In
            </h1>
            <p className="text-muted-foreground">
              Access your link shortener account
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Sign in with email
                </span>
              </div>
            </div>

            {/* 5) Bọc form bằng <Form> của shadcn */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage /> {/* tự hiện message từ zod */}
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <InputPassword
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-end">
                        <Link
                          to="/forgot-password"
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader color="white" />
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
