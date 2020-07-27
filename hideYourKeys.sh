#! /bin/bash

#Hide your API key in 3 steps:
#find the complete path according to file name
#replace the API key with a random integer and commit to Github
#put back your API key into the file

echo "Enter target file full name: "
read input
#acquire the path
path=$(find . -name $input)
pathLength=${#path}
# length=0 means file not found
if [ $pathLength -eq 0 ]
then
  echo "Not found"
  exit 1
fi
  #find the line with grep
  line=$(grep -I "key=" $path)
  #generate a random replacement
  rand=$(shuf -i 100000-99999999 -n 1)
  #replace the API with this random number
  sed -i "s@$line@$rand@" $path
  #now commit entire thing to GitHub
  git add .
  echo "enter your commit message here: "
  read message
  git commit -m "$message"
  git push origin master
  #now put the key back to the file, program finished
  #pay attention to the ampersand signs due to sed, those are escaping arguments
  sed -i "s@$rand@${line//&/\\&}@" $path
