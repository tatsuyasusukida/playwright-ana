import fsPromises from 'fs/promises';
import test from "@playwright/test";
import { sources, destinations, cards, fares } from "./input.json";

test('HTMLを取得します', async ({ page }) => {
  const sleep = 5000
  const timeout = sources.length * destinations.length
    * cards.length * fares.length * sleep * 2

  test.setTimeout(timeout)

  const url = 'https://cam.ana.co.jp/amcmember/SimulationJaResult'

  // 事前アクセス（初回アクセス時にエラーページが表示されるため）
  await page.goto(url)
  fsPromises.mkdir('tmp/fetch', { recursive: true })

  for (const source of sources) {
    for (const destination of destinations) {
      for (const card of cards) {
        for (const fare of fares) {
          // ANAフライトマイル・プレミアムポイントシミュレーションページへアクセス
          await page.goto(url)
          // 出発地の選択
          await page.locator('#DepApo_ticket').selectOption(source.code)
          // 到着地の選択
          await page.locator('#ArrApo_ticket').selectOption(destination.code)
          // 利用カード種別の選択
          await page.locator('#cardList_kind').selectOption(card.code)
          // 利用運賃の選択
          await page.locator('#fareList_section').selectOption(fare.code)
          // 次へ(計算する)ボタンをクリック＆ページ遷移を待機
          await Promise.all([
            page.waitForNavigation(),
            page.locator('.btn_c a').click(),
          ])

          const basename = [source.code, destination.code, card.code, fare.code].join('-')

          fsPromises.writeFile(`tmp/fetch/${basename}.html`, await page.content())
          await page.screenshot({ path: `tmp/fetch/${basename}.png` })

          // 優しさ
          await page.waitForTimeout(sleep)
        }
      }
    }
  }
})
