import fsPromises from "fs/promises";
import test from "@playwright/test";
import { items } from "../tmp/parse/data.json";

test("CSVファイルを出力します", async ({ page }) => {
  const lines = []

  for (const { input, output } of items) {
    const cells = [
      input.source.name,
      input.destination.name,
      input.card.name,
      input.fare.name,
      output.マイル,
      output.プレミアムポイント,
    ]

    lines.push(cells.join(','))
  }

  await fsPromises.mkdir('tmp/print', { recursive: true })
  await fsPromises.writeFile('tmp/print/data.csv', lines.join('\n'))
})
