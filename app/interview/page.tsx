import InterviewHub from "@/components/InterviewHub";

export default function InterviewPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">
        Cryptography Interview Hub
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Practice cryptography interview questions through flashcards,
        MCQs and real-world security scenarios.
      </p>

      <InterviewHub />
    </main>
  );
}
