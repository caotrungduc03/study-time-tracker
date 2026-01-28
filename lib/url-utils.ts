import { envConfig } from "@/config/envConfig";

/**
 * Trả về đường dẫn asset public có thêm NEXT_PUBLIC_ASSETS_PATH ở đầu.
 *
 * @param path Đường dẫn asset (có thể có hoặc không có dấu / ở đầu)
 * @returns Đường dẫn đã thêm NEXT_PUBLIC_ASSETS_PATH (nếu có), ví dụ: '/my-base/images/logo.png'
 *
 * Ví dụ:
 *   process.env.NEXT_PUBLIC_ASSETS_PATH = '/my-base'
 *   getAssetPath('/images/logo.png') // '/my-base/images/logo.png'
 *   getAssetPath('images/logo.png')  // '/my-base/images/logo.png'
 *   Nếu NEXT_PUBLIC_ASSETS_PATH là '/', kết quả sẽ là '/images/logo.png'
 */
export function getAssetPath(path: string): string {
  const basePath = envConfig.NODE_ENV === "production" ? envConfig.ASSETS_PATH : "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}
