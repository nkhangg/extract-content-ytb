import { authApi } from "@/api/auth-api.service";
import { delay } from "@/features/delay";
import { useQuery } from "@tanstack/react-query";

export const useMe = () => {
  return useQuery({
    queryFn: async () => {
      await delay(300);
      return authApi.me();
    },
    queryKey: ["me"],
    retry: false,
  });
};
