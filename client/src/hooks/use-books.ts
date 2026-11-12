import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getBook,
  getBooks,
  getBookAuthors,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCover,
  type CreateBookPayload,
  type UpdateBookPayload,
  type GetBooksParams,
} from "@/api/book.api";

export function useBooks(params: GetBooksParams) {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => getBooks(params),
    placeholderData: keepPreviousData,
  });
}

export function useBookAuthors() {
  return useQuery({
    queryKey: ["books", "authors"],
    queryFn: getBookAuthors,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBook(id: number) {
  return useQuery({
    queryKey: ["books", id],
    queryFn: () => getBook(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookPayload) => createBook(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "summary"],
      });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBookPayload }) =>
      updateBook(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });

      queryClient.invalidateQueries({
        queryKey: ["book", variables.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard", "summary"],
      });
    },
  });
}

export function useUploadBookCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadBookCover(id, file),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });

      queryClient.invalidateQueries({
        queryKey: ["book", variables.id],
      });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBook(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["books"],
      });

      queryClient.removeQueries({
        queryKey: ["books", id],
      });
    },
  });
}
