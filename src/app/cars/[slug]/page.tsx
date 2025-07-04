import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { notFound } from 'next/navigation';
import CarClient from './CarClient';
import '../CarGallery.css';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const docRef = doc(db, 'cars', slug);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return { title: 'Anunț inexistent' };
  }
  const car = docSnap.data();
  return { title: `${car.marca} ${car.model} - ${car.an}` };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const docRef = doc(db, 'cars', slug);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    notFound();
  }
  const car = JSON.parse(JSON.stringify(docSnap.data()));
  return <CarClient car={car} />;
} 