import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return await generatePageMetadata("Purchases");
}

export default function PurchasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}