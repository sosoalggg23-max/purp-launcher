const feedUrl = "https://raw.githubusercontent.com/sosoalggg23-max/purp-launcher/main/publications.json";
const feed = document.querySelector("#publications");
const formatter = new Intl.DateTimeFormat("ru", { dateStyle: "long" });

function publicationCard(item) {
  const card = document.createElement("article");
  card.className = "news-card";
  const content = document.createElement("div");
  const date = document.createElement("p");
  date.className = "meta";
  const label = item.source === "announce" ? "Объявление" : "Новость PURP";
  date.textContent = label + " · " + formatter.format(new Date(item.date));
  const heading = document.createElement("h3");
  heading.textContent = item.title.ru;
  const description = document.createElement("p");
  description.textContent = item.text.ru;
  content.append(date, heading, description);
  if (typeof item.link === "string" && URL.canParse(item.link) && new URL(item.link).protocol === "https:") {
    const link = document.createElement("a");
    link.href = item.link;
    link.textContent = "Подробнее ↗";
    content.append(link);
  }
  card.append(content);
  return card;
}

async function showPublications() {
  const response = await fetch(feedUrl, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return;
  const publications = await response.json();
  if (!Array.isArray(publications)) return;
  const now = Date.now();
  const visible = publications.filter(item =>
    ["purp", "announce"].includes(item?.source) &&
    typeof item.title?.ru === "string" && item.title.ru.trim() &&
    typeof item.text?.ru === "string" && item.text.ru.trim() &&
    Date.parse(item.date) <= now &&
    (!item.expires || Date.parse(item.expires) > now)
  );
  visible.sort((first, second) => Date.parse(second.date) - Date.parse(first.date));
  feed.append(...visible.slice(0, 4).map(publicationCard));
}

// The release and roadmap remain visible if the live feed is unavailable.
void showPublications().catch(() => {});
