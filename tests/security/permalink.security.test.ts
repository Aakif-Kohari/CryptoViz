import { describe, expect, it } from "vitest";
import { sanitizeUrl } from "../../lib/security/inputSanitization";

const bad=["javascript:alert(1)","JAVASCRIPT:alert(1)","data:text/html,<script>alert(1)</script>","data:text/javascript,alert(1)","vbscript:msgbox(1)","file:///etc/passwd","blob:https://evil.example/123"];
describe("security: permalink URL injection",()=>{
  it.each(bad)("rejects %s",(url)=>{const r=sanitizeUrl(url);expect(r.value).toBe("");});
  it("accepts https",()=>expect(sanitizeUrl("https://example.com/share?mode=encrypt").value).toBe("https://example.com/share?mode=encrypt"));
  it("removes credentials",()=>expect(sanitizeUrl("https://attacker:secret@example.com/share").value).toBe("https://example.com/share"));
  it("removes fragments",()=>expect(sanitizeUrl("https://example.com/share#javascript:alert(1)").value).toBe("https://example.com/share"));
  it("rejects malformed URLs",()=>expect(sanitizeUrl("not a url").value).toBe(""));
});
