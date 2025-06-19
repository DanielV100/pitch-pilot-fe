const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = new Error(path);
    (err as any).status = res.status;
    throw err;
  }
  return res.headers.get("content-type")?.includes("json")
    ? (res.json() as Promise<T>)
    : (undefined as unknown as T);
}
