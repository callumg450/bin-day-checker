const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getBinDay(postcode) {
  console.log(`Checking bin collection day for postcode: ${postcode}`);
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Navigate to your local council's bin lookup page
  await page.goto('https://my.gravesham.gov.uk/en/AchieveForms/?form_uri=sandbox-publish://AF-Process-22218d5c-c6d6-492f-b627-c713771126be/AF-Stage-905e87c1-144b-4a72-8932-5518ddd3e618/definition.json&redirectlink=%2Fen&cancelRedirectLink=%2Fen&consentMessage=yes');

  // Wait for the iframe to be attached and loaded
  const frame = await page.frame({ name: 'fillform-frame-1' });

  // Wait for text box to appear
  await frame.waitForSelector('#postcode_search', { state: 'visible' });
  // 2. Fill in the postcode field
  await frame.fill('#postcode_search', postcode);

  // Wait for the address dropdown to be visible
  await frame.waitForSelector('select#YourAddress');

  //Pick an option from the dropdown
  await frame.selectOption('select#YourAddress', '10012024830');


  await frame.waitForSelector('#table2', { state: 'visible' });

  //Extract the bin day text
  const binData = await frame.$$eval('#table2 tr', rows => {
    return Array.from(rows)
      .slice(1) //Remove the header row
      .map(row => {
        const cells = row.querySelectorAll('td');
        const rawDate = cells[0]?.innerText ? cells[0].innerText.trim() : '';
        const rawBinType = cells[1]?.innerText ? cells[1].innerText.trim() : '';
        const match = rawDate ? rawDate.match(/\d{2}\/\d{2}\/\d{4}/) : null;
        const date = match ? match[0] : null;
        const binType = rawBinType.includes('Recycling') ? 'Recycling' : 'Rubbish';
        return {
          date,
          binType
        };
      });
  });

  console.log(`Bin collection day for ${postcode}`);
  binData.forEach(data => {
    console.log(`Type: ${data.binType}, Date: ${data.date}`);
  });
  console.log(binData);
  await browser.close();

  // Store results in the database
  console.log(`Storing results in the database for postcode: ${postcode}`);
  for (const data of binData) {
    if (data.date && data.binType) {
      // Convert DD/MM/YYYY to YYYY-MM-DD for JS Date
      const [day, month, year] = data.date.split('/');
      const isoDate = `${year}-${month}-${day}`;
      await prisma.binDay.upsert({
        where: {
          postcode_date_binType: {
            postcode,
            date: new Date(isoDate),
            binType: data.binType
          }
        },
        update: {},
        create: {
          postcode,
          date: new Date(isoDate),
          binType: data.binType
        }
      });
    }
  }

  await prisma.$disconnect();
}

getBinDay('DA11 9AA');