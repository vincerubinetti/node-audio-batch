require("../utilities/tools.js")();

function Process(path, name, extension) {
  WavToOgg(path + name + extension, path + name + ".ogg");
  // OggToWav(path+name+extension, path+name+'.wav');
}

BatchProcess(Process);
Header("all done!");
Pause();
