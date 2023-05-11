import MiniSearch from "minisearch";

// A collection of documents for our examples
const documents = [
  {
    id: 1,
    title: "Moby Dick",
    text: ["Call me Ishmael. Some years ago...", "abc"],
    category: ["fiction", "fiction2"],
  },
  {
    id: 2,
    title: "Zen and the Art of Motorcycle Maintenance",
    text: ["I can see by my watch...", "def"],
    category: ["fiction", "fiction2"],
  },
  {
    id: 3,
    title: "Neuromancer",
    text: ["The sky above the port was...", "opq"],
    category: ["fiction", "fiction2"],
  },
  {
    id: 4,
    title: "Zen and the Art of Archery",
    text: ["At first sight it must seem...", "rst"],
    category: ["non-fiction", "non-fiction2"],
  },
  // ...and more
];

let miniSearch = new MiniSearch({
  fields: ["title", "text"], // fields to index for full-text search
  storeFields: ["title", "category", "text"], // fields to return with search results
});

// Index all documents
miniSearch.addAll(documents);

// Search with default options
let results = miniSearch.search("abc def");

console.log(results);
