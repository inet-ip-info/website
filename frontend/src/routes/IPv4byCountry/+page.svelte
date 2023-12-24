<script lang="ts">
</script>

<div class="py-5 text-center">
  <h1>IPv4 Address CIDR by Country</h1>
  <p class="lead">
    This site uses <a href="https://github.com/inet-ip-info/WorldIPv4Map" class="link-underline-primary">GitHub Actions</a> to automatically
    collect and aggregate the latest IP address data from multiple Regional Internet Registries (RIRs) daily. The collected data is converted
    into CIDR notation and subnet mask notation, and is provided in a text file format that can be easily used with Linux commands and similar
    tools.
  </p>
</div>
<div class="container my-5">
  <div class="my-3 mb-4">
    <h2 class="title">What is This IP Address List Used For?</h2>
    <div class="body">
      <p class="text">This IP address list is very useful for restricting network access by country in a Linux environment.</p>
    </div>
  </div>
  <div class="my-3 mb-4">
    <div class="body">
      <h2 class="title">Usage Example</h2>
      <p class="text">
        This example demonstrates how to allow only IPv4 addresses from Japan (Country Code: JP) using <code>ipset</code> and
        <code>iptables</code>.
      </p>
      <ol>
        <li>
          <strong>Installing ipset Command</strong>
          <p class="text">Installation command for Debian/Ubuntu-based Linux:</p>
          <pre class="border rounded m-2 p-2 bg-dark text-white mb-4"><code>apt install -y ipset</code></pre>
        </li>
        <li>
          <strong>Creating and Loading the CIDR File into ipset</strong>
          <p class="text">
            First, download the file containing all IPv4 CIDR lists (all-ipv4cidr.tsv.gz), extract only the Japanese IPv4 addresses to
            create the CIDR file, and then load this file into ipset.
          </p>
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
          <strong>Allowing Specific Ports with iptables</strong>
          <p class="text">
            Finally, use iptables to allow only specific UDP ports (for example, 26900-26903) for IP addresses included in the $SETNAME
            ipset.
          </p>
          <pre class="border rounded m-2 p-2 bg-dark text-white mb-4"><code
              >{`# UDP (26900-26903)
/sbin/iptables -A INPUT -p udp --dport 26900:26903 -m set --match-set $${"SETNAME"} src -j ACCEPT
/sbin/iptables -A INPUT -p udp --dport 26900:26903 -j DROP`}</code
            ></pre>
        </li>
      </ol>
      <p class="text">By using this setup, you can easily allow access only from IP addresses of a specific country.</p>
    </div>
  </div>
</div>
