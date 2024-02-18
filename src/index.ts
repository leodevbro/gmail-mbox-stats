// @ts-ignore
import { MboxStream } from "node-mbox";

import { createReadStream, createWriteStream } from "node:fs";
// const split = require('line-stream');

import { MailParser, type Headers } from "mailparser";

import { stringify as stringify2dArrIntoCsv } from "csv-stringify/sync";
import { parse as parseCsvInto2dArr } from "csv-parse";

import { qqqqwqwqqw } from "./somets/zzz";

// const mboxFilename = './All_mail_Including_Spam_and_Trash.mbox';
const mboxFilename =
  "D:/fast/_senders/Takeout/Mail_new/All_mail_Including_Spam_and_Trash.mbox";

const mainOutputFilename = "./mboxStats/my_file.csv"; // TODO:

const mailbox = createReadStream(mboxFilename);
const mbox = MboxStream(mailbox, {
  /* options */
});

const counter = {
  v: 0,
};

const myFn = () => {
  const wr_stream = createWriteStream(mainOutputFilename);

  const hFn = (headers: Headers): void => {
    if (counter.v === 0) {
      console.log(headers.get("from"));
      console.log(headers.get("to"));
      // console.log(typeof msg);
    }

    try {
      // @ts-ignore
      const senderAddress = headers.get("from").value[0].address;

      // console.log('From   :', headers.get('from').value[0].address);
      // console.log('Subject:', headers.get('subject'), '\n');

      // wr_stream.once('open', function(fd) {
      counter.v += 1;
      wr_stream.write(`${senderAddress}\n`);
      // wr_stream.end();
      // });
    } catch (err) {
      console.log(err);
    }

    const asStr = String(counter.v);
    const le = asStr.length;
    if (asStr.slice(le - 3) === "000") {
      console.log(counter.v);
    }
  };

  // @ts-ignore
  mbox.on("data", function (msg: Buffer) {
    // parse message using MailParser

    const mailparser = new MailParser({
      // streamAttachments: true
    });
    mailparser.on("headers", hFn);
    mailparser.write(msg);
    mailparser.end();
    // mailparser.off('headers', hFn);
  });

  // @ts-ignore
  mbox.on("error", function (err: any) {
    console.log("got an error", err);
  });

  // @ts-ignore
  mbox.on("finish", function () {
    console.log(
      "dfinish ed one reading mbox file-->>>><<<>>>>>>>>==",
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

console.log("haaaa_end", process.argv, process.env.npm_config_envi); // npm run go --aaabbbrt="sdfs"
console.log("imushavaa");

myFn();

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

console.log("qqqqwqwqqw::::", qqqqwqwqqw);

export const huhuhu = 714;
