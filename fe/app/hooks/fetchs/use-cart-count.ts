import { cartApi } from "@/api/cart-api.service";
import { useQuery } from "@tanstack/react-query";

export const useCartCount = () => {
  return useQuery({
    queryKey: ["cart-count"],
    queryFn: () => cartApi.getCartCount(),
    staleTime: 5 * 60 * 1000,
  });
};
