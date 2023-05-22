import {
    promises as fs
} from 'fs';
import PDFParser from 'pdf-parse';
import {
    addAccount,
    wrtn
} from './wrtn.js';
import pdfmake from "pdfmake";
import {
    Roboto
} from "./fonts/Roboto.js";
pdfmake.addFonts(Roboto);
// PDF 파일 읽기
async function analyzePDF(buffer) {
    try {
        const data = await PDFParser(buffer);
        const pdfText = data.text;
        const tableData = extractTableData(pdfText);
        console.log('JSON 파일이 성공적으로 저장되었습니다.');
        return tableData; // 데이터 출력
    } catch (err) {
        console.error(err);
    }
}

function extractValuesWithSubstring(arr, substring,type) {
    const values = [];

    for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];

        // value 값이 특정 문자열을 포함하는 경우만 추출
        if (obj[''] && obj[''].includes(substring)) {
            if ((obj[''].indexOf(substring) + substring.length) == obj[''].length) {
                let ext = arr[i + 2]['']
                values.push(ext);
            } else {
                if(type == 2) {
                    let ext = obj[''].slice(obj[''].indexOf(substring) + substring.length, obj[''].length).trim();
                    values.push(ext);
                } else {
                    let ext = obj[''].slice(obj[''].indexOf(substring) + substring.length + 2, obj[''].length).trim();
                    values.push(ext);
                }
            }
        }
    }

    return values;
}

function extractTableData(pdfText) {
    const rows = pdfText.split('\n'); // 텍스트를 행 단위로 분할
    // 첫 번째 행을 헤더로 사용 (헤더가 없는 경우, 직접 헤더를 정의해야 함)
    const header = rows[0].split('\t');

    const tableData = [];

    // 각 행을 순회하며 데이터 추출
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split('\t');

        // 행에 값이 있는 경우에만 데이터를 추출하여 JSON 객체로 생성
        if (row.some(cell => cell.trim() !== '')) {
            const rowData = {};

            // 각 셀의 데이터를 헤더와 매핑하여 JSON 객체로 생성
            for (let j = 0; j < header.length; j++) {
                rowData[header[j]] = row[j];
            }

            tableData.push(rowData);
        }
    }

    return tableData;
}

function 과세표준계산(값,법인) {
    if(법인 == true) {
        if(값 <= 200000000) {
            return {
                세율:9,
                누진세액공제:0
            }
        }
        if(값 > 200000000 && 값 <= 20000000000) {
            return {
                세율:19,
                누진세액공제:0
            }
        }
        if(값 > 20000000000 && 값 <= 300000000000) {
            return {
                세율:21,
                누진세액공제:0
            }
        }
        if(값 > 300000000000) {
            return {
                세율:24,
                누진세액공제:0
            }
        }
    } else {
        if(값 <= 14000000) {
            return {
                세율:6,
                누진세액공제:0
            }
        }
        if(값 > 14000000 && 값 <= 50000000) {
            return {
                세율:15,
                누진세액공제:1260000
            }
        }
        if(값 > 50000000 && 값 <= 88000000) {
            return {
                세율:24,
                누진세액공제:5760000
            }
        }
        if(값 > 88000000 && 값 <= 150000000) {
            return {
                세율:35,
                누진세액공제:15440000
            }
        }
        if(값 > 150000000 && 값 <= 300000000) {
            return {
                세율:38,
                누진세액공제:19940000
            }
        }
        if(값 > 300000000 && 값 <= 500000000) {
            return {
                세율:40,
                누진세액공제:25940000
            }
        }
        if(값 > 500000000 && 값 <= 1000000000) {
            return {
                세율:42,
                누진세액공제:49940000
            }
        }
        if(값 > 1000000000) {
            return {
                세율:45,
                누진세액공제:65940000
            }
        }
    }
}

