import { describe, expect, it } from "vitest";

function roundTrip(value:unknown){return JSON.parse(JSON.stringify(value));}

describe("security: storage injection",()=>{
  it("keeps hostile keys as inert data",()=>{
    const x=Object.create(null) as Record<string,unknown>;
    x["__proto__"]="attacker";
    x["constructor"]="attacker";
    const y=roundTrip(x) as Record<string,unknown>;
    expect(y["__proto__"]).toBe("attacker");
    expect(({} as {polluted?:boolean}).polluted).toBeUndefined();
  });
  it("does not execute hostile strings during JSON parsing",()=>{
    const y=roundTrip({html:'<img src=x onerror=alert(1)>',url:"javascript:alert(1)"}) as Record<string,string>;
    expect(y.html).toContain("onerror");
    expect(y.url).toBe("javascript:alert(1)");
  });
  it("rejects non-JSON storage payloads",()=>{
    expect(()=>JSON.parse("<script>alert(1)</script>")).toThrow();
    expect(()=>JSON.parse("javascript:alert(1)")).toThrow();
  });
  it("does not create prototype pollution from JSON-shaped input",()=>{
    const y=JSON.parse('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}');
    expect(({} as {polluted?:boolean}).polluted).toBeUndefined();
    expect(y).toBeDefined();
  });
});
