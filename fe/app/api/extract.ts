import axios from "@/lib/axios";
import { ApiHelper } from ".";

class ExtractApiService extends ApiHelper {
  async extract(data: { link: string; model: string }) {
    const response = await axios({
      url: "extract",
      method: "POST",
      data,
    });

    return response.data;
  }
}

export const extractApi = new ExtractApiService();
