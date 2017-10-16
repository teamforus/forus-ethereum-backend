#!/bin/sh
BASEDIR=$(dirname $0)

rm -rf -R "${BASEDIR}/../data"
cp -R "${BASEDIR}/../blockchain-genesis/data" "${BASEDIR}/../data"