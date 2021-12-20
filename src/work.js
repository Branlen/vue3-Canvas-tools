// import {XLSX} from 'xlsx';
export function exportExcel(
  header = [],
  body = [],
  title = "excel",
  sheetName = "sheet1",
  hasTitle = true
) {
  const _headers = header
    .map((v, i) => {
      let key = Object.keys(v);
      return Object.assign(
        {},
        {
          v: `${v[key[0]]}<key>${key[0]}`,
          position: String.fromCharCode(65 + i) + (hasTitle ? 1 : 0),
        }
      );
    })
    .reduce(
      (prev, next) =>
        Object.assign({}, prev, {
          [next.position]: { v: next.v },
        }),
      {}
    );
  console.log("_headers", _headers);
  const _body = body
    .map((v, i) =>
      header.map((k, j) => {
        let key = Object.keys(k);
        return Object.assign(
          {},
          {
            v: v[key[0]],
            position: String.fromCharCode(65 + j) + (i + (hasTitle ? 2 : 1)),
          }
        );
      })
    )
    .reduce((prev, next) => prev.concat(next))
    .reduce(
      (prev, next) =>
        Object.assign({}, prev, {
          [next.position]: { v: next.v },
        }),
      {}
    );

  const _thead = setTableThead(_headers);

  const output = Object.assign({}, _thead, _body);

  const outputPos = Object.keys(output).sort();
  let flagStr = outputPos[outputPos.length - 1].substr(0, 1);
  let lastStrArr = outputPos.filter((item) => item.includes(flagStr));

  // const ref = outputPos[0] + ':' + outputPos[outputPos.length - 1]
  const ref = outputPos[0] + ":" + `${flagStr}${lastStrArr.length}`;

  console.log("_thead", _thead);
  console.log("output", output);
  console.log("outputPos", outputPos);
  console.log("ref", ref);

  console.log("mySheet", Object.assign({}, output, { "!ref": ref }));

  // const wb = {
  //   SheetNames: ['mySheet'],
  //   Sheets: {
  //     mySheet: Object.assign({}, output, { '!ref': ref })
  //   }
  // }
  let Sheets = {};
  Sheets[sheetName] = Object.assign({}, output, { "!ref": ref });
  const wb = {
    SheetNames: [sheetName],
    Sheets,
  };
  save(wb, `纯脉快递${new Date().getMonth()+1}-${new Date().getDay()}.xlsx`);
}

function setTableThead(wb) {
  for (let key in wb) {
    let i = wb[key].v.indexOf("<key>");
    if (wb[key].v.includes("<key>")) {
      wb[key].v = wb[key].v.substr(0, i);
    }
  }
  return wb;
}
function save(wb, fileName) {
  let wopts = {
    bookType: "xlsx",
    bookSST: false,
    type: "binary",
  };
  let xw = XLSX.write(wb, wopts);
  let obj = new Blob([s2ab(xw)], {
    type: "",
  });
  let elem = document.createElement("a");
  elem.download = fileName || "下载";
  elem.href = URL.createObjectURL(obj);
  elem.click();
  setTimeout(function () {
    URL.revokeObjectURL(obj);
  }, 100);
}

function s2ab(s) {
  if (typeof ArrayBuffer !== "undefined") {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  } else {
    let buf = new Array(s.length);
    for (let i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
}
