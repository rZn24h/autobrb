import { Metadata } from "next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { notFound } from "next/navigation";
import RentalClient from "./RentalClient";
import "../../cars/CarGallery.css";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const docRef = doc(db, "rentals", slug);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return { title: "Anunț inexistent" };
  }
  const rental = docSnap.data();
  return { title: `${rental.marca} ${rental.model} - Închiriere` };
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const docRef = doc(db, "rentals", slug);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    notFound();
  }
  const rental = { id: docSnap.id, ...docSnap.data() } as any;
  return <RentalClient rental={rental} />;
}
