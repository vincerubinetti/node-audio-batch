require("../utilities/tools.js")();

function Process(path, name, extension) {
  WavToMp3(path + name + extension, path + name + ".mp3");
  // Mp3ToWav(path+name+extension, path+name+'.wav');
}

BatchProcess(Process);
Header("all done!");
Pause();
