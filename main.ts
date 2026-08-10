--- a/main.ts
@@ -10,7 +10,6 @@
     console.log("Hello, World!");
 }
 
-// @ts-ignore
 function fetchData() {
     return fetch('https://api.example.com/data')
         .then(response => response.json())
@@ -20,7 +19,6 @@ function fetchData() {
     return fetch('https://api.example.com/data')
         .then(response => response.json())
 }
 
-// @ts-ignore
 async function processData(data: any) {
     console.log("Processing data:", data);
 }
