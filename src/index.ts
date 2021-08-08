import puppeteer from "puppeteer";

import { BookStore } from "./BookStore";

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  console.log("Please wait a moment.....\n");

  const url = "https://www.goodreads.com/choiceawards/best-books-2020";

  const bookStore = new BookStore(page, url);

  try {
    await bookStore.fetchAllGenres();
    const genrePicked = await bookStore.userPickGenre();
    const bookData = await bookStore.fetchBookData(genrePicked);
    await bookStore.checkOut(bookData);
  } catch (e) {
    console.error(`Automation has failed with message: ${e.message}`);
    process.exit();
  }
};

main();
