// https://qiita.com/markey/items/62f08105ae98139e731f を参考にしたエラーを分離するラッパー
import Netmask from "netmask";
import { writable } from "svelte/store";

export const navbarIP = writable("");

const wrap = <T>(task: Promise<Response>): Promise<T> => {
  return new Promise((resolve, reject) => {
    task
      .then((response) => {
        if (!response.ok) {
          response
            .text()
            .then((text) => {
              reject(text);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          response
            .json()
            .then((json) => {
              // jsonが取得できた場合だけresolve
              resolve(<Promise<T>>json);
            })
            .catch((error) => {
              reject(error);
            });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
export const fetcher = <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  return wrap<T>(fetch(input, init));
};

const wrap2 = <T>(task: Promise<Response>, codeFunc: falseFunc): Promise<T> => {
  return new Promise((resolve, reject) => {
    task
      .then((response) => {
        if (!response.ok) {
          codeFunc(response.status);
          response
            .text()
            .then((text) => {
              reject(text);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          response
            .json()
            .then((json) => {
              // jsonが取得できた場合だけresolve
              resolve(<Promise<T>>json);
            })
            .catch((error) => {
              reject(error);
            });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

type falseFunc = (status: number) => void;
export const fetcher2 = <T>(input: RequestInfo, codeFunc: falseFunc, init?: RequestInit): Promise<T> => {
  return wrap2<T>(fetch(input, init), codeFunc);
};

export type names = {
  [key: string]: string;
} | null;

type RegisteredCountry = {
  IsInEuropeanUnion: boolean;
  IsoCode: string;
  Names: names;
};
type RepresentedCountry = {
  IsInEuropeanUnion: boolean;
  IsoCode: string;
  Names: names;
  Type: string;
};
export type ipinfo = {
  ipAddress: string;
  asn: {
    AutonomousSystemNumber: number;
    AutonomousSystemOrganization: string;
  };
  city: {
    City: {
      Names: names;
    } | null;
    Continent: {
      Code: string;
      Names: names;
    } | null;
    Country: {
      IsInEuropeanUnion: boolean;
      IsoCode: string;
      Names: names;
    } | null;
    RegisteredCountry: RegisteredCountry | null;
    RepresentedCountry: RepresentedCountry | null;
    Subdivisions:
      | [
          {
            IsoCode: string;
            Names: names;
          },
        ]
      | null;
    Postal: {
      Code: string;
    };
    Location: {
      AccuracyRadius: number;
      Latitude: number;
      Longitude: number;
      MetroCode: number;
      TimeZone: string;
    } | null;
    Traits: {
      IsAnonymousProxy: boolean;
      IsSatelliteProvider: boolean;
    } | null;
  };
  license: string;
};

export const getRepresentedCountry = (data: ipinfo): RepresentedCountry => {
  if (data.city.RepresentedCountry) {
    return data.city.RepresentedCountry;
  } else {
    return {
      IsInEuropeanUnion: false,
      IsoCode: "",
      Names: null,
      Type: "",
    };
  }
};

export const testData: ipinfo = {
  ipAddress: "10.100.200.111",
  asn: {
    AutonomousSystemNumber: 22234,
    AutonomousSystemOrganization: "HOGE Networks Corporation",
  },
  city: {
    City: {
      Names: {
        en: "akihabara",
        ja: "秋葉原",
      },
    },
    Continent: {
      Code: "AS",
      Names: {
        de: "Asien",
        en: "Asia",
        es: "Asia",
        fr: "Asie",
        ja: "アジア",
        "pt-BR": "Ásia",
        ru: "Азия",
        "zh-CN": "亚洲",
      },
    },
    Country: {
      IsInEuropeanUnion: false,
      IsoCode: "JP",
      Names: {
        de: "Japan",
        en: "Japan",
        es: "Japón",
        fr: "Japon",
        ja: "日本",
        "pt-BR": "Japão",
        ru: "Япония",
        "zh-CN": "日本",
      },
    },
    Location: {
      AccuracyRadius: 5,
      Latitude: 35.7,
      Longitude: 139.7725,
      MetroCode: 0,
      TimeZone: "Asia/Tokyo",
    },
    Postal: {
      Code: "110-0006",
    },
    RegisteredCountry: {
      IsInEuropeanUnion: false,
      IsoCode: "JP",
      Names: {
        de: "Japan",
        en: "Japan",
        es: "Japón",
        fr: "Japon",
        ja: "日本",
        "pt-BR": "Japão",
        ru: "Япония",
        "zh-CN": "日本",
      },
    },
    RepresentedCountry: {
      IsInEuropeanUnion: false,
      IsoCode: "",
      Names: null,
      Type: "",
    },
    Subdivisions: [
      {
        IsoCode: "13",
        Names: {
          en: "Tokyo",
          fr: "Préfecture de Tokyo",
          ja: "東京都",
        },
      },
    ],
    Traits: {
      IsAnonymousProxy: false,
      IsSatelliteProvider: false,
    },
  },
  license:
    'This product includes GeoLite2 data created by MaxMind, available from\n\u003ca href="https://www.maxmind.com"\u003ehttps://www.maxmind.com\u003c/a\u003e.',
};

const isValidIPv4 = (ip: string): boolean => {
  const regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip);
};

export const isValidIPv4CIDR = (cidr: string): boolean => {
  const regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/;
  return regex.test(cidr);
};

export const checkIP = (ip: string): boolean => {
  if (!isValidIPv4(ip)) {
    return false;
  }
  try {
    new Netmask.Netmask(ip);
  } catch (e) {
    return false;
  }
  return true;
};

type ParseState = "NORMAL" | "SINGLE_QUOTE" | "DOUBLE_QUOTE" | "ESCAPE";
type CharHandler = (char: string, index: number) => number;

export function parseCommandLine(commandLine: string): string[] {
  let state: ParseState = "NORMAL";
  const result: string[] = [];
  let currentToken = "";

  const addToken = () => {
    if (currentToken.length > 0) {
      result.push(currentToken);
      currentToken = "";
    }
  };

  const handleEscape = (char: string, index: number): number => {
    // Add the next character after the escape, regardless of what it is
    currentToken += commandLine[index + 1];
    return 2; // Skip the next character as it is already processed
  };

  const handlers: Record<ParseState, Record<string, CharHandler>> = {
    NORMAL: {
      " ": () => {
        addToken();
        return 1;
      },
      "'": () => {
        state = "SINGLE_QUOTE";
        return 1;
      },
      '"': () => {
        state = "DOUBLE_QUOTE";
        return 1;
      },
      "\\": handleEscape,
      DEFAULT: (char: string) => {
        currentToken += char;
        return 1;
      },
    },
    SINGLE_QUOTE: {
      "'": () => {
        state = "NORMAL";
        return 1;
      },
      DEFAULT: (char: string) => {
        currentToken += char;
        return 1;
      },
    },
    DOUBLE_QUOTE: {
      '"': () => {
        state = "NORMAL";
        return 1;
      },
      "\\": handleEscape,
      DEFAULT: (char: string) => {
        currentToken += char;
        return 1;
      },
    },
    ESCAPE: {
      DEFAULT: handleEscape,
    },
  };

  for (let i = 0; i < commandLine.length; i++) {
    const char = commandLine[i];
    const handler = handlers[state][char] || handlers[state]["DEFAULT"];
    i += handler(char, i) - 1;
  }

  addToken(); // 最後のトークンを追加

  return result;
}
