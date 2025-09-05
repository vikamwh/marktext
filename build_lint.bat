@echo off
echo ========================================
echo Running MarkText Linter
echo ========================================
echo.

echo Installing dependencies (if needed)...
yarn install --check-files
if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Running ESLint on src and test directories...
echo.
yarn run lint
if %ERRORLEVEL% neq 0 (
    echo.
    echo ========================================
    echo Linting failed with errors!
    echo ========================================
    echo.
    echo Would you like to try automatic fixing? (y/N)
    set /p choice=
    if /i "%choice%"=="y" (
        echo.
        echo Running ESLint with --fix...
        yarn run lint:fix
        if %ERRORLEVEL% neq 0 (
            echo Automatic fixing completed, but some errors remain.
            echo Please review and fix manually.
        ) else (
            echo Automatic fixing completed successfully!
        )
    )
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo Linting completed successfully!
    echo ========================================
    echo.
    echo No linting errors found.
    echo Code follows project style guidelines.
)
echo.
pause