@echo off
echo Committing Little Potato Robotics website changes...

cd /d "C:\Users\intrivo\Documents\Projects\little-potato-robotics-website"

echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Major website improvements: mobile nav, rainbow resources, YouTube integration

- Added rainbow highlight to Resources navigation tab
- Optimized mobile navigation with horizontal scrolling
- Reorganized resource categories with YouTube channels first
- Added @LittlePotatoRobotics YouTube channel links
- Moved Sponsors section before Contact
- Removed unnecessary navigation items (Sponsors, Programs)
- Improved dark mode consistency across all sections
- Enhanced mobile responsiveness and touch interactions"

echo Pushing to GitHub...
git push origin main

echo Done! Website updated successfully.
pause
