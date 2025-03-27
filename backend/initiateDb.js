import fs from "fs";

const initiateDb = () => {
  try {
    fs.readFileSync("./tododb.json");
  } catch (error) {
    try {
      fs.writeFileSync("./tododb.json", "");
    } catch (error) {
      console.log(error);
    }
  }
};

export { initiateDb };
