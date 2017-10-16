#!/bin/sh
BASEDIR=$(dirname $0)

$BASEDIR/CLEAN_CHAIN.sh

DATA_DIR="${BASEDIR}/../data"
GENESIS_PATH="${BASEDIR}/../blockchain-genesis/CustomGenesis.json"
GETH_BIN="geth"

NETWORKID=42
IDENTITY="ForusAppChain"

# Initialize the private blockchain
$GETH_BIN --networkid $NETWORKID --datadir=$DATA_DIR --identity $IDENTITY init $GENESIS_PATH