export interface InterviewQuestion {
  id: number;
  type: "mcq" | "flashcard" | "scenario";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  reference: string;
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "Which algorithm is a symmetric block cipher?",
    options: ["RSA", "AES", "ECC", "DSA"],
    answer: "AES",
    explanation:
      "AES is a symmetric block cipher standardized in FIPS 197.",
    reference: "FIPS 197",
  },
  {
    id: 2,
    type: "flashcard",
    question: "What does TLS stand for?",
    answer: "Transport Layer Security",
    explanation:
      "TLS protects communication between clients and servers.",
    reference: "RFC 8446",
  },
  {
    id: 3,
    type: "scenario",
    question:
      "Your company needs secure communication with forward secrecy. Which protocol should you recommend?",
    answer: "TLS 1.3",
    explanation:
      "TLS 1.3 uses ephemeral key exchange to provide forward secrecy.",
    reference: "RFC 8446",
  },
];