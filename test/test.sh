#!/bin/bash

./file2directories test/test.png
./directories2file _testtest.png/
cmp test/test.png new__testtest.png

./file2directories test/path/test.img
./directories2file _testpathtest.img
cmp test/path/test.img new__testpathtest.img