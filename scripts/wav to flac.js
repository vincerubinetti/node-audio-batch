require("../utilities/tools.js")();

function Process(path, name, extension) {
  WavToFlac(path + name + extension, path + name + ".flac");
  // FlacToWav(path+name+extension, path+name+'.wav');
}

BatchProcess(Process);
Header("all done!");
Pause();
