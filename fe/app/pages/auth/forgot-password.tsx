"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ArrowLeft, Mail } from "lucide-react";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// shadcn form primitives (adjust path if your project structure differs)
import { authApi } from "@/api/auth-api.service";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Links } from "@/config/links";
import { delay } from "@/features/delay";
import {
  authenSchema,
  type ForgotPasswordValues,
} from "@/validation/schema/auth/authen-schema";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";

export function meta() {
  return [{ title: `${import.meta.env.VITE_APP_NAME} | Forgot Password` }];
}

export default function ForgotPasswordPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(authenSchema.forgotPassword),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: async (credentials: { email: string }) => {
      await delay(300);
      return authApi.forgotPassword(credentials);
    },
    onSuccess() {
      setIsEmailSent(true);
    },
    onError(error) {
      authApi.handleError(error);
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    mutation.mutate(values);
  };

  // allow resend: re-open form and prefill with previous email
  const handleResend = () => {
    setIsEmailSent(false);
  };

  // success view
  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Email Sent</CardTitle>
            <CardDescription>
              We have sent password reset instructions to your email.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Check your inbox and follow the instructions to reset your
              password. If you do not see the email, please check your spam
              folder.
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleResend}
                variant="outline"
                className="w-full"
              >
                Resend email
              </Button>

              <Button asChild className="w-full">
                <Link to="/login">Back to sign in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // form view
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <CardTitle className="text-2xl text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive password reset instructions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      {/* Input must forward ref to work with RHF */}
                      <Input
                        required={false}
                        id="email"
                        placeholder="your@email.com"
                        type="email"
                        {...field}
                        disabled={mutation.isPending}
                      />
                    </FormControl>
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
                  "Send instructions"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to={Links.LOGIN} className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
