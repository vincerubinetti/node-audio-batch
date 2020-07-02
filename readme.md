## Node Audio Batch

Handy Node.js scripts to batch process audio on Windows.

I used these scripts to prepare seamless loops and album masters for many of the game soundtracks I've worked on: [Ink](https://vincerubinetti.bandcamp.com/album/ink), [HackyZack](https://vincerubinetti.bandcamp.com/album/hackyzack), [High Noon Revolver](https://vincerubinetti.bandcamp.com/album/high-noon-revolver), and [Gemstone Keeper](https://vincerubinetti.bandcamp.com/album/gemstone-keeper).
It allowed me to continually make small changes to the songs without having to worry about manually re-processing everything again each time.

### Dependencies

1. [Node.js](https://nodejs.org/)
2. [sox.exe](http://sox.sourceforge.net/) for general audio processing functions
3. [lame.exe](http://lame.sourceforge.net/download.php) for .mp3 decoding/encoding/tagging
4. [flac.exe](https://xiph.org/flac/download.html) for .flac encoding/tagging
5. [vorbiscomment.exe](http://www.rarewares.org/ogg-tools.php) for .ogg (vorbis) metadata tagging

### Installing

1. Install [Node.js](https://nodejs.org/)
2. Download this repository and place `/scripts` and `/utilities` in a folder of your choice
3. Download latest versions of included utilities, if desired

### Using

- The `/scripts` folder contains a bunch of examples on how to use this tool.
The `.js` files are the ones that do the actual processing.
They use functions from the `tools.js` file under `\utilities` to easily process audio in various ways.
The `.bat` files allow you to conveniently run the script files just by dragging audio files onto them.
The `.bat` files all have the same content: they just run the `.js` file of the same name in the same folder and give it the list of audio files you dragged and dropped.
- The `/utilites` folder contains the code and third-party libraries needed to process audio, as well as some useful documentation and references
- If desired, add new functions to `tools.js` to utilize other [SoX](http://sox.sourceforge.net/Docs/Documentation), command line, or JavaScript functionalities
- The scripts should be written in JavaScript (`.js`) and can use functions from `/utilites/tools.js`, a suite of functions that allow the user to quickly and cleanly execute audio and file system commands

### List of available processing functions, in `/utilities/tools.js`

See the actual file for more documentation.

```javascript
// PROCESSING

// run processFunction() on every audio file dropped onto .bat/.js file
BatchProcess(processFunction)

// get length of audio file in seconds
GetLength(filePath)

// get length of audio file in samples
GetSamples(filePath)

// cut input audio file from startTime to endTime, and paste to output audio file
Cut(inputPath, outputPath, startTime, endTime)

// mix two input audio files into one
Mix(input1Path, input2Path, outputPath, volume1, volume2)

// apply gain to audio file
Gain(inputPath, outputPath, gain)

// normalize audio file to 0 dB, then apply gain
Normalize(inputPath, outputPath, gain)

// trim silence from beginning of audio
TrimStart(inputPath, outputPath, duration, threshold)

// trim silence from end of audio
TrimEnd(inputPath, outputPath, duration, threshold)

// trim silence from beginning and end of audio
Trim(inputPath, outputPath, startDuration, startThreshold, endDuration, endThreshold)

// fade in audio
FadeIn(inputPath, outputPath, fadeType, startTime, length)

// fade out audio
FadeOut(inputPath, outputPath, fadeType, endTime, length)

// pad audio with silence at beginning and/or end
Pad(inputPath, outputPath, startSilence, endSilence)

// set loop point markers (only in .wav files)
SetLoop(inputPath, outputPath, start, end)

// FORMATTING/CONVERSION

// convert wav to mp3 with tags
WavToMp3(inputPath, outputPath, bitrate, quality, title, artist, album, trackNumber, albumArtist, year, comment, art)

// convert mp3 to wav
Mp3ToWav(inputPath, outputPath)

// convert wav to ogg with tags
WavToOgg(inputPath, outputPath, quality, title, artist, album, trackNumber, albumArtist, year, comment)

// convert ogg to wav
OggToWav(inputPath, outputPath)

// convert wav to flac with tags
WavToFlac(inputPath, outputPath, title, artist, album, trackNumber, albumArtist, year, comment, art)

// convert flac to wav
FlacToWav(inputPath, outputPath)

// FILE SYSTEM

// copy file from source to destination
CopyFile(sourcePath, destinationPath)

// move file from source to destination
MoveFile(sourcePath, destinationPath)

// rename file
RenameFile(sourcePath, destinationPath)

// delete file at specified path
DeleteFile(filePath)

// make folder at specified location
MakeFolder(folderPath)

// delete folder at specificed location
DeleteFolder(folderPath)

// get file name from full path
GetFileName(filePath)

// get file extension from full path
GetFileExtension(filePath)

// get file folder from full path
GetFileFolder(filePath)

// get file drive letter from full path
GetFileDrive(filePath)

// return components of full file path as array
GetFilePathParts(filePath)

// abbreviate file path with ellipsis after drive letter if over certain character length
AbbreviateFilePath(filePath, characters)
```
