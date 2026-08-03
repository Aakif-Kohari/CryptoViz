/**
 * Converts ASCII text to hexadecimal.
 */
export function asciiToHex(text: string): string {
  return Array.from(text)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Converts hexadecimal to ASCII text.
 */
export function hexToAscii(hex: string): string {
  const cleaned = hex.replace(/\s+/g, "");

  if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length % 2 !== 0) {
    throw new Error("Invalid hexadecimal input.");
  }

  let result = "";

  for (let i = 0; i < cleaned.length; i += 2) {
    result += String.fromCharCode(parseInt(cleaned.substring(i, i + 2), 16));
  }

  return result;
}

/**
 * Converts ASCII text to binary.
 */
export function asciiToBinary(text: string): string {
  return Array.from(text)
    .map((char) =>
      char.charCodeAt(0).toString(2).padStart(8, "0")
    )
    .join(" ");
}

/**
 * Converts binary to ASCII text.
 */
export function binaryToAscii(binary: string): string {
  const cleaned = binary.trim().replace(/\s+/g, " ");

  const bytes = cleaned.split(" ");

  if (
    bytes.some(
      (byte) => byte.length !== 8 || /[^01]/.test(byte)
    )
  ) {
    throw new Error("Invalid binary input.");
  }

  return bytes
    .map((byte) => String.fromCharCode(parseInt(byte, 2)))
    .join("");
}

/**
 * Converts hexadecimal to binary.
 */
export function hexToBinary(hex: string): string {
  const cleaned = hex.replace(/\s+/g, "");

  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    throw new Error("Invalid hexadecimal input.");
  }

  return cleaned
    .split("")
    .map((digit) =>
      parseInt(digit, 16).toString(2).padStart(4, "0")
    )
    .join(" ");
}

/**
 * Converts binary to hexadecimal.
 */
export function binaryToHex(binary: string): string {
  const cleaned = binary.replace(/\s+/g, "");

  if (!/^[01]+$/.test(cleaned) || cleaned.length % 4 !== 0) {
    throw new Error("Invalid binary input.");
  }

  let result = "";

  for (let i = 0; i < cleaned.length; i += 4) {
    result += parseInt(cleaned.substring(i, i + 4), 2).toString(16);
  }

  return result.toUpperCase();
}