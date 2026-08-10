--- a/apps/cli/main.py
@@ -30,7 +30,8 @@ def api_get():
     response = requests.get('https://api.example.com/data')
     data = response.json()
 
-    return data
+    time.sleep(1.5)  # Simulate a 1.5s delay
+    return data
