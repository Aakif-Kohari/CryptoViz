import { OfflinePack } from './types';

/**
 * Generates a structured JSON string representation of an offline learning pack.
 */
export function exportPackAsJson(pack: OfflinePack): string {
  const exportPayload = {
    metadata: {
      id: pack.id,
      title: pack.title,
      description: pack.description,
      category: pack.category,
      difficulty: pack.difficulty,
      version: pack.version,
      exportedAt: new Date().toISOString(),
      generator: 'CryptoViz Offline Learning Pack Engine v1.0',
    },
    topics: pack.topics,
    documentation: pack.docItems,
    ciphers: pack.cipherItems,
    referenceCode: {
      caesar: `
function caesarCipher(str, shift, decrypt = false) {
  const s = decrypt ? (26 - (shift % 26)) % 26 : (shift % 26);
  return str.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + s) % 26) + base);
  });
}
`,
      vigenere: `
function vigenereCipher(text, key, decrypt = false) {
  let result = '';
  let keyIdx = 0;
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleanKey) return text;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char === char.toUpperCase();
      const base = isUpper ? 65 : 97;
      const textVal = char.toUpperCase().charCodeAt(0) - 65;
      const keyVal = cleanKey[keyIdx % cleanKey.length].charCodeAt(0) - 65;
      const shift = decrypt ? (26 - keyVal) % 26 : keyVal;
      const resVal = (textVal + shift) % 26;
      result += String.fromCharCode(resVal + base);
      keyIdx++;
    } else {
      result += char;
    }
  }
  return result;
}
`,
      sha256: `
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
`
    }
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Generates a full Markdown string representation of an offline learning pack.
 */
export function exportPackAsMarkdown(pack: OfflinePack): string {
  let md = `# ${pack.title}\n\n`;
  md += `> ${pack.description}\n\n`;
  md += `- **Category**: ${pack.category}\n`;
  md += `- **Difficulty**: ${pack.difficulty}\n`;
  md += `- **Version**: ${pack.version}\n`;
  md += `- **Export Date**: ${new Date().toLocaleDateString()}\n\n`;

  md += `## Topics Covered\n\n`;
  pack.topics.forEach(topic => {
    md += `- ${topic}\n`;
  });
  md += `\n`;

  md += `## Included Documentation & Formulas\n\n`;
  pack.docItems.forEach(doc => {
    md += `### ${doc.title}\n`;
    md += `**Slug**: \`${doc.slug}\`  \n`;
    md += `${doc.description}\n\n`;
  });

  md += `## Included Ciphers & Visualizers\n\n`;
  pack.cipherItems.forEach(cipher => {
    md += `### ${cipher.name} (\`${cipher.category}\`)\n`;
    md += `${cipher.description}\n\n`;
  });

  md += `## Offline Interactive Quick Reference & Code Snippets\n\n`;
  md += `\`\`\`javascript\n`;
  md += `// Caesar Cipher Standard Implementation\n`;
  md += `function caesarCipher(text, shift) {\n`;
  md += `  return text.replace(/[a-z]/gi, c => \n`;
  md += `    String.fromCharCode((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + shift) % 26 + (c <= 'Z' ? 65 : 97))\n`;
  md += `  );\n`;
  md += `}\n\n`;
  md += `// SHA-256 Async Browser Web Crypto API\n`;
  md += `async function hashSHA256(str) {\n`;
  md += `  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));\n`;
  md += `  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');\n`;
  md += `}\n`;
  md += `\`\`\`\n`;

  return md;
}

/**
 * Generates a self-contained, single-file standalone HTML document containing
 * CSS styling, complete documentation, formula reference cards, and an offline interactive JS cipher runner.
 */
export function exportPackAsSingleFileHtml(pack: OfflinePack): string {
  const jsonContent = exportPackAsJson(pack);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pack.title} - CryptoViz Standalone Offline Pack</title>
  <style>
    :root {
      --bg: #060816;
      --card-bg: #0d1127;
      --border: #1e293b;
      --accent: #14b8a6;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(20, 184, 166, 0.15);
      color: var(--accent);
      border: 1px solid rgba(20, 184, 166, 0.3);
      margin-right: 0.5rem;
    }
    h1 { font-size: 2rem; margin: 0.5rem 0; color: #fff; }
    p.desc { color: var(--text-muted); font-size: 1.1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
    }
    .card h3 { margin-top: 0; color: var(--accent); }
    .interactive-box {
      background: #111827;
      border: 1px solid #374151;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-top: 2rem;
    }
    label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #e2e8f0; }
    input, select, textarea {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border-radius: 0.375rem;
      border: 1px solid #4b5563;
      background: #1f2937;
      color: #fff;
      font-size: 0.95rem;
      margin-bottom: 1rem;
      box-sizing: border-box;
    }
    button {
      background: var(--accent);
      color: #000;
      font-weight: 700;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    button:hover { opacity: 0.9; }
    .output-box {
      background: #000;
      color: #34d399;
      font-family: monospace;
      padding: 1rem;
      border-radius: 0.375rem;
      word-break: break-all;
      min-height: 2.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <span class="badge">${pack.category.toUpperCase()}</span>
        <span class="badge">${pack.difficulty}</span>
        <span class="badge">OFFLINE VERIFIED</span>
      </div>
      <h1>${pack.title}</h1>
      <p class="desc">${pack.description}</p>
    </header>

    <section>
      <h2>Included Documentation Modules</h2>
      <div class="grid">
        ${pack.docItems.map(d => `
          <div class="card">
            <h3>${d.title}</h3>
            <p>${d.description}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <section>
      <h2>Interactive Standalone Offline Cipher Runner</h2>
      <div class="interactive-box">
        <label for="cipherSelect">Select Algorithm:</label>
        <select id="cipherSelect" onchange="updateCipherUI()">
          <option value="caesar">Caesar Cipher (Shift Substitution)</option>
          <option value="vigenere">Vigenère Cipher (Polyalphabetic)</option>
          <option value="atbash">Atbash Cipher (Alphabet Reverse)</option>
          <option value="sha256">SHA-256 Cryptographic Hash</option>
        </select>

        <label for="inputData">Input Plaintext / Data:</label>
        <textarea id="inputData" rows="3">CryptoViz Offline Learning Pack test string!</textarea>

        <div id="keyGroup">
          <label for="keyInput">Key / Param:</label>
          <input type="text" id="keyInput" value="3">
        </div>

        <button onclick="runCipher()">Process Offline</button>

        <h3 style="margin-top: 1.5rem;">Output Result:</h3>
        <div id="outputResult" class="output-box">Output will appear here...</div>
      </div>
    </section>
  </div>

  <script>
    const packPayload = ${jsonContent};
    
    function updateCipherUI() {
      const mode = document.getElementById('cipherSelect').value;
      const keyGroup = document.getElementById('keyGroup');
      const keyInput = document.getElementById('keyInput');
      if (mode === 'caesar') {
        keyGroup.style.display = 'block';
        keyInput.value = '3';
      } else if (mode === 'vigenere') {
        keyGroup.style.display = 'block';
        keyInput.value = 'CRYPTO';
      } else {
        keyGroup.style.display = 'none';
      }
    }

    async function runCipher() {
      const mode = document.getElementById('cipherSelect').value;
      const input = document.getElementById('inputData').value;
      const key = document.getElementById('keyInput').value;
      const out = document.getElementById('outputResult');

      if (mode === 'caesar') {
        const shift = parseInt(key, 10) || 0;
        out.textContent = input.replace(/[a-zA-Z]/g, c => {
          const code = c.charCodeAt(0);
          const base = code >= 97 ? 97 : 65;
          return String.fromCharCode(((code - base + shift) % 26 + 26) % 26 + base);
        });
      } else if (mode === 'vigenere') {
        let res = '';
        let kIdx = 0;
        const cleanK = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (!cleanK) { out.textContent = input; return; }
        for (let i = 0; i < input.length; i++) {
          const char = input[i];
          if (/[a-zA-Z]/.test(char)) {
            const base = char === char.toUpperCase() ? 65 : 97;
            const tVal = char.toUpperCase().charCodeAt(0) - 65;
            const kVal = cleanK[kIdx % cleanK.length].charCodeAt(0) - 65;
            res += String.fromCharCode(((tVal + kVal) % 26) + base);
            kIdx++;
          } else {
            res += char;
          }
        }
        out.textContent = res;
      } else if (mode === 'atbash') {
        out.textContent = input.replace(/[a-zA-Z]/g, c => {
          const code = c.charCodeAt(0);
          const base = code >= 97 ? 97 : 65;
          return String.fromCharCode(base + (25 - (code - base)));
        });
      } else if (mode === 'sha256') {
        try {
          const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
          out.textContent = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
          out.textContent = 'Error computing SHA-256 hash: ' + e.message;
        }
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Triggers a browser file download of the generated content string.
 */
export function downloadFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
