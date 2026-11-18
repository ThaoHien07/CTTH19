@echo off
title Phuc An Retail AI Agent Server
echo ==========================================================
echo  DANG KHOI CHAY MAY CHU WEB CHO PHUC AN RETAIL AI AGENT...
echo  Dia chi: http://localhost:8088/
echo ==========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause

