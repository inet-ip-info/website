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
| GeoIP database | `GeoLite2-ASN.mmdb`, `GeoLite2-City.mmdb` |
| GeoIP database directory | `ACCESS_INSIGHTS_GEOIP_DIR`, `GEOIP_DATABASE_DIR`, `GEOIPDATABASEEDIR` の順に参照。未指定時は `/var/lib/inet-ip.info/data` |
| 出力 JSON | `/var/lib/inet-ip-info/access-insights.json` |
| 過去推定 JSON | `/var/lib/inet-ip-info/access-insights-history.json` |
| 期間 | `24h`, `7d`, `14d`, `1m`, `3m`, `6m`, `1y`, `all` |

生成器は日別に log を集約してから各期間を合成します。実行中は `read complete path=...`、`period build start/complete`、`access insights build complete` の進捗ログを出します。systemd timer で実行する場合は `journalctl -u inet-ip-info-access-insights.service` で追跡できます。

`cmd/access-insights` は streaming 集計器です。unique visitor 数は HyperLogLog 推定値です。GeoIP / ASN は MaxMind mmdb を直接参照し、全リクエストを読み込みながら国、地域、ASN の集計値へ加算します。IP アドレスは上限付きのメモリキャッシュにだけ保持し、公開 JSON には出力しません。

## 過去推定データ

nginx access log より古い期間は、別途作成した過去リクエストレートの概算 JSON を、詳細 log 集計とは別の `historicalEstimates` として公開 JSON に含めます。

日次の `cmd/access-insights` は外部 API を呼び出しません。`/var/lib/inet-ip-info/access-insights-history.json` が存在する場合だけ読み込み、公開 JSON に同梱します。

過去推定データで表示するのはリクエスト総数とピーク日だけです。国、地域、ASN、endpoint、status code、user-agent family は access log の詳細集計にだけ含めます。

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
- GeoIP / ASN は mmdb から全リクエストをストリーミング集計し、国名が解決できないものだけ `Unknown / ZZ` にまとめる。
- JSON は一時ファイルへ書いてから rename するため、読み取り側に途中ファイルを見せない。
