package main

import (
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/maxmind/geoipupdate/v4/pkg/geoipupdate"
	"github.com/maxmind/geoipupdate/v4/pkg/geoipupdate/database"
	"github.com/oschwald/geoip2-golang"
)

const (
	IDKeyASN  = "GeoLite2-ASN"
	IDKeyCity = "GeoLite2-City"
	//IDKeyCountry = "GeoLite2-Country"
	ext = ".mmdb"

	dbIDASN       = 0
	dbIDCity      = 1
	dbIDCountry   = 2
	licenseString = "This product includes GeoLite2 data created by MaxMind, available from\n<a href=\"https://www.maxmind.com\">https://www.maxmind.com</a>."
)

var (
	EditionIDs = []string{
		IDKeyASN,
		IDKeyCity,
		//	IDKeyCountry,
	}
)

type info struct {
	IPAddress string       `json:"ipAddress"`
	ASN       *geoip2.ASN  `json:"asn"`
	City      *geoip2.City `json:"city"`
	License   string       `json:"license"`
	//Countory *geoip2.Country
}

/////////////////////////
// GeoIPDBs
type GeoIPDBs struct {
	config *geoipupdate.Config
	dbs    []*geoip2.Reader
	mu     sync.RWMutex
	expiry time.Duration
}

func NewGeoIPDBs(config *geoipupdate.Config, expiry time.Duration) *GeoIPDBs {
	config.EditionIDs = EditionIDs
	return &GeoIPDBs{
		config: config,
		dbs:    make([]*geoip2.Reader, len(EditionIDs)),
		expiry: expiry,
	}
}

func (gdb *GeoIPDBs) QueryIPinfo(remoteIP string) (info, error) {
	var err error
	var res info
	res.IPAddress = remoteIP
	ip := net.ParseIP(remoteIP)
	gdb.mu.RLock()
	defer gdb.mu.RUnlock()
	res.ASN, err = gdb.dbs[dbIDASN].ASN(ip)
	if err != nil {
		return res, err
	}
	res.City, err = gdb.dbs[dbIDCity].City(ip)
	if err != nil {
		return res, err
	}
	/*
		res.Countory, err = gdb.dbs[dbIDCountry].Country(ip)
		if err != nil {
			return res, err
		}
	*/
	res.License = licenseString
	return res, nil
}

func (gdb *GeoIPDBs) UpdateDBs() error {
	count := 0
	srcs := make([]string, 0, len(EditionIDs))
	for i := range EditionIDs {
		src := filepath.Join(gdb.config.DatabaseDirectory, EditionIDs[i]+ext)
		sfi, err := os.Stat(src)
		if err != nil || !sfi.Mode().IsRegular() {
			count++
			log.Printf("not found:%s", src)
			continue
		}
		if time.Since(sfi.ModTime()) < gdb.expiry {
			continue
		}
		srcs = append(srcs, src)
		count++
	}
	if count == 0 {
		return nil
	}
	tmpdir, err := os.MkdirTemp(gdb.config.DatabaseDirectory, "update-geoip-tmp.")
	if err != nil {
		return err
	}
	defer os.RemoveAll(tmpdir)
	for i, src := range srcs {
		tmpfile := filepath.Join(tmpdir, EditionIDs[i])
		if err := copyFileContents(src, tmpfile); err != nil {
			return err
		}
		log.Printf("cp %s %s", src, tmpfile)
	}
	log.Print("Check Update DBs...")
	conf := *gdb.config
	conf.DatabaseDirectory = tmpdir
	updateFiles, err := gdb.updateDBFiles(&conf)
	if err != nil {
		return err
	}
	gdb.mu.Lock()
	defer gdb.mu.Unlock()
	openFunc := func() error { return nil }
	for i := range EditionIDs {
		if gdb.dbs[i] == nil {
			continue
		}
		gdb.dbs[i].Close()
		gdb.dbs[i] = nil
		openFunc = gdb.OpenDbs
		log.Printf("close db:%s", EditionIDs[i])
	}
	newFiles := make([]string, len(updateFiles))
	for i := range updateFiles {
		newFiles[i] = filepath.Join(gdb.config.DatabaseDirectory, filepath.Base(updateFiles[i]))
		if err := os.Rename(updateFiles[i], newFiles[i]); err != nil {
			log.Printf("os.Rename(%s,%s) err:%s", updateFiles[i], newFiles[i], err)
			return err
		}
	}
	return openFunc()
}

func (gdb *GeoIPDBs) OpenDbs() error {
	var err error
	for i := range EditionIDs {
		src := filepath.Join(gdb.config.DatabaseDirectory, EditionIDs[i]+ext)
		if gdb.dbs[i] != nil {
			continue
		}
		gdb.dbs[i], err = geoip2.Open(src)
		if err != nil {
			return fmt.Errorf("geoip2.Open(%s) err:%w", src, err)
		}
		log.Printf("open %s", src)
	}
	return nil
}

func (gdb *GeoIPDBs) updateDBFiles(config *geoipupdate.Config) ([]string, error) {
	client := &http.Client{}
	dbReader := database.NewHTTPDatabaseReader(client, config)
	paths := make([]string, len(EditionIDs))

	for i, editionID := range config.EditionIDs {
		filename, err := geoipupdate.GetFilename(config, editionID, client)
		if err != nil {
			return nil, fmt.Errorf("error retrieving filename for editionID:[%s] err:%w", editionID, err)
		}
		paths[i] = filepath.Join(config.DatabaseDirectory, filename)
		dbWriter, err := database.NewLocalFileDatabaseWriter(paths[i], config.LockFile, config.Verbose)
		if err != nil {
			return nil, fmt.Errorf("error creating database writer for editionID:[%s], err:%w", editionID, err)
		}
		if err := dbReader.Get(dbWriter, editionID); err != nil {
			return nil, fmt.Errorf("error while getting database for editionID:[%s], err:%w", editionID, err)
		}
		dbWriter.Close()
	}
	return paths, nil
}

func copyFileContents(src, dst string) (err error) {
	in, err := os.Open(src)
	if err != nil {
		return
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return
	}
	defer func() {
		cerr := out.Close()
		if err == nil {
			err = cerr
		}
	}()
	if _, err = io.Copy(out, in); err != nil {
		return
	}
	err = out.Sync()
	return
}
