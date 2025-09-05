@echo off
echo ========================================
echo Building MarkText Release Files
echo ========================================
echo.

echo Installing dependencies...
yarn install
if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Building all release versions...
echo.

echo [1/4] Building for Windows...
yarn run release:win
if %ERRORLEVEL% neq 0 (
    echo Windows build failed
    pause
    exit /b 1
)
echo Windows build completed!
echo.

echo [2/4] Building for Linux...
yarn run release:linux
if %ERRORLEVEL% neq 0 (
    echo Linux build failed
    pause
    exit /b 1
)
echo Linux build completed!
echo.

echo [3/4] Building for macOS...
yarn run release:mac
if %ERRORLEVEL% neq 0 (
    echo macOS build failed
    pause
    exit /b 1
)
echo macOS build completed!
echo.

echo [4/4] Building universal package...
yarn run build
if %ERRORLEVEL% neq 0 (
    echo Universal build failed
    pause
    exit /b 1
)
echo Universal build completed!
echo.

echo ========================================
echo All Release Builds Completed Successfully!
echo ========================================
echo.
echo Build outputs can be found in:
echo.
echo Windows:  build\marktext-setup.exe
echo           build\win-unpacked\MarkText.exe
echo           build\win-ia32-unpacked\MarkText.exe
echo.
echo Linux:    build\MarkText-x.x.x.AppImage
echo           build\marktext_x.x.x_amd64.deb
echo           build\marktext-x.x.x.x86_64.rpm
echo.
echo macOS:    build\MarkText-x.x.x.dmg
echo           build\MarkText-x.x.x-mac.zip
echo.
echo Universal: build\ (various formats)
echo.
pause