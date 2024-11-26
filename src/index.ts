/*

gmail-mbox-stats v1.2.3
Created by leodevbro (Levan Katsadze)
* leodevbro@gmail.com
* linkedin.com/in/leodevbro
* github.com/leodevbro
* facebook.com/leodevbro

If you feel like donating
* buymeacoffee.com/leodevbro
* ko-fi.com/leodevbro

*/

// ===
// ===
// ===

/*

https://support.google.com/mail/answer/7190
In Gmail, find mail (message) by id
just type like this:
rfc822msgid:CAA_p-vyCSYhMN=mGZBd7GibPgaBxNX7ayh4sheQgPYqCS97P3A@mail.gmail.com
the id is after the ":" (colon).

*/

//
//
//

// TODO: listFile parter to be 500K lines. // TODO

import nodeMbox from "node-mbox";
import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";

import { createReadStream, writeFileSync } from "node:fs";

// import { parse as parseCsvInto2dArr } from "csv-parse";

import { getSlimDateTime, waitSomeSeconds } from "./utils/mainUtils";
import {
  generateGeneralStats,
  prepareOutputFolderStructure,
  writeStatsIntoFiles,
} from "./utils/stepUtils";

import { slimStartDateTime, str } from "./constants";
import { groundFolder } from "./utils/groundFolderMaker";
import { step } from "./gloAccu";
import { processOneMail } from "./utils/mailParsingUtils";
import { mboxFilePath } from "./basicStarter";

// import { handleOneLineOfMailboxIndex } from "./utils/mailboxIndexMaker";

// console.log("test AA BB 01");
const startDateTimeStr = `Start datetime: ${slimStartDateTime.v}`;

console.time("Full Execution Time");

export const logExecutionStartMessage = () => {
  console.log("\n");

  console.log(str.authoringText + "\n\n");

  console.log("Started MBOX file analyzation");
  // console.log("Relax a bit, here you can see the progress:\n");

  console.log(startDateTimeStr);
};

const logExecutionEndMessage = () => {
  console.log("\n");
  console.log(startDateTimeStr);
  console.log(`->End datetime: ${getSlimDateTime(new Date())}\n`);
  console.timeEnd("Full Execution Time");
  console.log("\n");
  console.log(str.authoringText + "\n");
  console.log(str.donationText);
  console.log("\n");
  console.log("\n");
};

prepareOutputFolderStructure(mboxFilePath);

const checkFullCount = async (): Promise<boolean> => {
  step.countOfFullCountCheckForTimer += 1;

  await waitSomeSeconds(10);

  console.log("So far processed mails:", step.succeededV);

  if (step.succeededV === step.v) {
    console.log("Success! Full count:", step.succeededV);
    return true;
  } else {
    if (step.countOfFullCountCheckForTimer > 720) {
      // 720 * 10 seconds = 2 hours
      console.log(
        `Took too long --- could not process all ${step.v} mails. Processed mails: ${step.succeededV}`,
      );
      return false;
    }
    return await checkFullCount();
  }
};

const analyzeMbox = () => {
  const mailboxReadStream = createReadStream(mboxFilePath);
  const mbox = nodeMbox.MboxStream(mailboxReadStream, {
    /* options */
  });

  //
  //

  mbox.on("data", async (msg) => {
    step.v += 1; // This is count of all mails, not only succesfuly proccessed mails.

    try {
      processOneMail(msg);
    } catch (err) {
      console.log(err);
    }
  });

  mbox.on("error", function (err) {
    console.log("got an error", err);
  });

  mbox.on("finish", async function () {
    console.log(
      `Finished accessing all the mails (${step.v}), but not yet finished proccessing them. Please wait.`,
    );

    await checkFullCount();

    console.log("Please wait several seconds more to generate stats files.");

    await waitSomeSeconds(3);

    writeStatsIntoFiles(); // this does not include generalStats,
    //                        because generalStats needs writeStatsIntoFiles function to execute first to calculate general stats.
    //                        So, The generalStats will be handled down below.

    //=======
    const generalStats2dArrNotation = generateGeneralStats().generalStats2dArr;
    // ----

    const generalStatsPath =
      groundFolder.innerFolders.mboxStats.innerFiles.generalStats.pathAbsOrRel;

    const finalDataStringOfGeneralStats = stringify2dArrIntoCsv(
      generalStats2dArrNotation,
      {
        header: false,
        columns: undefined,
      },
    );

    writeFileSync(generalStatsPath, finalDataStringOfGeneralStats, {
      flag: "a+",
    });

    logExecutionEndMessage();
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
