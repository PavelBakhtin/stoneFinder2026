import { HomePage } from "@/components/pages/HomePage";

type Props = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default function Page({ searchParams }: Props) {
  return <HomePage searchParams={searchParams} />;
}
