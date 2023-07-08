@echo off
setlocal
REM -----
REM -- Update to file "_known.json"
REM -----
REM -- All .json files in this folder are "scanned". If there is
REM -- a "displayName" Entry, this is used for the "_known.json" entry.
REM -- The order of the entries is alphabetically
REM -----

cd /D "%~dp0."
call :scanDir . 2>&1 >"%~n0.json"

goto :eof
:scanDir
echo {
echo(  "version":1,
echo(  "pattern":[
for %%J in (*.json) do if not "%%~J"=="%~n0.json" call :scanFile "%%~J"
if defined atLeastOne echo(    }
echo(  ]
echo }

goto :eof
:scanFile
>&2 echo "%~1"
set displayName=%~n1
for /F "tokens=1* delims=:" %%L in (%~1) do (
  call :scanLine %%L %%M
)
if defined atLeastOne echo(    },
echo(    {
echo(      "name":"%~n1",
echo(      "displayName":"%displayName%"
REM echo(    }
set atLeastOne=true

goto :eof
:scanLine
REM >&2 echo #%~1#%~2#
if "%~1"=="displayName" set "displayName=%~2"
