#!/bin/sh
git log --date=iso --reverse --name-only > gitlog.txt

rm authtemp.txt 2> /dev/null
unset n
while read -r field1 field2 field3 field4 field5; do
    if [ "$field1" = "Author:" ] ; then
        author="$field2 $field3 $field4 $field5"
    else
       if [ "$field1" = "commit" ] ; then
          commit="$field2"
       else
          if [ "$field1" = "Date:" ] ; then
            date="$field2"
          else
            echo $commit $date $author >> authtemp.txt
          fi
      fi
   fi
done < gitlog.txt
echo

cat authtemp.txt | sort -k 3 -k 2 -k 1 | uniq -f 2 > authors.txt
