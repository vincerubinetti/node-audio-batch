require("../utilities/tools.js")();

function Process(path, name, extension) {
  Trim(path + name + extension, path + name + "_trim.wav");
  Normalize(path + name + "_trim.wav", path + name + "_normalize.wav");
  MakeFolder("processed");
  CopyFile(path + name + "_normalize.wav", path + "processed/" + name + extension);
  DeleteFile(path + name + "_trim.wav");
  DeleteFile(path + name + "_normalize.wav");
}

BatchProcess(Process);
Header("all done!");
Pause();
