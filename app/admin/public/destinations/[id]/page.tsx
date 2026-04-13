export const dynamic = "force-dynamic";
import PublicDestinationForm from "@/components/admin/PublicDestinationForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditDestinationPage({ params }: Props) {
  const { id } = await params;
  return <PublicDestinationForm id={id} />;
}
