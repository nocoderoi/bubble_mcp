import { AxiosInstance } from 'axios';
import apiClient from './apiClient.js';
import { BubbleSchema } from './types.js';

export class BubbleService {
  private client: AxiosInstance;
  private schema: BubbleSchema | null = null;

  constructor(client: AxiosInstance = apiClient) {
    this.client = client;
  }

  async getSchema(): Promise<BubbleSchema> {
    if (!this.schema) {
      try {
        const response = await this.client.get('/meta');
        this.schema = response.data;
      } catch (error: any) {
        console.error('Schema fetch error:', error.response?.data || error.message);
        throw error;
      }
    }
    return this.schema!;
  }

  async list(dataType: string, params?: { limit?: number; cursor?: number }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.cursor) queryParams.append('cursor', params.cursor.toString());
      
      const response = await this.client.get(`/obj/${dataType}?${queryParams}`);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`Error listing ${dataType}:`, errorMsg);
      throw new Error(`Failed to list ${dataType}: ${errorMsg}`);
    }
  }

  async get(dataType: string, id: string) {
    try {
      const response = await this.client.get(`/obj/${dataType}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting ${dataType} ${id}:`, error);
      throw error;
    }
  }

  async create(dataType: string, data: Record<string, any>) {
    try {
      const response = await this.client.post(`/obj/${dataType}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${dataType}:`, error);
      throw error;
    }
  }

  async update(dataType: string, id: string, data: Record<string, any>) {
    try {
      const response = await this.client.patch(`/obj/${dataType}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${dataType} ${id}:`, error);
      throw error;
    }
  }

  async delete(dataType: string, id: string) {
    try {
      const response = await this.client.delete(`/obj/${dataType}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting ${dataType} ${id}:`, error);
      throw error;
    }
  }

  async executeWorkflow(workflowName: string, data: Record<string, any>) {
    try {
      const response = await this.client.post(`/wf/${workflowName}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error executing workflow ${workflowName}:`, error);
      throw error;
    }
  }

  async listOrganizations(firstEntry?: number, lastEntry?: number) {
    return this.executeWorkflow('list_all_organizations', {
      first_entry: firstEntry,
      last_entry: lastEntry,
    });
  }

  async listBranches(firstEntry?: number, lastEntry?: number) {
    return this.executeWorkflow('list_all_branches', {
      first_entry: firstEntry,
      last_entry: lastEntry,
    });
  }

  async addBranch(branchData: {
    address: string;
    city: string;
    'default-template-name': string;
    'default-template-id': string;
    duration: number;
    name: string;
    organization_id: string;
    isActive?: boolean;
  }) {
    return this.executeWorkflow('add_branch_api', branchData);
  }

  async signNewUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    password: string;
  }) {
    return this.executeWorkflow('sign_new_user', userData);
  }
}
