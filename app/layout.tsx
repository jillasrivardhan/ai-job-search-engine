import "./styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "10x Job Hunter", description: "Find jobs that match your resume." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
