#!/bin/sh
# Render resume.html and resume-uk.html to PDF with headless Chrome.
# The file name is what people see in the "Save as" dialog, so it carries the full name and title.
# The old short name is kept as a copy so links shared earlier keep working.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
EN="../CV Oleksii Yukhymets, UX-UI Product Designer.pdf"
UK="../CV Олексій Юхимець, продуктовий UX-UI-дизайнер.pdf"
render() {
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=10000 \
    --print-to-pdf="$2" \
    "file://$PWD/$1" 2>/dev/null
  echo "Built $2"
}
render resume.html "$EN"
render resume-uk.html "$UK"
cp "$EN" ../Oleksii-Yukhymets-CV.pdf
cp "$UK" ../Oleksii-Yukhymets-CV-UA.pdf
# Earlier full names, kept so cached pages and shared links do not 404.
cp "$EN" "../CV Oleksii Yukhymets, Product Designer, Design Engineer.pdf"
cp "$UK" "../CV Олексій Юхимець, продуктовий дизайнер, дизайн-інженер.pdf"
