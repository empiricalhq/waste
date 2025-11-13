# docs

You need to set the `ANDROID_HOME` environment variable to point to your Android SDK
folder if you plan to build the app locally. The path could be (on Windows):
`C:\Users{user}\AppData\Local\Android\Sdk` (check it just in case!).

On Windows, you can set it temporarily in PowerShell with:

```powershell
$env:ANDROID_HOME = "C:\Users{user}\AppData\Local\Android\Sdk"
```

To make the change permanent, add it through System Properties > Environment Variables if
you have admin rights. If you don't, open Control Panel > User Accounts > User Accounts
again, then select Change my environment variables on the left.

In both cases, add the variable to your path.

After setting it, restart your terminal or IDE (VS Code can be buggy and may need a
restart).
