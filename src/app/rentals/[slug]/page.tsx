import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { notFound } from 'next/navigation';
import RentalClient from '@/app/rentals/[slug]/RentalClient';
import '@/app/cars/CarGallery.css';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const docRef = doc(db, 'rentals', slug);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return { title: 'Anunț inexistent' };
  }
  const rental = docSnap.data();
  return { title: `${rental.marca} ${rental.model} - Închiriere` };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const docRef = doc(db, 'rentals', slug);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    notFound();
  }
  // Serializează datele pentru a elimina obiectele complexe Firestore
  const rentalData = docSnap.data();
  const rental = JSON.parse(JSON.stringify({ id: docSnap.id, ...rentalData }));
  return <RentalClient rental={rental} />;
} 