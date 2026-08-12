diff --git a/fetch_all_issues.ts b/fetch_all_issues.ts
--- a/fetch_all_issues.ts
@@ -10,7 +10,7 @@ function fetchAllIssues() {
     // @ts-ignore: This is temporary while we transition to using the new API.
     const issues = await client.getAllIssues();
 
-    return issues;
+    return issues as Issue[];
 }
