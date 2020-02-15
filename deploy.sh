#!/bin/sh

FUNCTION_NAME=ethdenver-relay-pool


echo "Creating temp dir..."
mkdir temp

cp -r ./node_modules temp/.
cp ./*.js ./*.json temp/.


echo "Zipping ..."
cd temp
zip -r -q ../aws_lamda_deploy.zip .
cd ..

echo "Updating lambda function: ${FUNCTION_NAME}..."
aws lambda --profile lambda update-function-code \
--function-name ${FUNCTION_NAME} \
--zip-file fileb://aws_lamda_deploy.zip

SECRET_ENV=./secret.env
if [ -f "$SECRET_ENV" ]; then
  count=$( cat $SECRET_ENV | wc -l )  
  if [ $count -lt 1 ] ; then
      VARS=`cat $SECRET_ENV`
  else
      # https://stackoverflow.com/questions/1251999/how-can-i-replace-a-newline-n-using-sed
      VARS=`sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/,/g' ${TARGET}/secret.env`
  fi
fi

# TODO encrypt/decrypt vars with KMS
aws lambda --profile lambda update-function-configuration \
--function-name ${FUNCTION_NAME} \
--environment Variables="{$VARS}"

echo "Removing deploy zip file and temp dir"
rm aws_lamda_deploy.zip
rm -rf temp
echo "DONE"
