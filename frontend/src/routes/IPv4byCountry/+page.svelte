<script lang="ts">
  import { t, initLocate } from "$lib/i18n";
  import { onMount } from "svelte";
  onMount(initLocate);
</script>

<!-- eslint-disable svelte/no-at-html-tags  -->
<div class="container">
  <div class="py-5 text-center">
    <h1>{$t("ipv4bycounty.title")}</h1>
    <p class="lead">{@html $t("ipv4bycounty.welcome")}</p>
  </div>
  <div class="container text-center">
    <h4>
      file: <a href="https://github.com/inet-ip-info/WorldIPv4Map/releases/latest/download/all-ipv4cidr.tsv.gz">all-ipv4cidr.tsv.gz</a>
    </h4>
  </div>
  <div class="container my-5">
    <div class="my-3 mb-4">
      <h2 class="title">{$t("ipv4bycounty.title1")}</h2>
      <div class="body">
        <p class="text">{$t("ipv4bycounty.text1")}</p>
      </div>
    </div>
    <div class="my-3 mb-4">
      <div class="body">
        <h2 class="title">{$t("ipv4bycounty.title2")}</h2>
        <p class="text">{@html $t("ipv4bycounty.text2")}</p>
        <ol>
          <li>
            <strong>{$t("ipv4bycounty.usageTitle1")}</strong>
            <p class="text">{$t("ipv4bycounty.usageText1")}</p>
            <pre class="border rounded m-2 p-2 bg-dark text-white mb-4"><code>apt install -y ipset</code></pre>
          </li>
          <li>
            <strong>{$t("ipv4bycounty.usageTitle2")}</strong>
            <p class="text">{$t("ipv4bycounty.usageText2")}</p>
            <pre class="border rounded m-2 p-2 bg-dark text-white mb-4"><code
                >{`URL=https://github.com/inet-ip-info/WorldIPv4Map/releases/latest/download/all-ipv4cidr.tsv.gz
CIDRFILE=/var/lib/ipset/ipset_list
TIMEOUT_DAYS=7
SETNAME=allow_list

find $${"CIDRFILE"} -type f -mtime +$${"TIMEOUT_DAYS"} -exec rm -f {} \\;
[[ -f $${"CIDRFILE"} ]] ||
    curl -sL $${"URL"} |
    zcat |
    sed -n 's/^JP\\t//p' \\
        >$${"CIDRFILE"}

/usr/sbin/ipset create $${"SETNAME"} hash:net
/usr/sbin/ipset flush $${"SETNAME"} 2>/tmp/ipset.err.log

while read line; do
    /usr/sbin/ipset add $${"SETNAME"} $${"line"} 2>>/tmp/ipset.err.log
done <$${"CIDRFILE"}`}</code
              ></pre>
          </li>
          <li>
            <strong>{$t("ipv4bycounty.usageTitle3")}</strong>
            <p class="text">{$t("ipv4bycounty.usageText3")}</p>
            <pre class="border rounded m-2 p-2 bg-dark text-white mb-4"><code
                >{`# UDP (26900-26903)
/sbin/iptables -A INPUT -p udp --dport 26900:26903 -m set --match-set $${"SETNAME"} src -j ACCEPT
/sbin/iptables -A INPUT -p udp --dport 26900:26903 -j DROP`}</code
              ></pre>
          </li>
        </ol>
        <p class="text">{$t("ipv4bycounty.endText")}</p>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 960px;
  }
</style>
