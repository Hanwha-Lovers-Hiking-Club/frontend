import assert from "node:assert/strict";
import test from "node:test";

import {
  getDocumentSelectionError,
  MAX_DOCUMENT_FILE_SIZE,
} from "./file-utils.ts";

test("accepts only a fully valid file selection", () => {
  const validFiles = [
    { name: "guide.pdf", size: MAX_DOCUMENT_FILE_SIZE },
    { name: "notes.md", size: 10 },
  ];

  assert.equal(getDocumentSelectionError(validFiles), null);
});

test("rejects the whole selection when one file is unsupported", () => {
  const files = [
    { name: "guide.pdf", size: 10 },
    { name: "slides.pptx", size: 10 },
  ];

  assert.match(getDocumentSelectionError(files), /slides\.pptx/);
});

test("rejects a file larger than 50MB", () => {
  const files = [{ name: "large.xlsx", size: MAX_DOCUMENT_FILE_SIZE + 1 }];

  assert.match(getDocumentSelectionError(files), /50MB/);
});
