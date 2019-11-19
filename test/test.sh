#!/bin/bash

./file2directories test/test.png
./directories2file _testtest.png/
cmp test/test.png new__testtest.png