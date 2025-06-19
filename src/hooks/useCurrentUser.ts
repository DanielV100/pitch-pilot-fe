"use client";
import { fetchCurrentUser } from "@/lib/api/user";
import { CurrentUser } from "@/types/user";
import useSWR from "swr";

export function useCurrentUser() {
  const { data, error, isLoading } = useSWR<CurrentUser>(
    "currentUser",
    fetchCurrentUser,
    { revalidateOnFocus: false }
  );

  return {
    user: data,
    isLoading,
    isError: !!error,
  };
}
