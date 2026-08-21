import { useState, useEffect } from 'react';
import { WardItem } from '../../../pages/create-club/ui/components/WardPickerModal';

// Module-level in-memory cache mapped by provinceCode
const wardsCache = new Map<number, WardItem[]>();

export function useWards(provinceCode: number | null) {
  const [wards, setWards] = useState<WardItem[]>(() => {
    if (provinceCode && wardsCache.has(provinceCode)) {
      return wardsCache.get(provinceCode)!;
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      setLoading(false);
      return;
    }

    if (wardsCache.has(provinceCode)) {
      setWards(wardsCache.get(provinceCode)!);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchWards = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`
        );
        if (response.ok) {
          const data = await response.json();
          const wardsList: WardItem[] = data.wards || [];
          wardsCache.set(provinceCode, wardsList);
          if (isMounted) {
            setWards(wardsList);
          }
        } else {
          throw new Error(`Failed to fetch wards: ${response.status}`);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Lỗi tải danh sách quận huyện');
          console.error('Lỗi tải danh sách quận huyện:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWards();

    return () => {
      isMounted = false;
    };
  }, [provinceCode]);

  return { wards, loading, error };
}
