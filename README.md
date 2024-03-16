# gmail-mbox-stats

[![npm version](https://img.shields.io/npm/v/gmail-mbox-stats.svg?style=flat)](https://www.npmjs.com/package/gmail-mbox-stats)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/leodevbro/gmail-mbox-stats)

`gmail-mbox-stats` is a very simple tool to analyze your Gmail mailbox.

- Find the sender which sent most mails.
- Find the receiever where you sent most mails.
  <br />
  <br />
- Find the address which is most often placed in CC by you.
- Find the address which is most often placed in CC by others.
  <br />
  <br />
- Find the address which is most often placed in BCC by you.
- Find the address which is most often placed in BCC by others.
  <br />
  <br />
- And more.
  <br />
  <br />
  <br />

## Video instruction:

Coming soon...

<br />
<br />

## Textual instruction:

- Download Gmail data from <a href="https://takeout.google.com/" target="_blank">Google Takeout</a> (Preferably select 'Include all messages in Mail', it will include all mail, not just inbox or just outbox/spam/archive). If your mailbox has 100K mails, the downloaded data can be 10 GB or more. So, be ready to deal with a large file. If it is too large, it may not be a single archive file, but multipart archive files, like split-files of ZIP.

- Extract MBOX file from the Gmail data archive.

- Make sure you have installed <a href="https://nodejs.org/" target="_blank">NodeJS</a>. It is available for Windows, Mac and also Linux.

- Open terminal (preferably in the same folder where MBOX file is located) and run the command with this syntax:<br />
  `npx gmail-mbox-stats mymail="<your email address>" mboxpath="<mbox file path>"`

  for example:<br />
  `npx gmail-mbox-stats mymail="leodevbro@gmail.com" mboxpath="./All mail Including Spam and Trash.mbox"`<br />
  the notation `./` means to find the file `All mail Including Spam and Trash.mbox` in the current folder of terminal.

  <br />
  <br />
  <br />
  <br />
  That's it.<br />
  Now just see the results:
  <br />
  <br />
  <br />
  <br />
  <br />

  It will take probably 5-10-15 seconds to analyze 1000 mails,<br />
  about 100 seconds for 10K mails,<br />
  about 1000 seconds (about 17 minutes) for 100K mails and so on.<br />

- When it finishes, the terminal will log initial information like this:

```
Success. Full count: 14577
Full count of mails where sender is me: 425
Full count of mails where sender is not me: 14152
```

- Also, there will be a new folder named "mboxStats" with current local datetime, <br />
  like this: `mboxStats_2024-03-10_16-52-06`<br />
  in the same folder where the MBOX file is located.<br />

- In the 'mboxStats' folder, there will be two folders:<br />
  `resultsForMailsWithSenderAsMe` - the stats for only the mails where sender is you.<br />
  `resultsForMailsWithSenderAsNotMe` - the stats for only the mails where sender is not you.<br />
  In both folders, there will be `.csv` files of stats. These are very simple csv files, so you can open them in any text editor (Notepad, Sublime), or Google Sheets, or Microsoft Excel.

Here is what the full folder structure looks like:

```
All mail Including Spam and Trash.mbox

mboxStats_2024-03-10_16-52-06
    resultsForMailsWithSenderAsMe
        senderIsMeFrequencyBccAddress.csv
        senderIsMeFrequencyCcAddress.csv
        senderIsMeFrequencyReceiverAddress.csv --- Here you can find the receiever where you sent most mails
        senderIsMeFrequencySenderAddress.csv
        senderIsMeFrequencySenderAddressAndName.csv
        senderIsMeFrequencySenderDomain.csv

    resultsForMailsWithSenderAsNotMe
        senderIsNotMeFrequencyBccAddress.csv
        senderIsNotMeFrequencyCcAddress.csv
        senderIsNotMeFrequencyReceiverAddress.csv
        senderIsNotMeFrequencySenderAddress.csv --- Here you can find the sender which sent most mails
        senderIsNotMeFrequencySenderAddressAndName.csv
        senderIsNotMeFrequencySenderDomain.csv

```

Now, for example, let's see what's inside the file `senderIsNotMeFrequencySenderAddress.csv`

```
notifications@github.com,1011,7.14%,14152,senderIsNotMeFrequencySenderAddress --- here, first line has also the sum-count (14152) which is the sum of all counts: 1011, 895, 443 and so on. Also, you can see the name of the file.
jobalerts-noreply@linkedin.com,895,6.32%,
noreply@medium.com,443,3.13%,
admin@crypto-careers.com,325,2.30%,
no-reply@reply.experteer.co.uk,263,1.86%,
noreply@glassdoor.com,247,1.75%,
english-personalized-digest@quora.com,233,1.65%,
news@email.experteer.com,221,1.56%,
hello@digest.producthunt.com,218,1.54%,
tbcconcept@tbc.ge,181,1.28%,
vsmarketplace@microsoft.com,179,1.26%,
...
...
...
...
All files have the same structure like this file.
```

Thank you.

<p>My name is <a href="https://leodevbro.github.io">Levan Katsadze (ლევან კაცაძე)</a>, 1995-03-03, from Tbilisi, <a href="https://en.wikipedia.org/wiki/Georgia_(country)">Georgia (Not USA)</a>.</p>

<p float="left">
  <a style="margin-right: 12px;" href="https://www.facebook.com/leodevbropage" target="_blank"><img src="https://raw.githubusercontent.com/leodevbro/vscode-blockman/main/demo-media/still-image/social/fb-logo2.png" alt="facebook logo" style="height: 44px !important; width: auto !important;" /></a>
  <a style="margin-right: 12px;" href="https://www.youtube.com/@leodevbro" target="_blank"><img src="https://raw.githubusercontent.com/leodevbro/vscode-blockman/main/demo-media/still-image/social/yt-logo3.png" alt="youtube logo" style="height: 44px !important; width: auto !important;" /></a>
</p>

If you feel like donating:

<p float="left">
  <a style="float: left; margin-right: 12px;" href="https://www.buymeacoffee.com/leodevbro" target="_blank"><img src="https://raw.githubusercontent.com/leodevbro/vscode-blockman/main/demo-media/still-image/donation/buy-me-a-coffee_2.png" alt="Buy Me A Coffee" style="height: 44px !important; width: auto !important;" /></a>
  <a style="margin-right: 12px;" href="https://ko-fi.com/leodevbro" target="_blank"><img src="https://raw.githubusercontent.com/leodevbro/vscode-blockman/main/demo-media/still-image/donation/ko-fi_2.png" alt="ko-fi" style="height: 44px !important; width: auto !important;" /></a>
</p>

<br />
<br />
<br />
