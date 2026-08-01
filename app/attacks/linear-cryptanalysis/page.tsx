import type { Metadata } from "next"
import LinearCryptanalysisDemo from "../../../components/attacks/LinearCryptanalysisDemo"

export const metadata: Metadata = {
  title: "Linear Cryptanalysis Demo | CryptoViz",
  description:
    "Interactive linear cryptanalysis demo showing toy-cipher linear approximations, parity masks, probability, and bias.",
}

export default function LinearCryptanalysisDemoPage() {
  return <LinearCryptanalysisDemo />
}
