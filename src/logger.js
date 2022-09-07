import fs from "fs";

const logPath = "./logs.txt";


export default {
    error(error, firstLine){
        let content = firstLine + '\n "' + JSON.stringify(error) + '"\n\n\n';
        fs.writeFile(logPath, content, { flag: "a+" }, (err) => {
            if (err) {
                console.error(err);
            }
            // file written successfully
        });
    }
}
