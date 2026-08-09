import Link from "next/link";

export type ListingTypeFilter = "" | "OFFER" | "WANTED";

type Props = {
  basePath: string;
  activeType: ListingTypeFilter;
  allCount: number;
  offerCount: number;
  wantedCount: number;
};

export function ListingTypeTabs({
  basePath,
  activeType,
  allCount,
  offerCount,
  wantedCount,
}: Props) {
  const items: Array<{
    value: ListingTypeFilter;
    label: string;
    count: number;
    activeClass: string;
  }> = [
    {
      value: "",
      label: "Всі",
      count: allCount,
      activeClass: "bg-black text-white",
    },
    {
      value: "OFFER",
      label: "Пропоную",
      count: offerCount,
      activeClass: "bg-green-600 text-white",
    },
    {
      value: "WANTED",
      label: "Шукаю",
      count: wantedCount,
      activeClass: "bg-orange-500 text-white",
    },
  ];

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-gray-300 bg-white">
      {items.map((item, index) => {
        const active = activeType === item.value;
        const typeParam =
          item.value === "OFFER"
            ? "offer"
            : item.value === "WANTED"
              ? "wanted"
              : "";

        const href = typeParam
          ? `${basePath}?type=${typeParam}`
          : basePath;

        return (
          <Link
            key={item.value || "all"}
            href={href}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={[
              "flex min-w-0 items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm",
              index > 0 ? "border-l border-gray-300" : "",
              active
                ? item.activeClass
                : "bg-white text-gray-800 hover:bg-gray-50",
            ].join(" ")}
          >
            <span className="truncate">{item.label}</span>
            <span
              className={[
                "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] leading-none sm:text-xs",
                active ? "bg-white/20" : "bg-gray-100 text-gray-500",
              ].join(" ")}
            >
              {item.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
