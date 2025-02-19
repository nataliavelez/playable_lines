#!/bin/bash

# Ensure an IP address is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <server_ip>"
  exit 1
fi

SERVER_IP="$1"
TIMESTAMP=$(date +"%Y%m%d_%H%M")
LOCAL_DIR="data/$TIMESTAMP"

# Create local directory
mkdir -p "$LOCAL_DIR"

# SSH into the server and export the data
echo "Exporting data from Empirica on $SERVER_IP..."
ssh root@"$SERVER_IP" << EOF
  cd ~/empirica
  empirica export
EOF

# Copy exported data to the local machine
echo "Copying exported data from $SERVER_IP..."
scp root@"$SERVER_IP":~/empirica/*.zip "$LOCAL_DIR/"

# Copy tajriba.json to the local machine
echo "Copying tajriba.json from $SERVER_IP..."
scp root@"$SERVER_IP":~/empirica/.empirica/local/tajriba.json "$LOCAL_DIR/tajriba_$TIMESTAMP.json"

echo "Data successfully saved in $LOCAL_DIR"
