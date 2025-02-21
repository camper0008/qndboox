function getBorrower(key) {
  return localStorage.getItem(key);
}

function renderBooks(books, variant) {
  return books
    .filter((book) =>
      (variant === "borrow") ||
      (variant === "return" && getBorrower(book.key) !== null)
    )
    .map((book) => {
      const bookEl = document.createElement("div");
      bookEl.classList.add("book");

      if (book.image) {
        const imgEl = document.createElement("img");
        imgEl.classList.add("img");
        imgEl.src = book.image;
        bookEl.append(imgEl);
      } else {
        const imgEl = document.createElement("span");
        imgEl.textContent = "404";
        imgEl.classList.add("img");
        bookEl.append(imgEl);
      }
      const blurbEl = document.createElement("div");
      {
        const titleEl = document.createElement("h2");
        titleEl.textContent = book.title;

        const summaryEl = document.createElement("p");
        summaryEl.textContent = book.summary ?? "";

        const buttonEl = document.createElement("button");

        const borrower = getBorrower(book.key);
        if (variant === "borrow") {
          if (borrower !== null) {
            buttonEl.disabled = true;
            buttonEl.textContent = `Loaned by '${borrower}'`;
          } else {
            buttonEl.textContent = "Borrow";
          }
        } else if (variant === "return") {
          if (!borrower) {
            throw new Error("unreachable: we filtered away unborrowed books");
          }
          buttonEl.textContent = `Return (Borrowed by '${borrower}')`;
        } else {
          throw new Error(`unreachable: invalid variant '${variant}'`);
        }
        if (!buttonEl.disabled) {
          buttonEl.addEventListener("click", () => {
            if (variant === "borrow") {
              borrowBook(book.key);
            } else if (variant === "return") {
              returnBook(book.key);
            } else {
              throw new Error(`unreachable: invalid variant '${variant}'`);
            }
          });
        }
        blurbEl.append(titleEl, summaryEl, buttonEl);
      }

      bookEl.append(blurbEl);
      return bookEl;
    });
}

async function fetchBooks() {
  return await fetch("/books.json").then((v) => v.json());
}

function borrowBook(key) {
  if (getBorrower(key) !== null) {
    throw new Error(`unreachable: attempted to borrow borrowed book '${key}'`);
  }
  const lender = prompt("Enter something identifiable about you:");
  if (!lender) {
    return;
  }
  localStorage.setItem(key, lender);
  location.reload();
}
function returnBook(key) {
  const user = getBorrower(key);
  if (user === null) {
    throw new Error(
      `unreachable: attempted to return unborrowed book '${key}'`,
    );
  }
  const confirmed = confirm("Are you sure?");
  if (!confirmed) {
    return;
  }
  localStorage.removeItem(key);
  location.reload();
}

async function assertBooksValid() {
  const books = await fetchBooks();
  const seenKeys = new Set();
  for (const book of books) {
    if (!book.title) {
      throw new Error(`book has no title`);
    }
    if (!book.key) {
      throw new Error(`book with title '${book.title}' has no key`);
    }
    if (seenKeys.has(book.key)) {
      throw new Error(`book with title '${book.title}' has duplicated key`);
    }
    seenKeys.add(book.key);
    for (const key in books) {
      if (!(["key", "title", "image", "summary"].contains(key))) {
        throw new Error(
          `book with title '${book.title}' has unrecognized key '${key}`,
        );
      }
    }
  }
}
