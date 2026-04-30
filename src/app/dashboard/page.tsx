import DashboardPage from "@/components/dashboard/DashboardPage";
import { buildDashboardViewModel } from "@/services/conversationService";

export default async function DashboardRoutePage() {
  const model = await buildDashboardViewModel();

  return <DashboardPage model={model} />;
}
