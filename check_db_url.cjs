require("dotenv").config();
const url = process.env.DATABASE_URL;
if (url) {
  console.log("Protocol:", url.split("://")[0]);
  console.log("Host:", url.split("@")[1]?.split("/")[0]);
} else {
  console.log("DATABASE_URL not set");
}
