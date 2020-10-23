#bash getfiles
fetchstamp=$(date "+%Y%m%d-%H.%M.%S")
fetchstampObj={\"timestamp\":"\"$fetchstamp\""}
url=https://gdn-cdn.s3.amazonaws.com/2020/11/analysis_test_files/special.json

echo $fetchstampObj > ./assets/json/timestamp.json

curl $url --output ./assets/json/county-results-$fetchstamp.json
curl $url > ./assets/json/latestraw.json