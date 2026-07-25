// Shared TypeScript types for the backend

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse {
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
}
