import fsPromises from "fs/promises";
import test from "@playwright/test";
import { sources, destinations, cards, fares } from "./input.json";

test("HTMLを解析します", async ({ page }) => {
  const items: any[] = []

  for (const source of sources) {
    for (const destination of destinations) {
      for (const card of cards) {
        for (const fare of fares) {
          const basename = [
            source.code,
            destination.code,
            card.code,
            fare.code,
          ].join('-')

          const filename = `html/${basename}.html`
          const buffer = await fsPromises.readFile(filename)
          const html = buffer.toString()

          await page.setContent(html)

          const マイル = (await page.locator('#result_mile .total strong').innerText()).replace(/,/g, '')
          const フライトマイル = (await page.locator('#mile_flight strong').innerText()).replace(/,/g, '')
          const ボーナスマイル = (await page.locator('#mile_bonus strong').innerText()).replace(/,/g, '')

          const 区間基本マイレージ = (await page.locator('#bonus_cal tr:nth-child(1) td strong').innerText()).replace(/,/g, '')
          const クラス運賃倍率 = await page.locator('#bonus_cal tr:nth-child(2) td strong').innerText() + '%'
          const プレミアムステイタス = await page.locator('#bonus_cal tr:nth-child(3) td strong').innerText() + '%'

          const プレミアムポイント = (await page.locator('#result_point .total strong').innerText()).replace(/,/g, '')
          const 路線倍率 = await page.locator('#result_point table table tr:nth-child(3) td strong').innerText() + '倍'
          const 搭乗ポイント = (await page.locator('#result_point table table tr:nth-child(4) td strong').innerText()).replace(/,/g, '')

          const input = { source, destination, card, fare }
          const output = {
            マイル,
            フライトマイル,
            ボーナスマイル,
            区間基本マイレージ,
            クラス運賃倍率,
            プレミアムステイタス,
            プレミアムポイント,
            路線倍率,
            搭乗ポイント,
          }

          items.push({ input, output })
        }
      }
    }
  }

  const text = JSON.stringify({ items }, null, 2)

  await fsPromises.mkdir('parse', { recursive: true })
  await fsPromises.writeFile('parse/data.json', text)


  // for (const { input, output } of items) {
  //   const cells = [
  //     input.source.name,
  //     input.destination.name,
  //     input.card.name,
  //     input.fare.name,
  //     output.マイル,
  //     output.プレミアムポイント,
  //   ]

  //   console.info(cells.join(' | '))
  // }
})
