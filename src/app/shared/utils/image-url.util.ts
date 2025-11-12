import { environment } from "../../../env/env";
export function profileImageUrl(image: string | null | undefined, profileBaseUrl: string, fallback: string = '/assets/avatar.png'): string {
  if (!image) return fallback;

  let imagePath = image.replace(/^https?:\/\/[^/]+/, '');

  if (!imagePath.startsWith('/')) {
    return profileBaseUrl + imagePath;
  }

  if (imagePath.startsWith('/uploads/profile/')) {
    return environment.localUrl + imagePath;
  }

  return profileBaseUrl + imagePath;
}

export function coverImageUrl(image: string | null | undefined, coverBaseUrl: string, fallback: string = ''): string {
  if (!image) return fallback;

  let imagePath = image.replace(/^https?:\/\/[^/]+/, '');

  if (!imagePath.startsWith('/')) {
    return coverBaseUrl + imagePath;
  }

  if (imagePath.startsWith('/uploads/cover/')) {
    return environment.localUrl + imagePath;
  }

  return coverBaseUrl + imagePath;
}
