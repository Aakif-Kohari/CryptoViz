diff --git a/apps/cli/main.py b/apps/cli/main.py
--- a/apps/cli/main.py
@@ -10,7 +10,6 @@ def main():
     try:
         result = some_function()
     except Exception as e:
-        # @ts-ignore: Ignore type checking for this line
         print(f"An error occurred: {e}")
 
 if __name__ == "__main__":
--- a/apps/cli/main.py
@@ -30,7 +30,8 @@ def api_get():
     response = requests.get('https://api.example.com/data')
     data = response.json()
 
-    return data
+    time.sleep(1.5)  # Simulate a 1.5s delay
+    return data
