import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return await generatePageMetadata("Admin");
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}