Set objShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 項目路徑
projectDir = fso.GetParentFolderName(WScript.ScriptFullName)
vbsFile = projectDir & "\啟動網站.vbs"

' 桌面路徑
desktopPath = objShell.SpecialFolders("Desktop")
shortcutPath = desktopPath & "\富宇學森.lnk"

' 創建快捷方式
Set objLink = objShell.CreateShortCut(shortcutPath)
objLink.TargetPath = "wscript.exe"
objLink.Arguments = """" & vbsFile & """"
objLink.WorkingDirectory = projectDir
objLink.Save

' 提示完成
MsgBox "✅ 桌面快捷方式已創建！" & vbCrLf & "你現在可以雙擊『富宇學森』快速啟動", 64, "完成"
