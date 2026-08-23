import { useState, useEffect } from 'react';
import { ProvinceItem } from '../../../pages/create-club/ui/components/ProvincePickerModal';

let cachedProvinces: ProvinceItem[] | null = null;

export function useProvinces() {
  const [provinces, setProvinces] = useState<ProvinceItem[]>(cachedProvinces || []);
  const [loading, setLoading] = useState<boolean>(!cachedProvinces);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedProvinces && cachedProvinces.length > 0) {
      setProvinces(cachedProvinces);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchProvinces = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
        if (response.ok) {
          const data: ProvinceItem[] = await response.json();
          cachedProvinces = data;
          if (isMounted) {
            setProvinces(data);
          }
        } else {
          throw new Error(`Failed to fetch provinces: ${response.status}`);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Lỗi tải danh sách tỉnh thành');
          console.error('Lỗi tải danh sách tỉnh thành trong bộ lọc:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  return { provinces, loading, error };
}
