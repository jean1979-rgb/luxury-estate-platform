export const dynamic = "force-dynamic";
import AdminClient from "@/app/admin/AdminClient";

export const revalidate = 0;

type StudioPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BrokerStudioPage({ params }: StudioPageProps) {
  const { id } = await params;

  return <AdminClient forcedPropertyId={id} />;
}
