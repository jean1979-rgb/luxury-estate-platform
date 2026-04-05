import PublicPartnerForm from "@/components/admin/PublicPartnerForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <PublicPartnerForm id={id} />;
}
