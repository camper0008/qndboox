async function main() {
  const books = await fetchBooks();
  const container = document.querySelector("#which-book");
  if (books.every((book) => getBorrower(book.key) === null)) {
    const h = document.createElement("h2");
    h.textContent = "All books are returned";
    container.append(h);
    return;
  }
  container.replaceChildren(...renderBooks(books, "return"));
}

main();
