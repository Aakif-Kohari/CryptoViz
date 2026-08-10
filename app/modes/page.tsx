import ModesLab from "@/components/modes/ModesLab";
import EcbPenguin from "@/components/modes/EcbPenguin";
import Footer from "@/components/layout/footer";
import LearnPageTemplate from "@/components/layout/LearnPageTemplate";

export const metadata = {
  title: "Block Cipher Modes Lab — CryptoViz",
  description:
    "Compare AES modes of operation side by side — ECB, CBC, CTR, CFB, and OFB — and watch how a single one-byte plaintext change propagates through each, plus the classic ECB penguin.",
};

export default function ModesPage() {
  return (
    <>
      <LearnPageTemplate
        breadcrumbs={[
          { label: "Learn" },
          { label: "Block Cipher Modes" },
        ]}
        eyebrow="Interactive learning lab"
        title="Block Cipher Modes Lab"
        description="A block cipher like AES only knows how to transform one 16-byte block. A mode of operation decides how to chain those blocks into a full message — and that choice is where most real-world crypto goes right or wrong. Flip a single plaintext byte below and watch how far the damage spreads under each mode, then see why you should never encrypt an image with ECB."
      >
        <section aria-label="Block cipher modes experiment">
          <ModesLab />
        </section>

        <section
          aria-label="ECB penguin demonstration"
          className="mt-10"
        >
          <EcbPenguin />
        </section>
      </LearnPageTemplate>

      <Footer />
    </>
  );
}