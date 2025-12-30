import axios, { AxiosInstance, AxiosError } from 'axios';

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId: string;
}

class ApiClient {
  private authService: AxiosInstance;
  private communicationService: AxiosInstance;
  private expenseService: AxiosInstance;
  private feeService: AxiosInstance;

  constructor() {
    this.authService = axios.create({
      baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3004/api/v1',
    });

    this.communicationService = axios.create({
      baseURL: process.env.NEXT_PUBLIC_COMMUNICATION_SERVICE_URL || 'http://localhost:3001/api/v1',
    });

    this.expenseService = axios.create({
      baseURL: process.env.NEXT_PUBLIC_EXPENSE_SERVICE_URL || 'http://localhost:3002/api/v1',
    });

    this.feeService = axios.create({
      baseURL: process.env.NEXT_PUBLIC_FEE_SERVICE_URL || 'http://localhost:3003/api/v1',
    });

    // Add interceptors for token management
    [this.authService, this.communicationService, this.expenseService, this.feeService].forEach(service => {
      service.interceptors.request.use((config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

      service.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          if (error.response?.status === 401) {
            this.clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
          return Promise.reject(error);
        }
      );
    });
  }

  // Auth methods
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Authentication APIs
  async login(email: string, password: string) {
    const response = await this.authService.post('/auth/login', { email, password });
    const { token, user } = response.data;
    this.setToken(token);
    this.setCurrentUser(user);
    return response.data;
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; schoolId: string; role: string }) {
    const response = await this.authService.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    this.clearAuth();
  }

  // Communication APIs
  async getNotifications(params?: { userId?: string; schoolId?: string; limit?: number }) {
    const response = await this.communicationService.get('/notifications', { params });
    return response.data;
  }

  async createNotification(data: any) {
    const response = await this.communicationService.post('/notifications', data);
    return response.data;
  }

  async markNotificationRead(id: string) {
    const response = await this.communicationService.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async getAnnouncements(params?: { schoolId?: string; limit?: number }) {
    const response = await this.communicationService.get('/announcements', { params });
    return response.data;
  }

  async createAnnouncement(data: any) {
    const response = await this.communicationService.post('/announcements', data);
    return response.data;
  }

  async publishAnnouncement(id: string) {
    const response = await this.communicationService.patch(`/announcements/${id}/publish`);
    return response.data;
  }

  // Expense APIs
  async getExpenses(params?: { schoolId?: string; categoryId?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) {
    const response = await this.expenseService.get('/expenses', { params });
    return response.data;
  }

  async getExpense(id: string) {
    const response = await this.expenseService.get(`/expenses/${id}`);
    return response.data;
  }

  async createExpense(data: any) {
    const response = await this.expenseService.post('/expenses', data);
    return response.data;
  }

  async updateExpense(id: string, data: any) {
    const response = await this.expenseService.put(`/expenses/${id}`, data);
    return response.data;
  }

  async deleteExpense(id: string) {
    const response = await this.expenseService.delete(`/expenses/${id}`);
    return response.data;
  }

  async getExpenseCategories(schoolId: string) {
    const response = await this.expenseService.get('/expense-categories', { params: { schoolId } });
    return response.data;
  }

  async createExpenseCategory(data: any) {
    const response = await this.expenseService.post('/expense-categories', data);
    return response.data;
  }

  async getExpenseSummary(params: { schoolId: string; startDate?: string; endDate?: string }) {
    const response = await this.expenseService.get('/expenses/reports/summary', { params });
    return response.data;
  }

  // Fee APIs
  async getInvoices(params?: { schoolId?: string; studentId?: string; status?: string; limit?: number; offset?: number }) {
    const response = await this.feeService.get('/invoices', { params });
    return response.data;
  }

  async getInvoice(id: string) {
    const response = await this.feeService.get(`/invoices/${id}`);
    return response.data;
  }

  async createInvoice(data: any) {
    const response = await this.feeService.post('/invoices', data);
    return response.data;
  }

  async updateInvoice(id: string, data: any) {
    const response = await this.feeService.put(`/invoices/${id}`, data);
    return response.data;
  }

  async deleteInvoice(id: string) {
    const response = await this.feeService.delete(`/invoices/${id}`);
    return response.data;
  }

  async getPayments(params?: { invoiceId?: string; status?: string; limit?: number; offset?: number }) {
    const response = await this.feeService.get('/payments', { params });
    return response.data;
  }

  async createPayment(data: any) {
    const response = await this.feeService.post('/payments', data);
    return response.data;
  }

  async getReceipts(params?: { paymentId?: string; limit?: number; offset?: number }) {
    const response = await this.feeService.get('/receipts', { params });
    return response.data;
  }

  async getReceipt(id: string) {
    const response = await this.feeService.get(`/receipts/${id}`);
    return response.data;
  }

  async downloadReceipt(id: string) {
    const response = await this.feeService.get(`/receipts/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
