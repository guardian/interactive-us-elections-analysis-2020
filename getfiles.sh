#bash getfiles
fetchstamp=$(date "+%Y%m%d-%H.%M.%S")
fetchstampObj={\"timestamp\":"\"$fetchstamp\""}
resultsURL=https://gdn-cdn.s3.amazonaws.com/2020/11/analysis_test_files/special.json
annotaionsURL=https://interactive.guim.co.uk/docsdata-test/149AqDXTpDiMSZcKVgWXurGwW8cgAbQNC2wNiIOpZ4JI.json

echo $fetchstampObj > ./assets/json/timestamp.json

curl $resultsURL --output ./assets/json/county-results-$fetchstamp.json
curl $resultsURL > ./assets/json/latestraw.json
curl $annotaionsURL > ./assets/json/annotations.json