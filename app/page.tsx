import { Dashboard } from "@/components/dashboard";
import { getDashboard } from "@/lib/db";

export const dynamic = "force-dynamic";
export default function Home() { return <Dashboard initialData={getDashboard()} />; }
