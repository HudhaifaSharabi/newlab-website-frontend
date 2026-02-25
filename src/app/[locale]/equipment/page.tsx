import { EquipmentPageResponse } from '@/types/api';
import EquipmentClient from '@/components/equipment/EquipmentClient';

async function getEquipmentData(): Promise<EquipmentPageResponse['message']['message']['equipment'] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const res = await fetch(`${apiUrl}/api/method/newlab_site.api.get_lab_equipment`, {
      next: { revalidate: 60 } // Revalidate every minute
    });

    if (!res.ok) {
      console.error("Failed to fetch equipment data");
      return null;
    }
    const data = await res.json();
    return data.message.message.equipment;
  } catch (error) {
    console.error("Error fetching equipment data:", error);
    return null;
  }
}

export default async function EquipmentGalleryPage() {
  const data = await getEquipmentData();
  
  return (
    <EquipmentClient initialEquipment={data || []} />
  );
}
