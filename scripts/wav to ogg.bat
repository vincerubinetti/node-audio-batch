@echo off
:: run the corresponding js file and pass it all files dragged onto this batch file
node "%~dpn0.js" %*
pause