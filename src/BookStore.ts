import { Page } from "puppeteer";
import * as rl from "readline";

interface Genre {
  text: string;
  link: string;
}
export class BookStore {
  url: string;

  page: Page;

  genres: Array<Genre>;

  constructor(page: Page, url: string) {
    this.page = page;
    this.genres = [];
    this.url = url;
  }

  public fetchAllGenres = async () => {
    await this.page.goto(this.url);

    const genreElements = await this.page.$$(".category");

    for (let el of genreElements) {
      const data = await this.page.evaluate((e) => {
        let txt = e.querySelector("h4")!.innerText;
        let link = e.querySelector("a")!.href;
        return {
          text: txt,
          link: link,
        };
      }, el);

      this.genres.push(data);
    }
  };

  public userPickGenre = async () => {
    this.genres.forEach((element, i) => {
      console.log(`${i}. ${element.text}`);
    });

    let promptedData: number;

    try {
      promptedData = await this.prompt(
        "\n Please enter the number of the Genre you want to read: \n"
      );
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
    return this.genres[promptedData];
  };

  public fetchBookData = async (data: Genre) => {
    await this.page.goto(data.link);

    const element = await this.page.$(".winningTitle");

    const text = await this.page.evaluate((e) => e.textContent, element);

    return text;
  };

  public checkOut = async (name: string) => {
    await this.page.goto(`https://amazon.com/s?k=${encodeURIComponent(name)}`);
    const element = await this.page.$$(".s-latency-cf-section");
    const bookLink = await this.page.evaluate((e) => {
      let link = e.querySelector("a")!.href;
      return link;
    }, element[0]);

    await this.page.goto(bookLink);

    await this.page.click("input#add-to-cart-button");

    await this.page.waitForNavigation();

    await this.page.click("a#hlb-ptc-btn-native");
  };

  private prompt = async (question: string) => {
    const r = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
    return new Promise<number>((resolve, error) => {
      r.question(question, (answer: string) => {
        r.close();
        if (this.genres[Number(answer)]) {
          resolve(Number(answer));
        } else {
          error(
            "Please enter number from 0 to " + (this.genres.length - 1) + "\n"
          );
        }
      });
    });
  };
}
