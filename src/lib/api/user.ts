import { CurrentUser } from "@/types/user";
import { request } from "./core";

export async function fetchCurrentUser() {
  return request<CurrentUser>("/v1/user/get-captain", {
    credentials: "include",
  });
}
