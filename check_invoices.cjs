require("dotenv").config();
const { db } = require("./server/db/index.cjs");
const { invoices } = require("./server/db/schema.cjs");

async function checkInvoices() {
  try {
    const allInvoices = await db.select().from(invoices);
    console.log("Total invoices:", allInvoices.length);
    console.log("Invoices:", JSON.stringify(allInvoices, null, 2));
  } catch (error) {
    console.error("Error fetching invoices:", error);
  } finally {
    process.exit();
  }
}

checkInvoices();
