import { AiAdvisorChat } from "@/components/AiAdvisorChat";

export default function AdvisorPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--app-header)-var(--app-mobile-nav)-2rem)] max-w-3xl flex-col px-3 py-3 sm:px-4 sm:py-8 md:min-h-0">
      <AiAdvisorChat />
    </div>
  );
}
