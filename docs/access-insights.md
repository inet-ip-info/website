# Access Insights

`/access-insights` は、nginx access log を 1 日 1 回程度の定期実行で集計して生成した `/access-insights.json` を表示するページです。標準では `24h`、`7d`、`14d`、`1m`、`3m`、`6m`、`1y`、`all` の複数期間を同じ JSON に含め、ページ上の期間タブで切り替えます。

ページの初期表示は `all` です。生成 JSON に `defaultPeriod` が含まれる場合は、その値で初期表示を制御できます。

公開 JSON には raw visitor IP address を保存しません。IP アドレスは集計実行中のメモリ内で GeoIP / ASN 集計に使い、出力は国、地域、ASN、endpoint、status code、user-agent family の集計値だけにします。

現在の inet-ip.info サーバーでは nginx access log が概ね現在日 + 14 世代残るため、`14d` までは retained log から再生成できます。`1m`、`3m`、`6m`、`1y`、`all` は、指定した log/archive 入力にその期間分のデータが存在する場合に正確になります。入力が途中からしかない場合は、その期間の `notes` に partial coverage の注記を出します。

30 日以上を常に正確に出す場合は、raw visitor IP address を公開 JSON に出さない方針を保ったまま、公開 webroot とは別の場所に日次集計履歴を保存し、その履歴を入力に含める運用が必要です。

## 生成コマンド

```sh
LOGS="$(
  printf '%s,' \
    /var/log/nginx/inet-ip.info.access.log \
    /var/log/nginx/inet-ip.info.access.log.1 \
    /var/log/nginx/inet-ip.info.access.log.{2..14}.gz
)"
LOGS="${LOGS%,}"

node scripts/build-access-insights.mjs \
  --logs "$LOGS" \
  --periods 24h,7d,14d,1m,3m,6m,1y,all \
  --geoip-endpoint http://127.0.0.1:8880/json \
  --geoip-limit 200 \
  --output /var/lib/inet-ip-info/access-insights.json
```

`--geoip-endpoint` は inet-ip.info の `/json` と互換の POST API を指定します。指定しない場合も endpoint、status code、user-agent の集計は生成できますが、国、地域、ASN は空になります。

`--periods` は `24h,7d,14d,1m,3m,6m,1y,all` のようにカンマ区切りで指定します。`h` 指定の短い期間は時間別 trend として集計し、`d`、`m`、`y`、`all` は日別 trend として集計します。

## 定期更新例

```sh
cd /opt/inet-ip-info/website
LOGS="$(
  printf '%s,' \
    /var/log/nginx/inet-ip.info.access.log \
    /var/log/nginx/inet-ip.info.access.log.1 \
    /var/log/nginx/inet-ip.info.access.log.{2..14}.gz
)"
LOGS="${LOGS%,}"

node scripts/build-access-insights.mjs \
  --logs "$LOGS" \
  --periods 24h,7d,14d,1m,3m,6m,1y,all \
  --geoip-endpoint http://127.0.0.1:8880/json \
  --geoip-limit 200 \
  --output /var/lib/inet-ip-info/access-insights.json
```

## Go サーバー設定

Go サーバーは `ACCESS_INSIGHTS_FILE` 環境変数が設定されている場合、そのファイルを `/access-insights.json` として返します。

```sh
ACCESS_INSIGHTS_FILE=/var/lib/inet-ip-info/access-insights.json
```

未設定の場合は、フロントエンドに同梱しているサンプル `access-insights.json` を返します。

## 出力方針

- query string は endpoint 集計前に破棄する。
- raw visitor IP address は JSON に出力しない。
- GeoIP / ASN enrichment は `--geoip-limit` で上位 visitor IP だけに制限する。
- JSON は一時ファイルへ書いてから rename するため、読み取り側に途中ファイルを見せない。
