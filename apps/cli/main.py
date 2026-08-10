diff --git a/apps/cli/main.py b/apps/cli/main.py
--- a/apps/cli/main.py
@@ -10,7 +10,6 @@ def main():
     try:
         result = some_function()
     except Exception as e:
-        # @ts-ignore: Ignore type checking for this line
         print(f"An error occurred: {e}")
 
 if __name__ == "__main__":
