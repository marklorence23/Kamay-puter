@echo off
echo Generating folder structure...
tree "%cd%" /F /A > "%cd%\folder-structure.txt"
echo Done! The file 'folder-structure.txt' has been created in this folder.
pause
