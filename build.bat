@echo off
echo Building MarkText Windows Executable...
yarn run release:win
echo.
echo Build completed! Check the following locations:
echo.
echo Installer:       build\marktext-setup.exe
echo Portable x64:    build\win-unpacked\MarkText.exe  
echo Portable x86:    build\win-ia32-unpacked\MarkText.exe
echo.
pause