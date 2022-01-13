import axios from "axios";
import cheerio from "cheerio";
import mysql from "mysql";

const connectionString = process.env.DATABASE_URL || "";
const connection = mysql.createConnection(connectionString);
connection.connect();

const getCharacterPageName = async () => {
  const url = "https://throneofglass.fandom.com/wiki/Category:Characters";

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const categories = $("ul.category-page__members-for-char");

  const characterPageNames: any[] = [];

  for (let i = 0; i < categories.length; i++) {
    const ul = categories[i];
    const charactersList = $(ul).find("li.category-page__member");
    for (let j = 0; j < charactersList.length; j++) {
      const li = charactersList[j];
      const path = $(li).find("a.category-page__member-link").attr("href");
      const name = path?.replace("/wiki/", "");
      characterPageNames.push(name);
    }
  }
  return characterPageNames;
};

const getCharacterInfo = async (charactereName: string) => {
  const url = "https://throneofglass.fandom.com/wiki/";
  const { data } = await axios.get(`${url}${charactereName}`);
  const $ = cheerio.load(data);
  let name = $('h2[data-source="name"]').text().trim();
  const species = $('div[data-source="species"] > div.pi-data-value.pi-font')
    .text()
    .trim();
  const image = $(".image.image-thumbnail >img").attr("src");

  if (!name) {
    name = charactereName.replace("_", " ");
  }
  return { name, species, image };
};

const loadCharacters = async () => {
  const characterPageNames = await getCharacterPageName();
  const characterInfoPromises = characterPageNames.map((charName) =>
    getCharacterInfo(charName)
  );
  const characters = await Promise.all(characterInfoPromises);
  const values = characters.map((char, i) => [
    i,
    char.name,
    char.species,
    char.image,
  ]);
  const sql = "INSERT INTO Characters (id, name, species, image) VALUES ?";
  connection.query(sql, [values], (err) => {
    if (err) {
      console.log("erroou");
      return;
    }
    console.log("sucessooo");
  });
};

loadCharacters();
