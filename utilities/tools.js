// shortcut to node..js functions
var process = require("process");
var path = require("path");
var fs = require("fs");
var child_process = require("child_process");

module.exports = function () {
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // DEPENDENCIES
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  // relative paths to executables
  // path.resolve(__dirname,) converts relative paths to absolute paths (relative to this module, instead of current working directory)
  this.sox = path.resolve(__dirname, "sox/sox.exe");
  this.lame = path.resolve(__dirname, "mp3/lame.exe");
  this.flac = path.resolve(__dirname, "flac/flac.exe");
  this.vorbiscomment = path.resolve(__dirname, "ogg/vorbiscomment.exe");

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // AUDIO PROCESS FUNCTIONS
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  // run processFunction() on every audio file dropped onto .bat/.js file
  this.BatchProcess = function (processFunction) {
    var tracks = process.argv.slice(2); // remove first two command line arguments (node .exe path and .js file path) leaving just the list of files that were dragged onto the .bat/.js file

    for (var i = 0; i < tracks.length; i++) {
      this.Header(
        "processing track " + String(i + 1) + " of " + tracks.length,
        this.AbbreviateFilePath(tracks[i], 75)
      ); // display message indicating the current track being processed
      processFunction(
        this.GetFileFolder(tracks[i]),
        this.GetFileName(tracks[i]),
        this.GetFileExtension(tracks[i])
      ); // pass filename, folder, and extension to function for convenience
    }
  };

  // get length of audio file in seconds
  this.GetLength = function (filePath) {
    if (filePath === undefined) return;

    return this.Command(this.sox, "--info", "-D", filePath).trim();
  };

  // get length of audio file in samples
  this.GetSamples = function (filePath) {
    if (filePath === undefined) return;

    return this.Command(this.sox, "--info", "-s", filePath).trim();
  };

  // cut input audio file from startTime to endTime, and paste to output audio file
  this.Cut = function (inputPath, outputPath, startTime, endTime) {
    if (inputPath === undefined || outputPath === undefined) return;

    // '-5' = 5 seconds from end of audio, '130-441s' = 2 min 10 sec minus 441 samples from beginning of audio
    if (startTime === "start" || startTime === undefined) startTime = "0";
    if (endTime === "end" || endTime === undefined) endTime = "-0";

    this.Command(this.sox, inputPath, outputPath, "trim", startTime, endTime);
  };

  // mix two input audio files into one
  this.Mix = function (input1Path, input2Path, outputPath, volume1, volume2) {
    if (
      input1Path === undefined ||
      input2Path === undefined ||
      outputPath === undefined
    )
      return;

    // volumes are multipliers: 1 = unchanged volume, 0 = silenced
    if (volume1 === undefined) volume1 = 1;
    if (volume2 === undefined) volume2 = 1;

    this.Command(
      this.sox,
      "--combine",
      "mix",
      "--guard",
      "--volume",
      volume1,
      input1Path,
      "--volume",
      volume2,
      input2Path,
      outputPath
    );
  };

  // apply gain to audio file
  this.Gain = function (inputPath, outputPath, gain) {
    if (inputPath === undefined || outputPath === undefined) return;

    // gain is in dB: 0 = unchanged volume, -3 = -3 dB, -6 = -6 dB (roughly half-volume)
    if (gain === undefined) gain = 0;

    this.Command(this.sox, inputPath, outputPath, "gain", gain);
  };

  // normalize audio file to 0 dB, then apply gain
  this.Normalize = function (inputPath, outputPath, gain) {
    if (inputPath === undefined || outputPath === undefined) return;

    if (gain === undefined) gain = 0;

    this.Command(this.sox, inputPath, outputPath, "gain", "-n", gain);
  };

  // trim silence from beginning of audio
  this.TrimStart = function (inputPath, outputPath, duration, threshold) {
    if (inputPath === undefined || outputPath === undefined) return;

    // duration: '1:23:40.5' = 1 hr 23 min 40 sec 500 ms, "44100s" = 44100 samples
    // threshold: '50%' for % amplitude RMS, '-20d' for -20db RMS
    if (!duration) duration = 0.1;
    if (!threshold) threshold = "-70d";

    this.Command(
      this.sox,
      inputPath,
      outputPath,
      "silence",
      "1",
      duration,
      threshold
    );
  };

  // trim silence from end of audio
  this.TrimEnd = function (inputPath, outputPath, duration, threshold) {
    if (
      inputPath === undefined ||
      outputPath === undefined ||
      duration === undefined ||
      threshold === undefined
    )
      return;

    if (!duration) duration = 0.1;
    if (!threshold) threshold = "-70d";

    this.Command(
      this.sox,
      inputPath,
      outputPath,
      "reverse",
      "silence",
      "1",
      duration,
      threshold,
      "reverse"
    );
  };

  // trim silence from beginning and end of audio
  this.Trim = function (
    inputPath,
    outputPath,
    startDuration,
    startThreshold,
    endDuration,
    endThreshold
  ) {
    if (
      inputPath === undefined ||
      outputPath === undefined ||
      startDuration === undefined ||
      startThreshold === undefined ||
      endDuration === undefined ||
      endThreshold === undefined
    )
      return;

    if (!startDuration) startDuration = 0.1;
    if (!startThreshold) startThreshold = "-70d";
    if (!endDuration) endDuration = 0.1;
    if (!endThreshold) endThreshold = "-70d";

    this.Command(
      this.sox,
      inputPath,
      outputPath,
      "silence",
      "1",
      startDuration,
      startThreshold,
      "reverse",
      "silence",
      "1",
      endDuration,
      endThreshold,
      "reverse"
    );
  };

  // fade in audio
  this.FadeIn = function (inputPath, outputPath, fadeType, startTime, length) {
    if (inputPath === undefined || outputPath === undefined) return;

    // t = linear, l = log, p = parabola, h = half sine, q = quarter sine
    if (fadeType === undefined || typeof fadeType !== "string") fadeType = "t";
    if (startTime === "start" || startTime === undefined) startTime = "0";
    if (length === undefined) length = "0";

    this.Command(
      this.sox,
      inputPath,
      outputPath,
      "trim",
      startTime,
      "fade",
      fadeType,
      length
    );
  };

  // fade out audio
  this.FadeOut = function (inputPath, outputPath, fadeType, endTime, length) {
    if (inputPath === undefined || outputPath === undefined) return;

    if (fadeType === undefined || typeof fadeType !== "string") fadeType = "t"; // default, linear/'triangle'
    if (endTime === "end" || endTime === undefined) endTime = "-0";
    if (length === undefined) length = "0";

    this.Command(
      this.sox,
      inputPath,
      outputPath,
      "fade",
      fadeType,
      "0",
      endTime,
      length
    );
  };

  // pad audio with silence at beginning and/or end
  this.Pad = function (inputPath, outputPath, startSilence, endSilence) {
    if (inputPath === undefined || outputPath === undefined) return;

    if (startSilence === undefined) startSilence = 0;
    if (endSilence === undefined) endSilence = 0;

    this.Command(
      this.sox,
      inputPath,
      outputPath,
      "pad",
      startSilence,
      endSilence
    );
  };

  // set loop point markers (only in .wav files)
  this.SetLoop = function (inputPath, outputPath, start, end) {
    if (inputPath === undefined || outputPath === undefined) return;

    // load input wave
    var waveData = fs.readFileSync(inputPath);

    // get sample rate of wave file
    var sampleRateIndex;
    for (var i = 0; i < waveData.length - 4; i++) {
      if (waveData.toString("utf8", i, i + 4) === "fmt ") {
        // look for fmt chunk - which contains sample rate among other things - per wave format specification
        sampleRateIndex = i + 4 + 4 + 2 + 2; // sample rate is 12 bytes after start of 'fmt ' chunk id
        break;
      }
    }
    if (sampleRateIndex === undefined) return;
    var sampleRate = waveData.readUInt32LE(sampleRateIndex);

    // convert seconds to samples
    if (start === undefined) start = 0;
    else start = Math.floor(sampleRate * start);
    if (end === undefined) end = this.GetSamples(inputPath) - 1;
    else end = Math.floor(sampleRate * end);

    // find index (byte offset) of smpl chunk if it exists
    var smplIndex;
    for (
      var i = waveData.length - 4 - 1;
      i >= 0;
      i-- // start search from end of file going backward, since the smpl chunk is typically written after the actual waveform data
    ) {
      if (waveData.toString("utf8", i, i + 4) === "smpl") {
        smplIndex = i; // start of smpl chunk id
        break;
      }
    }

    // if the smpl chunk already exists, remove it
    if (smplIndex !== undefined) {
      var smplChunkSize = waveData.readUInt32LE(smplIndex + 4) + 8; // smpl chunk size is specified 4 bytes after start of smpl chunk id. add 8 bytes to include size of smpl chunk header itself
      waveData = Buffer.concat([
        waveData.slice(0, smplIndex),
        waveData.slice(smplIndex + smplChunkSize),
      ]); // splice smpl chunk from wave file data
    }

    // make new buffer to replace smpl chunk
    var smplChunk = Buffer.alloc(68); // the default smpl chunk written here is 60 bytes long. add 8 bytes to include size of smpl chunk header itself
    // all bytes other than the ones specified below default to 0 and represent default values for the smpl chunk properties
    smplChunk.write("smpl", 0, 4);
    smplChunk.writeUInt32LE(60, 4); // the default smpl chunk written here is 60 bytes long
    smplChunk.writeUInt32LE(60, 20); // middle C is MIDI note 60, therefore make MIDI unity note 60
    smplChunk.writeUInt32LE(1, 36); // write at byte offset 36 that there is one loop cue info in the file
    smplChunk.writeUInt32LE(start, 52); // write loop start point at byte offset 52
    smplChunk.writeUInt32LE(end, 56); // write loop end point at byte offset 56

    // append new smpl chunk to wave file
    waveData = Buffer.concat([waveData, smplChunk]);

    // change wave file main header data to increase the file size to include smpl chunk (loop points)
    var fileSizeIndex;
    for (var i = 0; i < waveData.length - 4; i++) {
      if (waveData.toString("utf8", i, i + 4) === "RIFF") {
        // look for RIFF chunk (should always be at the very beginning of file)
        fileSizeIndex = i + 4; // file size is 4 bytes after start of RIFF chunk id
        break;
      }
    }
    if (fileSizeIndex === undefined) return;
    var fileSize = waveData.length - 8; // get final length of wave file, minus 8 bytes to not include the RIFF chunk header itself
    waveData.writeUInt32LE(fileSize, fileSizeIndex); // write new file length

    // write new wave file
    fs.writeFileSync(outputPath, waveData);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // FORMAT CONVERT FUNCTIONS
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  // convert wav to mp3 with tags
  this.WavToMp3 = function (
    inputPath,
    outputPath,
    bitrate,
    quality,
    title,
    artist,
    album,
    trackNumber,
    albumArtist,
    year,
    comment,
    art
  ) {
    // bitrate: 8 16 24 32 40 48 56 64 80 96 112 128 144 160 192 224 256 320
    // quality: 0 (high) to 9 (low)

    if (inputPath === undefined || outputPath === undefined) return;

    if (!bitrate) bitrate = 320;
    if (!quality) quality = 0;

    var tags = [];

    if (title) tags.push("--tt", title);
    if (artist) tags.push("--ta", artist);
    if (album) tags.push("--tl", album);
    if (trackNumber) tags.push("--tn", trackNumber);
    if (albumArtist) tags.push("--tv", "TPE2=" + albumArtist);
    if (year) tags.push("--ty", year);
    if (comment) tags.push("--tc", comment);
    if (art) tags.push("--ti", art);

    this.Command(
      this.lame,
      "-q" + quality,
      "-b",
      bitrate,
      inputPath,
      outputPath,
      tags
    );
  };

  // convert mp3 to wav
  this.Mp3ToWav = function (inputPath, outputPath) {
    if (inputPath === undefined || outputPath === undefined) return;

    this.Command(this.lame, "--decode", inputPath, outputPath);
  };

  // convert wav to ogg with tags
  this.WavToOgg = function (
    inputPath,
    outputPath,
    quality,
    title,
    artist,
    album,
    trackNumber,
    albumArtist,
    year,
    comment
  ) {
    // quality: 0 (low) to 10 (high)

    if (inputPath === undefined || outputPath === undefined) return;

    if (!quality) quality = 5;

    this.Command(this.sox, inputPath, "-C", quality, outputPath);

    var tags = [];

    if (title) tags.push("-t", "TITLE=" + title);
    if (artist) tags.push("-t", "ARTIST=" + artist);
    if (album) tags.push("-t", "ALBUM=" + album);
    if (trackNumber) tags.push("-t", "TRACKNUMBER=" + trackNumber);
    if (albumArtist) tags.push("-t", "ALBUMARTIST=" + albumArtist);
    if (year) tags.push("-t", "COPYRIGHT=" + year);
    if (comment) tags.push("-t", "DESCRIPTION=" + comment);

    if (tags.length > 0)
      this.Command(this.vorbiscomment, "-w", tags, outputPath);
  };

  // convert ogg to wav
  this.OggToWav = function (inputPath, outputPath) {
    if (inputPath === undefined || outputPath === undefined) return;

    this.Command(this.sox, inputPath, outputPath);
  };

  // convert wav to flac with tags
  this.WavToFlac = function (
    inputPath,
    outputPath,
    title,
    artist,
    album,
    trackNumber,
    albumArtist,
    year,
    comment,
    art
  ) {
    if (inputPath === undefined || outputPath === undefined) return;

    var tags = [];

    if (title) tags.push("-T", "TITLE=" + title);
    if (artist) tags.push("-T", "ARTIST=" + artist);
    if (album) tags.push("-T", "ALBUM=" + album);
    if (trackNumber) tags.push("-T", "TRACKNUMBER=" + trackNumber);
    if (albumArtist) tags.push("-T", "ALBUMARTIST=" + albumArtist);
    if (year) tags.push("-T", "COPYRIGHT=" + year);
    if (comment) tags.push("-T", "DESCRIPTION=" + comment);
    if (art) tags.push("--picture=" + art);

    this.Command(this.flac, tags, "-f", inputPath, "-o", outputPath);
  };

  // convert flac to wav
  this.FlacToWav = function (inputPath, outputPath) {
    if (inputPath === undefined || outputPath === undefined) return;

    this.Command(this.sox, inputPath, outputPath);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // FILE SYSTEM
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  // copy file from source to destination
  this.CopyFile = function (sourcePath, destinationPath) {
    if (sourcePath === undefined || destinationPath === undefined) return;

    this.Command(
      "echo",
      "f",
      "|",
      "xcopy",
      "/f",
      "/y",
      sourcePath,
      destinationPath
    );
  };

  // move file from source to destination
  this.MoveFile = function (sourcePath, destinationPath) {
    if (sourcePath === undefined || destinationPath === undefined) return;

    fs.renameSync(sourcePath, destinationPath);
  };

  // rename file
  this.RenameFile = this.MoveFile;

  // delete file at specified path
  this.DeleteFile = function (filePath) {
    if (filePath === undefined) return;

    fs.unlinkSync(filePath);
  };

  // make folder at specified location
  this.MakeFolder = function (folderPath) {
    if (folderPath === undefined) return;

    if (fs.existsSync(folderPath) === true) return;

    fs.mkdirSync(folderPath);
  };

  // delete folder at specificed location
  this.DeleteFolder = function (folderPath) {
    if (folderPath === undefined) return;

    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach(function (file, index) {
        var currentPath = folderPath + "/" + file;
        if (fs.lstatSync(currentPath).isDirectory())
          this.DeleteFolder(currentPath);
        else fs.unlinkSync(currentPath);
      });
      fs.rmdirSync(folderPath);
    }
  };

  // get file name from full path
  this.GetFileName = function (filePath) {
    return path.parse(filePath).name;
  };

  // get file extension from full path
  this.GetFileExtension = function (filePath) {
    return path.extname(filePath);
  };

  // get file folder from full path
  this.GetFileFolder = function (filePath) {
    return path.dirname(filePath) + "\\";
  };

  // get file drive letter from full path
  this.GetFileDrive = function (filePath) {
    return path.parse(filePath).root;
  };

  // return components of full file path as array
  this.GetFilePathParts = function (filePath) {
    var parts = path.dirname(filePath).split("\\").join("/").split("/");
    for (var i = 0; i < parts.length; i++) parts[i] += "/";
    parts.push(path.parse(filePath).name);
    parts.push(path.parse(filePath).ext);
    return parts;
  };

  // abbreviate file path with ellipsis after drive letter if over certain character length
  this.AbbreviateFilePath = function (filePath, characters) {
    var parts = this.GetFilePathParts(filePath);
    var abbreviated = false;
    while (
      parts.join("").length + (abbreviated ? 5 : 0) > characters &&
      parts.length > 3
    ) {
      parts.splice(1, 1);
      abbreviated = true;
    }
    if (abbreviated) parts.splice(1, 0, " ... ");
    return parts.join("");
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // COMMAND LINE UTILITIES
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  // run command line commands from supplied arguments. Command( arg1, arg2, [arg3, arg4, arg5], arg6) becomes "arg1 arg2 arg3 arg4 arg5 arg6"
  this.Command = function () {
    arguments = Array.from(arguments); // convert object to array
    var commands = [];
    for (var i = 0; i < arguments.length; i++) {
      // expand array to separate arguments
      if (typeof arguments[i] === "object")
        for (var j = 0; j < arguments[i].length; j++)
          commands.push(String(arguments[i][j]));
      else commands.push(String(arguments[i]));
    }
    // surround argument with quotes if it contains a space, so file paths with spaces are encapsulated and do not break the command
    for (var i = 0; i < commands.length; i++) {
      if (commands[i].includes(" ")) {
        if (commands[i].charAt(0) !== '"') commands[i] = '"' + commands[i];
        if (commands[i].charAt(commands[i].length - 1) !== '"')
          commands[i] = commands[i] + '"';
      }
    }
    commands = commands.join(" ");
    return child_process.execSync(commands, { encoding: "utf8" });
  };

  this.Echo = function (message) {
    if (message === undefined) console.log();
    else console.log(message);
  };

  this.RepeatCharacters = function (character, times) {
    if (character === undefined) character = "-";
    if (times === undefined) times = 0;

    var string = "";

    for (var i = 0; i < times; i++) string += character;

    return string;
  };

  // print fancy header box to visually separate command line feed
  this.Header = function () {
    if (arguments.length === 0) return;

    var character = "-";
    var width = 75;
    var horizontalPad = 3;
    var verticalSpace = 2;
    var verticalMargin = 2;
    var verticalPad = 1;

    var messages = [];
    messages = Array.from(arguments);
    for (var i = 0; i < messages.length; i++) {
      if (messages[i] === undefined) messages[i] = "undefined";
      if (messages[i] === null) messages[i] = "null";
      if (messages[i] === NaN) messages[i] = "NaN";
    }

    for (var i = 0; i < verticalPad; i++) {
      messages.push("");
      messages.unshift("");
    }

    var borderLine = this.RepeatCharacters(character, width);

    var maxMessageWidth = 0;
    for (var message of messages) {
      if (message.length > maxMessageWidth) maxMessageWidth = message.length;
    }

    var formattedMessages = [];

    for (var message of messages) {
      var beforePad = Math.floor((maxMessageWidth - message.length) / 2);
      var afterPad = maxMessageWidth - message.length - beforePad;

      message =
        this.RepeatCharacters(" ", beforePad + horizontalPad) +
        message +
        this.RepeatCharacters(" ", afterPad + horizontalPad);

      var beforePad = Math.floor((width - message.length) / 2);
      var afterPad = width - message.length - beforePad;

      message =
        this.RepeatCharacters(character, beforePad) +
        message +
        this.RepeatCharacters(character, afterPad);

      formattedMessages.push(message);
    }

    for (var i = 0; i < verticalSpace; i++) this.Echo();

    for (var i = 0; i < verticalMargin; i++) this.Echo(borderLine);

    for (var message of formattedMessages) this.Echo(message);

    for (var i = 0; i < verticalMargin; i++) this.Echo(borderLine);

    for (var i = 0; i < verticalSpace; i++) this.Echo();
  };

  this.Pause = function () {
    this.Command("pause");
  };
};
