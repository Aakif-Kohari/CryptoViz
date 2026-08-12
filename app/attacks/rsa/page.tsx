import type { Metadata } from "next";
import RsaAttackPlayground from "../../../components/attacks/RsaAttackPlayground";

export const metadata: Metadata = {
  title: "RSA Attack Playground | CryptoViz",
  description:
    "Educational RSA attack playground for Fermat factorization, Wiener's attack, common modulus, and Håstad broadcast attack using teaching-size numbers.",
};

export default function RsaAttackPlaygroundPage() {
  return <RsaAttackPlayground />;
}
