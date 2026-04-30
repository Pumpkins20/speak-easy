import LandingPage from "@/components/landing/LandingPage";
import { buildLandingViewModel } from "@/services/conversationService";

export default async function HomePage() {
  const model = await buildLandingViewModel();

  return <LandingPage model={model} />;
}
