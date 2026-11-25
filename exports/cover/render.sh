#!/bin/zsh
# Render cover.html to PNG at each banner size with Chrome headless.
cd "${0:A:h}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for size in 1500x500 1584x396 1920x1080 1000x750; do
  w=${size%x*}; h=${size#*x}
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --virtual-time-budget=4000 --window-size=$w,$h \
    --screenshot="$PWD/cover-$size.png" "file://$PWD/cover.html" 2>/dev/null
  echo "cover-$size.png"
done
