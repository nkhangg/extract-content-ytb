// base-api.service.ts
import type { TableState } from "@/components/core/data-table";
import { removeUndefinedValues } from "@/features/remove-falsy-values";
import { mapTableStateToSpatieQuery } from "@/features/table";
import type { DeepPartial } from "react-hook-form";
import { ApiHelper } from ".";
import axios from "../lib/axios";

export interface IAPIOption {
  toast_success: boolean;
}

export class BaseApiService<T extends { id: number }> extends ApiHelper {
  constructor(protected readonly resourceUrl: string) {
    super();
  }

  async index(values?: DeepPartial<TableState<T>> | undefined) {
    const params = values
      ? mapTableStateToSpatieQuery(values as TableState<T>)
      : {};

    const response = await axios({
      url: this.resourceUrl,
      params: params,
      withCredentials: true,
      method: "GET",
    });

    return response.data;
  }

  async get(id: T["id"], options: IAPIOption = { toast_success: false }) {
    const response = await axios({
      url: this.resourceUrl + "/" + id,
      withCredentials: true,
      method: "GET",
    });

    if (options.toast_success) {
      this.handleSuccess(response.data, this.resourceUrl);
    }

    return response.data;
  }

  async create(
    data: Partial<Omit<T, "id" | "created_at" | "updated_at">>,
    options: IAPIOption = { toast_success: true }
  ) {
    const newData = removeUndefinedValues(data);
    const { data: result } = await axios({
      url: this.resourceUrl,
      withCredentials: true,
      method: "POST",
      data: newData,
    });

    if (options.toast_success) {
      this.handleSuccess(result, this.resourceUrl);
    }

    return result;
  }

  async update(
    id: T["id"],
    data: Partial<T>,
    options: IAPIOption = { toast_success: false }
  ) {
    const cleaned = removeUndefinedValues(data);
    const { data: result } = await axios({
      url: `${this.resourceUrl}/${id}`,
      withCredentials: true,
      method: "PUT",
      data: cleaned,
    });

    if (options.toast_success) {
      this.handleSuccess(result, this.resourceUrl);
    }

    return result;
  }

  async delete(entity: T, options: IAPIOption = { toast_success: false }) {
    const { data } = await axios({
      url: `${this.resourceUrl}/${entity.id}`,
      withCredentials: true,
      method: "DELETE",
    });

    if (options.toast_success) {
      this.handleSuccess(data, this.resourceUrl);
    }
    return data;
  }

  async bulkDelete(
    entities: T[],
    options: IAPIOption = { toast_success: false }
  ) {
    const ids = entities.map((e) => e.id);
    const { data } = await axios({
      url: `${this.resourceUrl}/bulk-delete`,
      withCredentials: true,
      method: "DELETE",
      data: { ids },
    });

    if (options.toast_success) {
      this.handleSuccess(data, this.resourceUrl);
    }

    return data;
  }

  async bulkUpdate(
    entities: T[],
    options: IAPIOption = { toast_success: false }
  ) {
    const { data } = await axios({
      url: `${this.resourceUrl}/bulk-update`,
      withCredentials: true,
      method: "PUT",
      data: entities,
    });

    if (options.toast_success) {
      this.handleSuccess(data, this.resourceUrl);
    }

    return data;
  }

  // Optional: override this in subclass if needed
  async customAction(
    id: number,
    endpoint: string,
    payload?: Record<string, any>,
    method?: string,
    options: IAPIOption = { toast_success: false }
  ) {
    const { data } = await axios({
      url: `${this.resourceUrl}/${endpoint}/${id}`,
      method: method || "POST",
      data: removeUndefinedValues(payload || {}),
      withCredentials: true,
    });

    if (options.toast_success) {
      this.handleSuccess(data, this.resourceUrl);
    }
    return data;
  }
}
