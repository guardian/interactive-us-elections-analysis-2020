#timestamp = https://gdn-cdn.s3.amazonaws.com/2020/11/us-general-election-data/prod/last_updated.json
FETCHSTAMP=$(curl -s 'https://gdn-cdn.s3.amazonaws.com/2020/11/us-general-election-data/prod/last_updated.json' | jq -r '.time' | sed -e 's,:,%3A,g' | sed -e 's,+,%2B,g')

echo $FETCHSTAMP > ./assets/json/timestamp_server.json

curl -s https://gdn-cdn.s3.amazonaws.com/2020/11/us-general-election-data/prod/data-out/$FETCHSTAMP/president_county_details.json --output ./assets/json/county-results-server-$FETCHSTAMP.json
curl -s https://gdn-cdn.s3.amazonaws.com/2020/11/us-general-election-data/prod/data-out/$FETCHSTAMP/president_county_details.json > ./assets/json/latestraw.json

curl https://interactive.guim.co.uk/docsdata-test/149AqDXTpDiMSZcKVgWXurGwW8cgAbQNC2wNiIOpZ4JI.json > ./assets/json/annotations.json
