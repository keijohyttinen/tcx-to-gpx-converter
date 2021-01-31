# TXC to GPX files batch converter

GPS data conversion, e.g. convert TCX files to GPX files in one run.
This is needed, e.g. to import workouts from Endomondos to Sportstracker.

Place input files (.txc files) into input folder. 
Conversion of GPX will be outputted to output folder.

Note: by default GPX files are divived into group of 10 files in subfolders.
See code for disabling it and outputting all in the same folder.

```
npm install
node convert.js
```
