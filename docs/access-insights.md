# Access Insights

`/access-insights` は、nginx access log を 1 日 1 回程度の定期実行で集計して生成した `/access-insights.json` を表示するページです。標準では `24h`、`7d`、`14d`、`1m`、`3m`、`6m`、`1y`、`all` の複数期間を同じ JSON に含め、ページ上の期間タブで切り替えます。

ページの初期表示は `all` です。生成 JSON に `defaultPeriod` が含まれる場合は、その値で初期表示を制御できます。

公開 JSON には raw visitor IP address を保存しません。IP アドレスは集計実行中のメモリ内で GeoIP / ASN 集計に使い、出力は国、地域、ASN、endpoint、status code、user-agent family の集計値だけにします。

現在の inet-ip.info サーバーでは nginx access log が概ね現在日 + 14 世代残るため、`14d` までは retained log から再生成できます。`1m`、`3m`、`6m`、`1y`、`all` は retained log 入力に含まれる範囲の集計になります。入力が途中からしかない場合は、その期間の `notes` に partial coverage の注記を出します。

30 日以上を常に正確に出す場合は、raw visitor IP address を公開 JSON に出さない方針を保ったまま、公開 webroot とは別の場所に日次集計済みデータを保存し、その履歴を入力に含める運用が必要です。

## 生成コマンド

本番向けには `cmd/access-insights` の Go streaming generator を使います。現在のデフォルトは inet-ip.info の production 配置に合わせています。

```sh
go run ./cmd/access-insights
```

デフォルト値:

| 項目 | 値 |
| --- | --- |
| 入力 log | `/var/log/nginx/inet-ip.info.access.log` から `/var/log/nginx/inet-ip.info.access.log.14.gz` まで |
| GeoIP endpoint | `http://127.0.0.1:8888/json` |
| 出力 JSON | `/var/lib/inet-ip-info/access-insights.json` |
| 期間 | `24h`, `7d`, `14d`, `1m`, `3m`, `6m`, `1y`, `all` |

生成器は日別に log を集約してから各期間を合成します。実行中は `read complete path=...`、`period build start/complete`、`access insights build complete` の進捗ログを出します。systemd timer で実行する場合は `journalctl -u inet-ip-info-access-insights.service` で追跡できます。

`cmd/access-insights` は bounded-memory の集計器です。unique visitor 数は HyperLogLog 推定値、GeoIP / ASN enrichment は bounded top-IP set から取得します。

## 定期更新例

本番サーバーでは、この repository から build した binary を `/opt/inet-ip.info/scripts/build-access-insights-streaming` に配置し、systemd timer から起動します。

```ini
[Service]
Type=oneshot
ExecStart=/opt/inet-ip.info/scripts/build-access-insights-streaming
TimeoutStartSec=30min
Nice=10
IOSchedulingClass=idle
```

```ini
[Timer]
OnCalendar=*-*-* 00:20:00
RandomizedDelaySec=10m
Persistent=true
Unit=inet-ip-info-access-insights.service
```

logrotate が日次で実行されるため、timer は日付変更後に少し遅らせて実行します。

## Go サーバー設定

Go サーバーは `ACCESS_INSIGHTS_FILE` 環境変数が設定されている場合、そのファイルを `/access-insights.json` として返します。

```sh
ACCESS_INSIGHTS_FILE=/var/lib/inet-ip-info/access-insights.json
```

未設定の場合は、フロントエンドに同梱しているサンプル `access-insights.json` を返します。

## Node.js 版スクリプト

`scripts/build-access-insights.mjs` は初期実装として残しています。小規模な log 入力や開発時の JSON 生成には使えますが、inet-ip.info の production log 量では Go streaming generator を使います。

## 出力方針

- query string は endpoint 集計前に破棄する。
- raw visitor IP address は JSON に出力しない。
- GeoIP / ASN enrichment は bounded top-IP set から取得する。
- JSON は一時ファイルへ書いてから rename するため、読み取り側に途中ファイルを見せない。
