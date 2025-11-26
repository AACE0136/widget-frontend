import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface User {
  id: number;
  name: string;
  email: string;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
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
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;
