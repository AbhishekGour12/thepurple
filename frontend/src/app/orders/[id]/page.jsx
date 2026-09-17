import { redirect } from 'next/navigation';

export default function OrderByIdPage({ params }) {
  const id = params?.id || '';
  redirect(`/my-orders/${id}`);
}

