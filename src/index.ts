// https://support.google.com/mail/answer/7190
// In Gmail, find mail (message) by id
// just type like this:
// rfc822msgid:CAA_p-vyCSYhMN=mGZBd7GibPgaBxNX7ayh4sheQgPYqCS97P3A@mail.gmail.com
// the id is after the ":" (colon).

//
//
// listFile parter to be 500K lines. // TODO

import nodeMbox from "node-mbox";

import { createReadStream, writeFileSync } from "node:fs";

import { MailParser, Headers as TyMailparserHeaders } from "mailparser";

import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";

// import { parse as parseCsvInto2dArr } from "csv-parse";

import { getEnvItemValue } from "./utils/mainUtils";
import { groundFolder, prepareOutputFolderStructure } from "./utils/stepUtils";
import {
  TyMainInfoForMail,
  TyMboxMailHeaders,
  TyZenMainInfoForMail,
} from "./types/mailparserTypes";
import { TyParticipantRole, addOneMailInfoToStats } from "./utils/statsBuilder";
import {
  combineTwoFamiliesIntoZenArr,
  getZenParticipantsFromFamily,
  prepareZenParticipantArrAsMainListItemStr,
} from "./utils/sweetUtils";

const allMailListFile =
  groundFolder.innerFolders.mboxStats.innerFiles.allMailList_csv;

const argNameForMboxFilePath = "mboxpath"; // main input !!!

const mboxFilePath = getEnvItemValue(argNameForMboxFilePath);

if (!mboxFilePath || typeof mboxFilePath !== "string") {
  throw new Error("mboxpath notation is not valid");
}

prepareOutputFolderStructure(mboxFilePath);

const mailbox = createReadStream(mboxFilePath);
const mbox = nodeMbox.MboxStream(mailbox, {
  /* options */
});

const step = {
  v: 0,
};

const counter = {
  v: 0,
};

export const mainRoles: TyParticipantRole[] = ["sender", "receiver"];

const analyzeMbox = () => {
  const scanHeaders = (headersMap: TyMailparserHeaders): void => {
    step.v += 1;
    const headers = headersMap as TyMboxMailHeaders;

    try {
      const init_From = headers.get("from");
      const init_To = headers.get("to");
      const init_deliveredTo = headers.get("delivered-to");
      const init_cc = headers.get("cc");
      const init_bcc = headers.get("bcc");
      //
      const init_date = headers.get("date");
      const init_messageId = headers.get("message-id");

      const initialMainInfoForThisMail: TyMainInfoForMail = {
        from: init_From,
        to: init_To,
        "delivered-to": init_deliveredTo,
        cc: init_cc,
        bcc: init_bcc,
        //
        date: init_date,
        ["message-id"]: init_messageId,
      };

      const zenMainInfoForThisMail: TyZenMainInfoForMail = {
        from: getZenParticipantsFromFamily({
          family: initialMainInfoForThisMail.from,
          step: step.v,
          familyKind: "from",
        }),
        zenTo: combineTwoFamiliesIntoZenArr({
          step: step.v,
          twoFamilies: [
            {
              familyKind: "to",
              participationInfo: initialMainInfoForThisMail.to,
            },
            {
              familyKind: "delivered-to",
              participationInfo: initialMainInfoForThisMail["delivered-to"],
            },
          ],
        }),
        cc: getZenParticipantsFromFamily({
          family: initialMainInfoForThisMail.cc,
          step: step.v,
          familyKind: "cc",
        }),
        bcc: getZenParticipantsFromFamily({
          family: initialMainInfoForThisMail.bcc,
          step: step.v,
          familyKind: "bcc",
        }),
        //
        date: initialMainInfoForThisMail.date,
        "message-id": initialMainInfoForThisMail["message-id"],
      };

      const mainInfoForThisMail_asArr_forCsvLine = [
        // sender
        prepareZenParticipantArrAsMainListItemStr({
          messageId: zenMainInfoForThisMail["message-id"],
          ptcProp: "address",
          step: step.v,
          zenFamilyKind: "from",
          zenParticipants: zenMainInfoForThisMail.from,
        }),
        prepareZenParticipantArrAsMainListItemStr({
          messageId: zenMainInfoForThisMail["message-id"],
          ptcProp: "AddressAndName",
          step: step.v,
          zenFamilyKind: "from",
          zenParticipants: zenMainInfoForThisMail.from,
        }),

        // receiver
        prepareZenParticipantArrAsMainListItemStr({
          messageId: zenMainInfoForThisMail["message-id"],
          ptcProp: "address",
          step: step.v,
          zenFamilyKind: "zenTo",
          zenParticipants: zenMainInfoForThisMail.zenTo,
        }),

        // cc
        prepareZenParticipantArrAsMainListItemStr({
          messageId: zenMainInfoForThisMail["message-id"],
          ptcProp: "address",
          step: step.v,
          zenFamilyKind: "cc",
          zenParticipants: zenMainInfoForThisMail.cc,
        }),

        // bcc
        prepareZenParticipantArrAsMainListItemStr({
          messageId: zenMainInfoForThisMail["message-id"],
          ptcProp: "address",
          step: step.v,
          zenFamilyKind: "bcc",
          zenParticipants: zenMainInfoForThisMail.bcc,
        }),

        //
        zenMainInfoForThisMail.date?.toISOString() || "",
        zenMainInfoForThisMail["message-id"],
      ];

      const csvCurrLineForAllMailListFile = stringify2dArrIntoCsv(
        [mainInfoForThisMail_asArr_forCsvLine],
        {
          header: false,
          columns: undefined,
        },
      );

      writeFileSync(
        allMailListFile.pathAbsOrRel,
        csvCurrLineForAllMailListFile,
        {
          flag: "a+",
        },
      );

      // maybe more logical for "addOneMailInfoToStats" to be here:
      addOneMailInfoToStats(mainInfoForThisMail, step.v);

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
    console.log("finished one reading mbox file-->>>><<<>>>>>>>>==", counter.v);

    setTimeout(() => {
      const currCount = counter.v;
      console.log("dfin-------le", currCount);

      setTimeout(() => {
        if (currCount === counter.v) {
          console.log("success");
        } else {
          console.log("Warning: Maybe count is incorrect:", counter.v);

          const theMapMap =
            groundFolder.innerFolders.mboxStats.innerFolders.results.innerFiles
              .frequencySenderAddress.freqMap;

          const asSortedArr = [...theMapMap].sort((a, b) => b[1] - a[1]);

          console.log(
            theMapMap.size,
            asSortedArr.length,
            JSON.stringify(asSortedArr.slice(0, 10)),
          );
        }
      }, 7000);
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
