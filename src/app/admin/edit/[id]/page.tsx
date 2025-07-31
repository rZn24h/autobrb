import { Metadata } from "next";
import EditClient from "./EditClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Editare anunț",
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EditClient carId={id} />;
}