function numberFormat(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberToKorean(number) {
    let e = '';
    if (number < 0) {
        number = Math.abs(number);
        e = '-'
    }
    var inputNumber = number < 0 ? false : number;
    var unitWords = ['', '만', '억', '조', '경'];
    var splitUnit = 10000;
    var splitCount = unitWords.length;
    var resultArray = [];
    var resultString = '';

    for (var i = 0; i < splitCount; i++) {
        let unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
        unitResult = Math.floor(unitResult);
        if (unitResult > 0) {
            resultArray[i] = unitResult;
        }
    }

    for (var i = 0; i < resultArray.length; i++) {
        if (!resultArray[i]) continue;
        resultString = String(numberFormat(resultArray[i])) + unitWords[i] + resultString;
    }
    if (number === 0) resultString = "0"

    return e + resultString;
}

async function analysisData(path) {
    let data = {}
    await analyzePDF(path).then(async (tableData) => {
        const 매출액 = extractValuesWithSubstring(tableData, '매출액');

        const 장기차입금 = extractValuesWithSubstring(tableData, '장기차입금');

        let 당기순이익 = extractValuesWithSubstring(tableData, '당기순이익');
        if (당기순이익.length == 0) {
            당기순이익 = extractValuesWithSubstring(tableData, '당기순손익');
        }
        let test = extractValuesWithSubstring(tableData, '법인명)',2)[0]
        const 법인 = test.includes("주식회사") || test.includes("(주)") || test.includes("(유)") || test.includes("(합)") || test.includes("( 주 )") || test.includes("( 유 )") || test.includes("( 합 )") ? true : false;
        const 자본금 = extractValuesWithSubstring(tableData, '자본금');

        let 과세계산 = 과세표준계산(Number(당기순이익[0].replace(/,/gi, "")),법인);

        let 세금 = Number(당기순이익[0].replace(/,/gi, "")) * (과세계산.세율 / 100) - 과세계산.누진세액공제;

        let 자본총액 = Number(당기순이익[0].replace(/,/gi, "")) + Number(자본금[0].replace(/,/gi, ""));

        let 부채비율 = Number(장기차입금[0].replace(/,/gi, "")) / 자본총액;

        let ROE = Number(당기순이익[0].replace(/,/gi, "")) / 자본총액;


        let result = ""
        result += "장기차입금 : " + numberToKorean(Number(장기차입금[0].replace(/,/gi, ""))) + "원\n"
        result += "매출액 : " + numberToKorean(Number(매출액[0].replace(/,/gi, ""))) + "원\n"
        result += "당기순이익 : " + numberToKorean(Number(당기순이익[0].replace(/,/gi, ""))) + "원\n"
        result += "당기순이익에 따른 세금 : " + numberToKorean(Math.round(세금)) + "원\n"
        result += "장기차입금/매출액 : " + ((Number(장기차입금[0].replace(/,/gi, "")) / Number(매출액[0].replace(/,/gi, ""))).toFixed(5) * 100).toFixed(3) + "%\n"
        result += "자본총액 : " + numberToKorean(자본총액) + "원\n"
        result += "부채비율 : " + (부채비율 * 100).toFixed(2) + "%\n"
        result += "자기자본이익률 : " + (ROE * 100).toFixed(2) + "%"
        let resultJson = {
            장기차입금: Number(장기차입금[0].replace(/,/gi, "")),
            매출액: Number(매출액[0].replace(/,/gi, "")),
            당기순이익: Number(당기순이익[0].replace(/,/gi, "")),
            세금: Math.round(세금),
            장기차입금_매출액: (Number(장기차입금[0].replace(/,/gi, "")) / Number(매출액[0].replace(/,/gi, ""))).toFixed(5) * 100,
            자본총액: 자본총액,
            부채비율: (부채비율 * 100).toFixed(2),
            자기자본이익률: (ROE * 100).toFixed(2)
        }
        let question = "너는 재무제표를 평가하는 AI야.\n"+result + "\n이 데이터는 회사의 재무제표증명서를 요약한 데이터야\n이 데이터를 바탕으로 이 회사의 현재 상태를 재무제표평가적으로 최대한 자세히 분석해줘"
        let q = new wrtn()
        await q.loginByEmail("39siw7sm29@naver.com", "39siw7sm29!")
        let roomId = await q.addRoom()
        let answer = await q.ask(question, 'GPT3.5', roomId)
        await q.removeRoom(roomId)
        data = {
            재무제표: result,
            AI: answer,
            resultJson: resultJson
        }
    });
    return data;
}


import express from 'express';
import multer from 'multer';
import cors from 'cors';
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import serveStatic from "serve-static";
import http from "http";
import ejs from "ejs";
const app = express();
app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        files: 2
    }
});
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(
    expressSession({
        secret: "pdfanlysis",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(express.static('data'));
app.set('view engine', 'ejs');
app.post('/upload', upload.array('pdf', 2), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('업로드된 파일이 없습니다.');
    }
    try {
        let data = []
        for (const file of req.files) {
            const fileBuffer = file.buffer;
            let a = (await analysisData(fileBuffer))
            data.push(a)
        }
        res.status(200).json(data);
    } catch (e) {
        res.status(500);
    }
});
app.post('/compare', async (req, res) => {
    let {
        pdf1,
        pdf2
    } = req.body
    let question = ""
    question += "아래의 재무제표를 요약한 두개의 데이터를 확인하고 재무제표평가적으로 비교해서 분석해줘\n1번 데이터\n" + pdf1
    question += "\n\n2번 데이터\n" + pdf2
    let q = new wrtn()
    await q.loginByEmail("39siw7sm29@naver.com", "39siw7sm29!")
    let roomId = await q.addRoom()
    let answer = await q.ask(question, 'GPT3.5', roomId)
    await q.removeRoom(roomId)
    res.status(200).json({
        "result": answer
    });
})
app.get('/', (req, res) => {
    res.render('main', {
        user: req.session.login
    });
})
app.post('/makePdf1', async (req, res) => {
    let {
        id,
        pdf1
    } = req.body
    const reportData = {
        analysisTitle: '[ '+pdf1.name+' 파일 분석 결과 ]',
        loanAmount: numberToKorean(Number(pdf1.resultJson['장기차입금']))+'원',
        sales: numberToKorean(Number(pdf1.resultJson['매출액']))+'원',
        netProfit: numberToKorean(Number(pdf1.resultJson['당기순이익']))+'원',
        tax: numberToKorean(Number(pdf1.resultJson['세금']))+'원',
        loanToSalesRatio: numberToKorean(Number(pdf1.resultJson['장기차입금_매출액']).toFixed(2))+'%',
        totalEquity: numberToKorean(Number(pdf1.resultJson['자본총액']))+'원',
        debtRatio: numberToKorean(Number(pdf1.resultJson['부채비율']))+'%',
        ROE: numberToKorean(Number(pdf1.resultJson['자기자본이익률']))+'%',
    };
    let createlaboratory = ''
    createlaboratory += "당사의 당기순이익 "+addCommasToNumber(Number(pdf1.resultJson['장기차입금']))+'원'+"의 추정 납부 세금은 "+addCommasToNumber(Number(pdf1.resultJson['세금']))+'원'+"이라고 가정한다.\n"
    createlaboratory += `연구소를 설립하여 "2명"의 연구원의 임금을 1년 "35,000,000원"으로 책정했을 경우,\n연구원 투입 임금의 25%가 세액공제 된다.\n즉, 35,000,000원 x 2명 x 25% = 17,500,000원의 세액이 절감 된다.\n${addCommasToNumber(Number(pdf1.resultJson['세금']))}원 - 17,500,000원 = ${addCommasToNumber(Number(pdf1.resultJson['세금']) - 17500000 < 0 ? 0 : Number(pdf1.resultJson['세금']) - 17500000)}원${Number(pdf1.resultJson['세금']) - 17500000 < 0 ? `(${addCommasToNumber(Number(pdf1.resultJson['세금']) - 17500000)}원 이월)` : ""}이다.`
    const table = {
        headers: ['항목', ''],
        rows: [
            ['장기차입금', reportData.loanAmount],
            ['매출액', reportData.sales],
            ['당기순이익', reportData.netProfit],
            ['당기순이익에 따른 세금', reportData.tax],
            ['장기차입금/매출액', reportData.loanToSalesRatio],
            ['자본총액', reportData.totalEquity],
            ['부채비율', reportData.debtRatio],
            ['자기자본이익률', reportData.ROE],
        ],
    };
    const documentDefinition = {
        content: [{
            text: reportData.analysisTitle,
            style: 'header'
        },
            {
                text: '\n'
            },
            {
                table: {
                    widths: ['*', '*'],
                    body: [table.headers, ...table.rows],
                },
            },
            {
                text: '\n'
            },
            {
                text: '[ AI 분석결과 ]',
                style: 'header'
            },
            {
                text: pdf1['AI']
            },
            {
                text: '[ 연구소 설립시 혜택 ]',
                style: 'header'
            },
            {
                text: createlaboratory
            },
            {
                text: '[ 예상 대출액 평가 ]',
                style: 'header'
            },
            {
                text: pdf1['대출예상']
            },
            {
                text: pdf1['대출예상액']
            },
        ],
        styles: {
            header: {
                fontSize: 24,
                alignment: 'center',
            },
        },
    };
    await pdfmake.createPdf(documentDefinition).write('data/'+id+'.pdf', "utf-8")
    res.send(id)
})
function addCommasToNumber(number) {
    // 숫자를 문자열로 변환하고, 천 단위마다 쉼표를 추가합니다.
    const strNumber = String(number);
    const parts = strNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // 소수점 아래가 있으면 합쳐줍니다.
    const formattedNumber = parts.join('.');
    return formattedNumber;
}
app.post('/makePdf2', async (req, res) => {
    let {
        id,
        pdf1,
        pdf2,
        compare,
        compareDef
    } = req.body
    const reportData = {
        analysisTitle: '[ '+pdf1.name+' 파일 분석 결과 ]',
        loanAmount: numberToKorean(Number(pdf1.resultJson['장기차입금']))+'원',
        sales: numberToKorean(Number(pdf1.resultJson['매출액']))+'원',
        netProfit: numberToKorean(Number(pdf1.resultJson['당기순이익']))+'원',
        tax: numberToKorean(Number(pdf1.resultJson['세금']))+'원',
        loanToSalesRatio: numberToKorean(Number(pdf1.resultJson['장기차입금_매출액']).toFixed(2))+'%',
        totalEquity: numberToKorean(Number(pdf1.resultJson['자본총액']))+'원',
        debtRatio: numberToKorean(Number(pdf1.resultJson['부채비율']))+'%',
        ROE: numberToKorean(Number(pdf1.resultJson['자기자본이익률']))+'%',
    };
    const reportData2 = {
        analysisTitle: '[ '+pdf2.name+' 파일 분석 결과 ]',
        loanAmount: numberToKorean(Number(pdf2.resultJson['장기차입금']))+'원',
        sales: numberToKorean(Number(pdf2.resultJson['매출액']))+'원',
        netProfit: numberToKorean(Number(pdf2.resultJson['당기순이익']))+'원',
        tax: numberToKorean(Number(pdf2.resultJson['세금']))+'원',
        loanToSalesRatio: numberToKorean(Number(pdf2.resultJson['장기차입금_매출액']).toFixed(2))+'%',
        totalEquity: numberToKorean(Number(pdf2.resultJson['자본총액']))+'원',
        debtRatio: numberToKorean(Number(pdf2.resultJson['부채비율']))+'%',
        ROE: numberToKorean(Number(pdf2.resultJson['자기자본이익률']))+'%',
    };
    let createlaboratory = ''
    createlaboratory += "당사의 당기순이익 "+addCommasToNumber(Number(pdf2.resultJson['당기순이익']))+'원'+"의 추정 납부 세금은 "+addCommasToNumber(Number(pdf2.resultJson['세금']))+'원'+"이라고 가정한다.\n"
    createlaboratory += `연구소를 설립하여 "2명"의 연구원의 임금을 1년 "35,000,000원"으로 책정했을 경우,\n연구원 투입 임금의 25%가 세액공제 된다.\n즉, 35,000,000원 x 2명 x 25% = 17,500,000원의 세액이 절감 된다.\n${addCommasToNumber(Number(pdf2.resultJson['세금']))}원 - 17,500,000원 = ${addCommasToNumber(Number(pdf2.resultJson['세금']) - 17500000 < 0 ? 0 : Number(pdf2.resultJson['세금']) - 17500000)}원${Number(pdf2.resultJson['세금']) - 17500000 < 0 ? `(${addCommasToNumber(Number(pdf2.resultJson['세금']) - 17500000)}원 이월)` : ""}이다.`
    const table = {
        headers: ['항목', '금액'],
        rows: [
            ['장기차입금', reportData.loanAmount],
            ['매출액', reportData.sales],
            ['당기순이익', reportData.netProfit],
            ['당기순이익에 따른 세금', reportData.tax],
            ['장기차입금/매출액', reportData.loanToSalesRatio],
            ['자본총액', reportData.totalEquity],
            ['부채비율', reportData.debtRatio],
            ['자기자본이익률', reportData.ROE],
        ],
    };
    const table2 = {
        headers: ['항목', '금액'],
        rows: [
            ['장기차입금', reportData2.loanAmount],
            ['매출액', reportData2.sales],
            ['당기순이익', reportData2.netProfit],
            ['당기순이익에 따른 세금', reportData2.tax],
            ['장기차입금/매출액', reportData2.loanToSalesRatio],
            ['자본총액', reportData2.totalEquity],
            ['부채비율', reportData2.debtRatio],
            ['자기자본이익률', reportData2.ROE],
        ],
    };
    const documentDefinition = {
        content: [{
            text: reportData.analysisTitle,
            style: 'header'
        },
            {
                text: '\n'
            },
            {
                table: {
                    widths: ['*', '*'],
                    body: [table.headers, ...table.rows],
                },
            },
            {
                text: '\n'
            },
            {
                text: '[ AI 분석결과 ]',
                style: 'header'
            },
            {
                text: pdf1['AI']
            },
            {
                text: '\n'
            },
            {
                text: reportData2.analysisTitle,
                style: 'header'
            },,
            {
                text: '\n'
            },
            {
                table: {
                    widths: ['*', '*'],
                    body: [table2.headers, ...table2.rows],
                },
            },
            {
                text: '\n'
            },
            {
                text: '[ AI 분석결과 ]',
                style: 'header'
            },
            {
                text: pdf2['AI']
            },
            {
                text: '\n'
            },
            {
                text: '[ 일반 비교 결과 ]',
                style: 'header'
            },
            {
                text: pdf1.name+"대비 "+pdf2.name+"의 비교결과\n"+compareDef
            },,
            {
                text: '\n'
            },
            {
                text: '[ AI 비교 결과 ]',
                style: 'header'
            },
            {
                text: compare
            },
            {
                text: '[ 연구소 설립시 혜택 ]',
                style: 'header'
            },
            {
                text: createlaboratory
            },
            {
                text: '[ 예상 대출액 평가 ]',
                style: 'header'
            },
            {
                text: pdf2['대출예상']
            },
            {
                text: pdf2['대출예상액']
            },
        ],
        styles: {
            header: {
                fontSize: 24,
                bold: true,
                alignment: 'center',
            },
        },
    };
    await pdfmake.createPdf(documentDefinition).write('data/'+id+'.pdf', "utf-8")
    res.send(id)
})
app.get('/login', async (req, res) => {
    let {
        pw
    } = req.query
    if (pw === "test1234") {
        req.session.login = true
        res.redirect('/')
    } else {
        res.redirect('/')
    }
})

app.listen(3000, () => {
    console.log('서버가 3000번 포트에서 실행 중입니다.');
});