// https://qiita.com/markey/items/62f08105ae98139e731f を参考にしたエラーを分離するラッパー
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
export const fetcher2 = <T>(
  input: RequestInfo,
  codeFunc: falseFunc,
  init?: RequestInit
): Promise<T> => {
  return wrap2<T>(fetch(input, init), codeFunc);
};
