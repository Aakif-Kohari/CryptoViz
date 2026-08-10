diff --git a/load_seen.ts b/load_seen.ts
index 1a2b3c4..5d6e7f8 100644
--- a/load_seen.ts
@@ -1,10 +1,9 @@
 import { someFunction } from './module';
 
-function doSomething() {
-  @ts-ignore
-  const result = someFunction();
+function doSomething(): void {
+  const result: any = someFunction();
   console.log(result);
 }
 
 export { doSomething };
