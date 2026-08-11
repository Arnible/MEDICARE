import { ApiResponse } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export class ApiClient {
  static async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    return this.handleResponse<T>(response)
  }

  static async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  static async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  static async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  static async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    return this.handleResponse<T>(response)
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type")

    if (!response.ok) {
      let errorData: any

      if (contentType?.includes("application/json")) {
        errorData = await response.json()
      } else {
        errorData = await response.text()
      }

      throw {
        status: response.status,
        message: errorData?.message || errorData || "An error occurred",
        data: errorData,
      }
    }

    if (!contentType?.includes("application/json")) {
      return {} as T
    }

    return response.json()
  }
}

export async function apiCall<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const result = await ApiClient[method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete"]<T>(
      endpoint,
      data
    )
    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred",
      error: error.message,
    }
  }
}
