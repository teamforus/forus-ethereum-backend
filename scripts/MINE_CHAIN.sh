#!/bin/sh
BASEDIR=$(dirname $0)
DATA_DIR="${BASEDIR}/../data"
LOG_PATH="${BASEDIR}/../logs/miner.log"
GETH_BIN="geth"

NETWORKID=42
IDENTITY="ForusAppChain"

MINERTHREADS=2
ETHERBASE="0x5210c29f6f8e3cf841dfa22d35b2db88f1d353dc"

# MINER
# ADDRESS 0x5210c29f6f8e3cf841dfa22d35b2db88f1d353dc
# PRIVATE qX2EZAQzdWEg45qvtxQrCYLmDHXFJU32

# Initialize the private blockchain
nohup $GETH_BIN --networkid $NETWORKID --datadir=$DATA_DIR --identity $IDENTITY --etherbase $ETHERBASE --mine --minerthreads=$MINERTHREADS >$LOG_PATH;
