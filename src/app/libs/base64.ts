export function encodeToBase64(data: string) {
  return btoa(encodeURIComponent(data));
}

export function decodeFromBase64(encodedData: string) {
  return decodeURIComponent(atob(encodedData));
}
