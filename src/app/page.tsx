import { HomePage } from "@/components/pages/HomePage";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    q?: string;
    material?: string;
    city?: string;
    sort?: string;
  }>;
};

export default function Page({ searchParams }: Props) {
  return <HomePage searchParams={searchParams} />;
}
