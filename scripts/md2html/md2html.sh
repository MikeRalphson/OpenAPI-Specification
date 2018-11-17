#!/bin/sh

LOCN=`dirname $0`

echo Processing src/2.0.md
node ${LOCN}/md2html.js --respec --maintainers src/MAINT20.md --css tmp/md2html/gist.css src/2.0.md > oas/v2.0.html

for f in src/[3456789]*.md; do
  echo Processing $f
  node ${LOCN}/md2html.js --respec --maintainers src/MAINTAINERS.md --css tmp/md2html/gist.css $f > oas/v`basename $f .md`.html
done

ls -l oas
