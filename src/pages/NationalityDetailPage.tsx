import { useParams } from 'react-router-dom';
import { nationalitiesData } from '@/data/nationalitiesData';
import { NationalityDetailLayout } from '@/components/nationality/NationalityDetailLayout';

export default function NationalityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nationality = id ? nationalitiesData[id] : null;

  return <NationalityDetailLayout nationality={nationality} />;
}
