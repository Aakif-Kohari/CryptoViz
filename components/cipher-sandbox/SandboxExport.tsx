import TraceTransferControls from '../cipher/TraceTransferControls'
import type { CipherTraceFile } from '../../lib/utils/cipherTrace'
import type { CipherResult } from '../../lib/cipher/types'

interface SandboxExportProps {
  cipherId: string
  direction: "encrypt" | "decrypt"
  input: string
  cipherKey: string
  options: Record<string, unknown>
  result: CipherResult | null
  onImport: (trace: CipherTraceFile) => void
}

export default function SandboxExport({
  cipherId,
  direction,
  input,
  cipherKey,
  options,
  result,
  onImport,
}: SandboxExportProps) {
  return (
    <TraceTransferControls
      cipherId={cipherId}
      direction={direction}
      input={input}
      cipherKey={cipherKey}
      options={options}
      result={result}
      onImport={onImport}
    />
  )
}
