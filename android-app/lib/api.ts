export const API_BASE_URL = "https://iran-classifieds.vercel.app";
export type Listing = {
  id: number | string;
  title: string;
  description?: string;
  price_toman?: number | string | null;
  city?: string;
  category?: string;
  image_urls?: string[] | null;
  is_featured?: boolean;
};
export async function getListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/api/listings`);
  if (!response.ok) throw new Error("دریافت آگهی‌ها ناموفق بود.");
  const data = await response.json();
  return Array.isArray(data.listings) ? data.listings : [];
}
