import nodeMbox from "node-mbox";

import { createReadStream, writeFileSync } from "node:fs";

import { MailParser, Headers as TyMailparserHeaders } from "mailparser";

// import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";

// import { parse as parseCsvInto2dArr } from "csv-parse";

import { getEnvItemValue } from "./utils/mainUtils";
import { groundFolder, prepareOutputFolderStructure } from "./utils/stepUtils";
import { TyMboxMailHeaders } from "./types/mailparserTypes";

const allMailListFile =
  groundFolder.innerFolders.mboxStats.innerFiles.allMailList_csv;

const resultsInnerFiles =
  groundFolder.innerFolders.mboxStats.innerFolders.results.innerFiles;

const argNameForMboxFilePath = "mboxpath"; // main input !!!

const mboxFilePath = getEnvItemValue(argNameForMboxFilePath);

if (!mboxFilePath || typeof mboxFilePath !== "string") {
  throw new Error("mboxPath notation is not valid");
}

// const mainOutputFilename = "tempFilePath"; // TODO:

prepareOutputFolderStructure(mboxFilePath);

const mailbox = createReadStream(mboxFilePath);
const mbox = nodeMbox.MboxStream(mailbox, {
  /* options */
});

const counter = {
  v: 0,
};

const analyzeMbox = () => {
  const scanHeaders = (headersMap: TyMailparserHeaders): void => {
    const headers = headersMap as TyMboxMailHeaders;

    try {
      const senderAddress = headers.get("from").value[0].address;
      const currFreqMap = resultsInnerFiles.frequencySenderAddress.freqMap;
      currFreqMap.set(senderAddress, (currFreqMap.get(senderAddress) || 0) + 1);

      // console.log('From   :', headers.get('from').value[0].address);
      // console.log('Subject:', headers.get('subject'), '\n');

      writeFileSync(allMailListFile.pathAbsOrRel, `${senderAddress}\n`, {
        flag: "a+",
      });
      counter.v += 1;
    } catch (err) {
      console.log(err);
    }

    // just for CLI visualization:
    const asStr = String(counter.v);
    const le = asStr.length;
    if (asStr.slice(le - 3) === "000") {
      console.log(counter.v);
    }
  };

  mbox.on("data", function (msg) {
    // parse message using MailParser

    const mailparser = new MailParser({
      // streamAttachments: true
    });
    mailparser.on("headers", scanHeaders);
    mailparser.write(msg);
    mailparser.end();
  });

  mbox.on("error", function (err) {
    console.log("got an error", err);
  });

  mbox.on("finish", function () {
    console.log(
      "finished one reading mbox file-->>>><<<>>>>>>>>==",
      counter.v,
    );

    setTimeout(() => {
      const currCount = counter.v;
      console.log("dfin-------le", currCount);

      setTimeout(() => {
        if (currCount === counter.v) {
          console.log("success");
        } else {
          console.log("Warning: Maybe count is incorrect:", counter.v);
        }
      }, 3000);
    }, 2);
  });
};

analyzeMbox();

/*

const myData = [
  ['"""""""""5"`jj\t\t\t', 'k88k\t\t\t', `7\t\t\t`],
  ['"""5"`jj\t\t\t', 'k88\n\n\n\n\n\n\n\n\\45k\t\t\t', `52v"'\`\t\t\t`],
];

console.log('haaaa_start');
try {
  // const opts = {};
  // const parser = new Parser({
  //   header: false,
  // });
  // const csv = parser.parse(myData);

  const csv = stringify2dArrIntoCsv(myData, {
    header: false,
    columns: undefined,
  });

  // console.log(csv);
  wr_stream.write(csv);
  const countOfNls = csv.split('').reduce((accu, curr) => {
    if (curr === '\n') {
      return accu + 1;
    }
    return accu;
  }, 0);
  console.log(countOfNls);

  setTimeout(() => {
    // Using the first line of the CSV data to discover the column names
    const rs = createReadStream(mainOutputFilename);
    const parser = parseCsvInto2dArr({ columns: false }, function (err, data) {
      console.log(data);
      
    });
    rs.pipe(parser);
  }, 3);
} catch (err) {
  console.error(err);
}
console.log('haaaa_end', process.argv, process.env.npm_config_aaabbbrt); // npm run go --aaabbbrt="sdfs"

*/

export const logExecutionMessage = () => {
  const executionMessage = "Started MBOX file analyzation";
  console.log(executionMessage);
};
