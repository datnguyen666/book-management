import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getBook, getBooks, type GetBooksParams } from "@/api/book.api";

export function useBooks(params: GetBooksParams) {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => getBooks(params),
    placeholderData: keepPreviousData,
  });
}

export function useBook(id: number) {
  return useQuery({
    queryKey: ["books", id],
    queryFn: () => getBook(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
