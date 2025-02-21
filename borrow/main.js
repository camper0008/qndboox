async function main() {
  const books = await fetchBooks();
  const container = document.querySelector("#which-book");
  container.replaceChildren(...renderBooks(books, "borrow"));
}

main();
