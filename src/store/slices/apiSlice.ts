import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
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

interface ScanSummaryItem {
  Workspace_Name: string;
  Workspace_ID: string;
  Report_Name: string;
  Report_ID: string;
  "External_Widgets_(Y/N)": string;
  External_Widgets_Count: number;
  Report_Owners: string;
}

interface ScanDetailItem {
  Workspace_Name: string;
  Workspace_ID: string;
  Report_Name: string;
  Report_ID: string;
  Installed_Widgets: string;
  Installed_Widgets_Short: string;
  Is_used: string;
  "Custom Visual": string;
  Publisher: string;
  Description: string;
  Version: string;
  LegalTerms: string;
  PrivacyPolicyUrl: string;
  SupportLink: string;
  "Release Date": string;
  "AppSource Link": string;
  "Is Certified": string;
  "Versioned pbiviz": string;
  "Visual GUID": string;
}

interface ScanResponse {
  summary: ScanSummaryItem[];
  details: ScanDetailItem[];
  emailPreview: string;
  excelFileId: string;
}

export type { ScanResponse, ScanSummaryItem, ScanDetailItem };

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4567";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = authService.getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log("401 error in RTK Query - attempting token refresh...");

    // Try to refresh the token
    const refreshToken = localStorage.getItem("backend_refresh_token");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          // Store new tokens
          if (data.access_token) {
            localStorage.setItem("backend_token", data.access_token);
          }
          if (data.refresh_token) {
            localStorage.setItem("backend_refresh_token", data.refresh_token);
          }
          if (data.expiresIn) {
            const expiryTime = Date.now() + data.expiresIn * 1000;
            localStorage.setItem("backend_token_expiry", expiryTime.toString());
          }

          console.log("Token refreshed successfully, retrying request...");

          // Retry the original request with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          console.error("Token refresh failed");
          authService.clearTokens();
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
        authService.clearTokens();
        window.location.href = "/";
      }
    } else {
      console.error("No refresh token available");
      authService.clearTokens();
      window.location.href = "/";
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
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

    // Download Excel file
    downloadExcel: builder.query<Blob, string>({
      query: (fileId) => ({
        url: `/download?file_path=${fileId}`,
        responseHandler: (response) => response.blob(),
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
  useLazyDownloadExcelQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;
