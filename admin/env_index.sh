#!/bin/bash

FILE=index.html
ORIGINAL_FILE="original_$FILE"

# If already have the original file backup, this is not the first time running 
# the script, remove the old file and restore the original file
if [ -f "$ORIGINAL_FILE" ]; then
  rm -rf "$FILE"
  cp "$ORIGINAL_FILE" "$FILE"

# This is probably the first time running the script, create a backup of the
# original file
else 
  cp "$FILE" "$ORIGINAL_FILE"
fi

echo "Setting index.html environment variables"

# Get the consumption type from the .env
consumptionType=$(grep "REACT_APP_CONSUMPTION_TYPE=" .env | sed -e 's/^[^=]*=//')
consumptionType=$(printf '%s_\n' "$consumptionType" | awk '{ print toupper($0) }')

# Convert each COND_ variable to PRODUCT_ or TICKET_ before processing all the .env variables
sed "s/%COND_/%$consumptionType/g" "$FILE" > "tmp_$FILE"
mv "tmp_$FILE" "$FILE"

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]];
do
  firstChar=${line:0:1};
  [[ ${firstChar} == "#" || ${firstChar} == "" || ${firstChar} == " " ]] && continue

  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')

    # Read value of current variable if exists as Environment variable
    value=$(printf '%s\n' "${!varname}")
    # Otherwise use value from .env file
    [[ -z $value ]] && value=${varvalue}

    # Clean all possibles backslash as this are reserved character in the sed regex
    cleanvalue=$(printf '%s' "$value" | sed -e 's/\//\\\//g')

    # index.html cannot have 'REACT_APP_' variables or they will be replaced at build time.
    # Remove the 'REACT_APP_' prefix
    if printf '%s\n' "$varname" | grep -q -e 'REACT_APP_'; then
      varname=$(printf '%s' "$varname" | sed -e 's/REACT_APP_//g')
    fi

    # Implace substitution was causing some strage errors, so create a temporary file and then rename it
    sed "s/%$varname%/$cleanvalue/g" "$FILE" > "tmp_$FILE"
    mv "tmp_$FILE" "$FILE"
  fi
done < .env
