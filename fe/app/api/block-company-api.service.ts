import axios from "@/lib/axios";
import { ApiHelper } from ".";

class BlockCompanyApiService extends ApiHelper {
  resourceUrl = "block-companies";

  async index() {
    const response = await axios({
      url: this.resourceUrl,
      method: "GET",
    });

    return response.data;
  }

  async create(data: ICompany) {
    const response = await axios({
      url: this.resourceUrl,
      method: "POST",
      data: {
        company_id: data.id,
      },
    });

    return response.data;
  }

  async delete(data: ICompany) {
    const response = await axios({
      url: this.resourceUrl + `/${data.id}`,
      method: "DELETE",
    });

    return response.data;
  }
}

export const blockCompanyApi = new BlockCompanyApiService();
