"use client";

import { extractApi } from "@/api/extract";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LinkIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { TranscriptModal } from "./transcript-modal";
import { useState } from "react";

const formSchema = z.object({
  url: z
    .string()
    .url({ message: "Vui lòng nhập URL hợp lệ" })
    .min(1, { message: "Vui lòng nhập URL YouTube" }),
  model: z.string().min(1, { message: "Vui lòng chọn model" }),
});

type FormValues = z.infer<typeof formSchema>;

const MODELS = [
  { value: "base", label: "Base" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export function YouTubeConverter() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      model: MODELS[0].value,
    },
  });

  const [transcript, setTranscript] = useState<ITranscriptData | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: { link: string; model: string }) => {
      return extractApi.extract(values);
    },
    onSuccess(data) {
      toast("Conversion Successful", {
        description: "Nội dung được lưu tạo folder dowloads",
      });

      setTranscript(data?.video || null);

      form.reset({});
    },
    onError(error: any) {
      toast("Conversion Failed", {
        description:
          error?.message ||
          "An internal server error occurred. Please try again.",
      });
    },
  });

  const handleSubmit = async (values: FormValues) => {
    mutate({
      link: values.url,
      model: values.model,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Nhập URL YouTube
          </CardTitle>
          <CardDescription>
            Dán link video YouTube và chọn model để bắt đầu quá trình chuyển đổi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL YouTube</FormLabel>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      disabled={isPending}
                      {...field}
                    />
                    <FormDescription>
                      Nhập link video YouTube bạn muốn chuyển đổi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn model để xử lý" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELS.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Chọn model AI để chuyển đổi audio thành văn bản
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Đang xử lý
                  </>
                ) : (
                  "Chuyển đổi"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Spinner className="h-12 w-12 text-primary" />
              <div className="text-center space-y-2">
                <p className="font-medium">Đang xử lý video...</p>
                <p className="text-sm text-muted-foreground">
                  Quá trình này có thể mất vài phút
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <TranscriptModal
        onClose={() => {
          setTranscript(null);
        }}
        isOpen={!!transcript}
        data={transcript}
      />
    </div>
  );
}
