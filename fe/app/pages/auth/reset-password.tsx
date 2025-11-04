"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";

import { authApi } from "@/api/auth-api.service";
import InputPassword from "@/components/input-password";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Links } from "@/config/links";
import {
  authenSchema,
  type ResetPasswordValues,
} from "@/validation/schema/auth/authen-schema";
import { CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { delay } from "@/features/delay";

export function meta() {
  return [{ title: `${import.meta.env.VITE_APP_NAME} | Reset Password` }];
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(authenSchema.resetPassword),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (credentials: {
      email: string;
      token: string;
      password: string;
      password_confirmation: string;
    }) => {
      await delay(300);
      return authApi.resetPassword(credentials);
    },
    onSuccess(data) {
      console.log({ data });
    },
    onError(error) {
      authApi.handleError(error);
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token || !email) return;

    mutation.mutate({ ...values, email, token });
  };

  // -----------------------------
  // Success UI
  // -----------------------------
  if (mutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              Password Reset Successful
            </CardTitle>
            <CardDescription>
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to={Links.LOGIN}>Login Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------
  // Invalid Token
  // -----------------------------
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invalid Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request a New Link</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link to={Links.LOGIN}>Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -----------------------------
  // Main Reset Password Form
  // -----------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <InputPassword
                        tabIndex={1}
                        placeholder="At least 8 characters"
                        disabled={mutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <InputPassword
                        tabIndex={2}
                        placeholder="Re-enter new password"
                        disabled={mutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                tabIndex={3}
                type="submit"
                className="w-full"
                disabled={mutation.isPending || !form.formState.isDirty}
              >
                {mutation.isPending ? (
                  <Loader color="white" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to={Links.LOGIN} className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
