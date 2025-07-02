#!/bin/sh

next_version="${1}"

cd ../server
npm version ${next_version}
