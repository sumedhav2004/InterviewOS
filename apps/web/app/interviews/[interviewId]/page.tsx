import { InterviewPage } from "@/features/interview/components/interview-page";


type InterviewRouteProps = {
  params: Promise<{
    interviewId: string;
  }>;
};

export default async function InterviewRoute({
  params,
}: InterviewRouteProps) {
  const { interviewId } = await params;

  return <InterviewPage interviewId={interviewId} />;
}