import { headers } from "next/headers";

export type Device = "mobile" | "desktop";

export async function getDevice(): Promise<Device> {
  const headersList = await headers();

  // Client Hints (найточніший метод)
  const isMobileHint = headersList.get("sec-ch-ua-mobile");
  if (isMobileHint === "?1") return "mobile";
  if (isMobileHint === "?0") return "desktop";

  // Fallback на User-Agent
  const ua = headersList.get("user-agent") || "";
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(ua);

  return isMobileUa ? "mobile" : "desktop";
}
