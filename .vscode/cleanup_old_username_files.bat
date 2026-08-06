@echo off
if exist "src\app\api\profile\username\route.ts" del /q "src\app\api\profile\username\route.ts"
if exist "src\app\api\profile\username" rmdir /q "src\app\api\profile\username"
if exist "src\lib\profile.ts" del /q "src\lib\profile.ts"
echo Old username files removed.
pause
