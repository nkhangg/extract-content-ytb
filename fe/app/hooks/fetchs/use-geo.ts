import { useMemo } from "react";

import { geographyApi } from "@/api/geography-api.service";
import { useQuery } from "@tanstack/react-query";

export interface IUseGeoProps {
  enabled?: boolean;
}

export default function useGeo({ enabled }: IUseGeoProps) {
  const geography = useQuery<any>({
    queryFn: () => {
      return geographyApi.getRegionCountry();
    },
    queryKey: ["get_region_country"],
    enabled,
    staleTime: 20000,
  });

  const regionOptions = useMemo(() => {
    const data = geography?.data?.data?.["regions"];
    if (!data) return [];

    return (data as IRegion[]).map((region) => ({
      value: String(region.id),
      label: region.name,
    }));
  }, [geography]);

  const coutryOptions = useMemo(() => {
    const data = geography?.data?.data?.["countries"];
    if (!data) return [];

    return (data as ICountry[]).map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [geography]);

  const stateOptions = useMemo(() => {
    const data = geography?.data?.data?.["states"];
    if (!data) return [];

    return (data as IState[]).map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [geography]);

  return { stateOptions, coutryOptions, regionOptions, geography };
}
