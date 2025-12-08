import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { authService } from "../../services/authService";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface Report {
  id: string;
  name: string;
}

interface ScanRequest {
  workspaceIds: string[];
  reportIds: string[];
}

interface ScanResponse {
  // Add response structure based on your API response
  message?: string;
  data?: any;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4567";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = authService.getStoredToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Workspace"],
  endpoints: (builder) => ({
    // Workspace endpoints
    getWorkspaces: builder.query<Workspace[], void>({
      query: () => "/workspaces",
      providesTags: ["Workspace"],
    }),

    // Reports endpoint - depends on workspace selection
    getReportsByWorkspace: builder.query<Report[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/reports`,
      providesTags: ["Workspace"],
    }),

    // Scan mutation - POST request
    scanForWidgets: builder.mutation<ScanResponse, ScanRequest>({
      query: (scanData) => ({
        url: "/scan",
        method: "POST",
        body: scanData,
      }),
    }),

    // Query example - GET request
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["User"],
    }),

    // Query example - GET single user
    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: ["User"],
    }),

    // Mutation example - POST request
    createUser: builder.mutation<User, Partial<User>>({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),

    // Mutation example - PUT request
    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Mutation example - DELETE request
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetReportsByWorkspaceQuery,
  useLazyGetReportsByWorkspaceQuery,
  useScanForWidgetsMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;
