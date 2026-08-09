import type { Metadata } from 'next';
import WorkspaceLayout from '../../../components/layout/WorkspaceLayout';
import FrodoKemVisualizer from '../../../components/cipher/FrodoKemVisualizer';
import LearningProgressionFooter from '../../../components/learning/LearningProgressionFooter';

export const metadata: Metadata = {
  title: 'FrodoKEM Post-Quantum KEM Visualizer | CryptoViz',
  description:
    'Interactive matrix-based Learning With Errors (LWE) post-quantum key encapsulation mechanism visualizer and comparison with ML-KEM (Kyber).',
};

export default function FrodoKemVisualizerPage() {
  return (
    <WorkspaceLayout activeCipherId="frodokem">
      <div className="min-w-0 flex-1 bg-white p-4 dark:bg-zinc-900/10 md:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <FrodoKemVisualizer />
          <LearningProgressionFooter cipherId="frodokem" context="visualizer" />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
