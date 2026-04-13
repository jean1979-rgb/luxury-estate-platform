export const dynamic = "force-dynamic";
import PublicExperienceForm from "@/components/admin/PublicExperienceForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <PublicExperienceForm id={id} />;
}
