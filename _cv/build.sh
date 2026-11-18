#!/bin/sh
# Render resume.html -> ../Oleksii-Yukhymets-CV.pdf and resume-uk.html -> ../Oleksii-Yukhymets-CV-UA.pdf with headless Chrome.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for pair in "resume.html:../Oleksii-Yukhymets-CV.pdf" "resume-uk.html:../Oleksii-Yukhymets-CV-UA.pdf"; do
  src="${pair%%:*}"; out="${pair#*:}"
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=10000 \
    --print-to-pdf="$out" \
    "file://$PWD/$src" 2>/dev/null
  echo "Built $out"
done
