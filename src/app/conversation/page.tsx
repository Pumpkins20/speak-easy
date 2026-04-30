import ConversationClient from "@/components/conversation/ConversationClient";
import { buildConversationScreenModel } from "@/services/conversationService";

export default async function ConversationPage() {
  const model = await buildConversationScreenModel();

  return <ConversationClient model={model} />;
}
