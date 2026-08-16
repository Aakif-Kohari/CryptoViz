$ErrorActionPreference = "Stop"

$file = "components/cipher-sandbox/CipherSandbox.tsx"
if (-not (Test-Path $file)) {
  throw "Run this script from the CryptoViz repository root."
}

$content = Get-Content $file -Raw

$replacements = @(
  @{
    Old = @'
                        <button
                          onClick={() => handleMoveStage(idx, 'up')}
                          disabled={idx === 0}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
'@
    New = @'
                        <button
                          onClick={() => handleMoveStage(idx, 'up')}
                          disabled={idx === 0}
                          aria-label="Move stage up"
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
'@
  },
  @{
    Old = @'
                        <button
                          onClick={() => handleMoveStage(idx, 'down')}
                          disabled={idx === stages.length - 1}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
'@
    New = @'
                        <button
                          onClick={() => handleMoveStage(idx, 'down')}
                          disabled={idx === stages.length - 1}
                          aria-label="Move stage down"
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
'@
  },
  @{
    Old = @'
                        <button
                          onClick={() => handleRemoveStage(idx)}
                          className="rounded p-1 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/50"
'@
    New = @'
                        <button
                          onClick={() => handleRemoveStage(idx)}
                          aria-label={`Remove stage ${idx + 1}`}
                          className="rounded p-1 text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/50"
'@
  },
  @{
    Old = @'
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.output)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-300"
'@
    New = @'
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.output)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    aria-label="Copy output"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-300"
'@
  },
  @{
    Old = @'
                  <select
                    onChange={(e) => {
'@
    New = @'
                  <select
                    aria-label="Add stage"
                    onChange={(e) => {
'@
  },
  @{
    Old = @'
               <input
                 type="number"
                 min={1}
                 max={10}
'@
    New = @'
               <input
                 type="number"
                 aria-label="Number of rounds"
                 min={1}
                 max={10}
'@
  },
  @{
    Old = @'
                        <input
                          type="checkbox"
                          checked={stage.enabled}
'@
    New = @'
                        <input
                          type="checkbox"
                          aria-label={`Enable stage ${idx + 1}`}
                          checked={stage.enabled}
'@
  },
  @{
    Old = @'
          <button
            onClick={() => setDirection(direction === 'encrypt' ? 'decrypt' : 'encrypt')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
'@
    New = @'
          <button
            onClick={() => setDirection(direction === 'encrypt' ? 'decrypt' : 'encrypt')}
            aria-label={`Switch to ${direction === 'encrypt' ? 'decryption' : 'encryption'} mode`}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
'@
  },
  @{
    Old = @'
              <button
                onClick={() => setActiveTab('trace')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
'@
    New = @'
              <button
                onClick={() => setActiveTab('trace')}
                aria-label="Show step trace"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
'@
  },
  @{
    Old = @'
              <button
                onClick={() => setActiveTab('metrics')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
'@
    New = @'
              <button
                onClick={() => setActiveTab('metrics')}
                aria-label="Show security metrics"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
'@
  },
  @{
    Old = @'
              <button
                onClick={() => setActiveTab('export')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
'@
    New = @'
              <button
                onClick={() => setActiveTab('export')}
                aria-label="Show export and import"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
'@
  },
  @{
    Old = @'
                  <button
                    onClick={handleExportJson}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-all"
'@
    New = @'
                  <button
                    onClick={handleExportJson}
                    aria-label="Copy pipeline JSON"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-all"
'@
  }
)

foreach ($r in $replacements) {
  if (-not $content.Contains($r.Old)) {
    throw "Expected source fragment was not found. Refusing a partial edit."
  }
  $content = $content.Replace($r.Old, $r.New)
}

Set-Content -Path $file -Value $content -NoNewline
Write-Host "CryptoViz #900 accessibility changes applied successfully."
