import { HomePage } from "@/components/pages/HomePage";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    q?: string;
    material?: string;
    city?: string;
    sort?: string;
    lengthFrom?: string;
    lengthTo?: string;
    widthFrom?: string;
    widthTo?: string;
    listingType?: string;
  }>;
};

export default async function Page(props: Props) {
  return <HomePage searchParams={props.searchParams} />;
}