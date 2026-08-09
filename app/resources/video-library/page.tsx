import type { Metadata } from "next"
import CryptographyVideoLibrary from "../../../components/resources/CryptographyVideoLibrary"

export const metadata: Metadata = {
  title: "Curated Cryptography Video Library | CryptoViz",
  description:
    "Responsive curated cryptography video library with tags, topics, difficulty filters, embedded previews, and learning recommendations.",
}

export default function CryptographyVideoLibraryPage() {
  return <CryptographyVideoLibrary />
}
