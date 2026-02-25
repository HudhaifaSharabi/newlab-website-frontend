import { EquipmentPageResponse } from '@/types/api';
import EquipmentDetailClient from '@/components/equipment/EquipmentDetailClient';
import { notFound } from 'next/navigation';

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

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const data = await getEquipmentData();
  
  if (!data) {
    return notFound();
  }

  const device = data.find(e => e.id === params.id || String(e.id) === String(params.id));

  if (!device) {
    return notFound();
  }

  return <EquipmentDetailClient device={device} />;
}
