package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/inet-ip-info/website/frontend"
	"github.com/kelseyhightower/envconfig"
	"github.com/maxmind/geoipupdate/v4/pkg/geoipupdate"
)

type config struct {
	ListenAddr string `default:":8880"`

	GeoIPAccountID  int
	GeoIPLicenseKey string

	GeoIPDatabaseeDir string        `default:"./"`
	GeoIPLockFile     string        `default:"./.geoipupdate.lock"`
	GeoIPURL          string        `default:"https://updates.maxmind.com"`
	GeoIPRetryFor     time.Duration `default:"5s"`
	GeoIPDataExpiry   time.Duration `default:"168h"`
}

func (c *config) NewGeoIPupdateConfig() *geoipupdate.Config {
	guConf := &geoipupdate.Config{
		AccountID:         c.GeoIPAccountID,
		LicenseKey:        c.GeoIPLicenseKey,
		RetryFor:          c.GeoIPRetryFor,
		URL:               c.GeoIPURL,
		DatabaseDirectory: c.GeoIPDatabaseeDir,
		LockFile:          c.GeoIPLockFile,
	}
	return guConf
}

type Handler struct {
	*GeoIPDBs
	staticFileHandler http.Handler
}

func isUAofCLI(uas []string) bool {
	for _, ua := range uas {
		lua := strings.ToLower(ua)
		if strings.Contains(lua, "curl") {
			return true
		}
		return strings.Contains(lua, "wget")
	}
	return false
}
func getIp(req *http.Request) string {
	ips := req.Header["X-Real-Ip"]
	if len(ips) > 0 {
		return ips[0]
	}
	return ""
}

func dumpJSON(v interface{}) []byte {
	j, err := json.MarshalIndent(v, "", " ")
	if err != nil {
		return []byte{}
	}
	return j
}

func (h *Handler) writeJSON(w http.ResponseWriter, req *http.Request) {
	var ip string
	switch req.Method {
	case http.MethodGet:
		ip = getIp(req)
	case http.MethodPost:
		dec := json.NewDecoder(req.Body)
		var v struct {
			IP string `json:"ip"`
		}
		err := dec.Decode(&v)
		if err != nil {
			msg := fmt.Sprintf("json.Decode(%s) err:%s\n", ip, err)
			log.Println(msg)
			w.WriteHeader(http.StatusBadRequest)
			io.WriteString(w, msg)
		}
		ip = v.IP

	}
	res, err := h.QueryIPinfo(ip)
	if err != nil {
		msg := fmt.Sprintf("QueryIPinfo(%s) err:%s\n", ip, err)
		//log.Println(msg)
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, msg)
		return
	}
	w.Write(dumpJSON(res))
}
func (h *Handler) writeIP(w http.ResponseWriter, req *http.Request) {
	io.WriteString(w, getIp(req))
}
func (h *Handler) writeIPrn(w http.ResponseWriter, req *http.Request) {
	io.WriteString(w, getIp(req)+"\n")
}
func (h *Handler) writeHTML(w http.ResponseWriter, req *http.Request) {
	h.staticFileHandler.ServeHTTP(w, req)
}

func (h *Handler) root(w http.ResponseWriter, req *http.Request) {
	map[bool]http.HandlerFunc{
		true:  h.writeIPrn,
		false: h.writeHTML,
	}[isUAofCLI(req.Header["User-Agent"])](w, req)
}

func (h *Handler) updateDBsCron() {
	c := time.Tick(24 * time.Hour)
	for range c {
		if err := h.UpdateDBs(); err != nil {
			log.Print(err)
		}
	}
}

func main() {
	c := &config{}
	if err := envconfig.Process("", c); err != nil {
		log.Fatal(err)
	}
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	public, err := fs.Sub(frontend.Public, "public")
	if err != nil {
		log.Fatal(err)
	}
	h := &Handler{
		GeoIPDBs:          NewGeoIPDBs(c.NewGeoIPupdateConfig(), c.GeoIPDataExpiry),
		staticFileHandler: http.FileServer(http.FS(public)),
	}
	if err := h.UpdateDBs(); err != nil {
		log.Print(err)
	}
	go h.updateDBsCron()
	if err := h.OpenDbs(); err != nil {
		log.Fatal(err)
	}
	http.HandleFunc("/json", h.writeJSON)
	http.HandleFunc("/ip", h.writeIP)
	http.HandleFunc("/ip/", h.writeIP)
	http.HandleFunc("/", h.root)
	log.Printf("ListenAndServe: %s", c.ListenAddr)
	log.Fatal(http.ListenAndServe(c.ListenAddr, nil))
}
