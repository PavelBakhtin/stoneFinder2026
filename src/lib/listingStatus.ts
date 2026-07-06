export const listingStatusMap = {
  ACTIVE: {
    label: "🟢 Активне",
    className: "bg-green-100 text-green-700",
  },
  RESERVED: {
    label: "🟡 Заброньовано",
    className: "bg-yellow-100 text-yellow-700",
  },
  SOLD: {
    label: "⚫ Продано",
    className: "bg-gray-200 text-gray-700",
  },
} as const;
