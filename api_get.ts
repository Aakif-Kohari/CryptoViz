--- a/api_get.ts
@@ -10,7 +10,6 @@
 function fetchData() {
   // @ts-ignore
   const data = getRawData();
-  return processData(data);
+  return processData(data as any);
 }
 
 export { fetchData };
