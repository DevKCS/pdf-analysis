import { promises as fs } from 'fs';
import PDFParser from 'pdf-parse';
import {addAccount, wrtn} from './wrtn.js';

// PDF 파일 경로
const pdfFilePath = '농산물통신판매업.pdf';
// PDF 파일 읽기
async function analyzePDF(path) {
    try {
        const pdfBuffer = await fs.readFile(path); // 파일 읽기

        // PDF 파일 분석
        const data = await PDFParser(pdfBuffer);
        const pdfText = data.text;
        const tableData = extractTableData(pdfText);
        await fs.writeFile('output.json', JSON.stringify(tableData)); // JSON 파일 저장

        console.log('JSON 파일이 성공적으로 저장되었습니다.');
        return tableData; // 데이터 출력
    } catch (err) {
        console.error(err);
    }
}
function extractValuesWithSubstring(arr, substring) {
    const values = [];

    for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];

        // value 값이 특정 문자열을 포함하는 경우만 추출
        if (obj[''] && obj[''].includes(substring)) {
            if((obj[''].indexOf(substring) + substring.length) == obj[''].length) {
                let ext = arr[i+2]['']
                values.push(ext);
            } else {
                let ext = obj[''].slice(obj[''].indexOf(substring) + substring.length + 2, obj[''].length).trim();
                values.push(ext);
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
function 과세표준계산(값) {
    if(값<=12000000){
        return {누진세액공제:0, 세율:6};
    }
    if(값 > 12000000 && 값 <= 46000000){
        return {누진세액공제:1080000, 세율:15};
    }
    if(값 > 46000000 && 값 <= 88000000) {
        return {누진세액공제:5220000, 세율:24};
    }
    if(값 > 88000000 && 값 <= 150000000) {
        return {누진세액공제:14900000, 세율:35};
    }
    if(값 > 150000000 && 값 <= 300000000) {
        return {누진세액공제:19400000, 세율:38};
    }
    if(값 > 300000000 && 값 <= 500000000) {
        return {누진세액공제:25900000, 세율:40};
    }
    if(값 > 500000000 && 값 <= 1000000000) {
        return {누진세액공제:49900000, 세율:42};
    }
    if(값 > 1000000000) {
        return {누진세액공제:129900000, 세율:45};
    }
}
function numberFormat(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberToKorean(number){
    let e = '';
    if (number < 0) {
        number = Math.abs(number);
        e = '-'
    }
    var inputNumber  = number < 0 ? false : number;
    var unitWords    = ['', '만', '억', '조', '경'];
    var splitUnit    = 10000;
    var splitCount   = unitWords.length;
    var resultArray  = [];
    var resultString = '';

    for (var i = 0; i < splitCount; i++){
        let unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
        unitResult = Math.floor(unitResult);
        if (unitResult > 0){
            resultArray[i] = unitResult;
        }
    }

    for (var i = 0; i < resultArray.length; i++){
        if(!resultArray[i]) continue;
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
        if(당기순이익.length == 0) {
            당기순이익 = extractValuesWithSubstring(tableData, '당기순손익');
        }
        const 자본금 = extractValuesWithSubstring(tableData, '자본금');
        console.log(당기순이익)

        let 과세계산 = 과세표준계산(Number(당기순이익[0].replace(/,/gi, "")));
        let 세금 = Number(당기순이익[0].replace(/,/gi, ""))*(과세계산.세율/100) - 과세계산.누진세액공제;

        let 자본총액 = Number(당기순이익[0].replace(/,/gi, "")) + Number(자본금[0].replace(/,/gi, ""));

        let 부채비율 = Number(장기차입금[0].replace(/,/gi, ""))/자본총액;

        let ROE = Number(당기순이익[0].replace(/,/gi, ""))/자본총액;


        let result = ""
        result += "장기차입금 : "+numberToKorean(Number(장기차입금[0].replace(/,/gi, "")))+"원\n"
        result += "매출액 : "+numberToKorean(Number(매출액[0].replace(/,/gi, "")))+"원\n"
        result += "당기순이익 : "+numberToKorean(Number(당기순이익[0].replace(/,/gi, "")))+"원\n"
        result += "당기순이익에 따른 세금 : "+numberToKorean(Math.round(세금))+"원\n"
        result += "장기차입금/매출액 : "+((Number(장기차입금[0].replace(/,/gi, ""))/Number(매출액[0].replace(/,/gi, ""))).toFixed(5)*100).toFixed(3)+"%\n"
        result += "자본총액 : "+numberToKorean(자본총액)+"원\n"
        result += "부채비율 : "+(부채비율*100).toFixed(2)+"%\n"
        result += "자기자본이익률 : "+(ROE*100).toFixed(2)+"%"
        let question = result + "\n이 데이터는 회사의 재무제표증명서를 요약한 데이터야\n이 데이터를 바탕으로 이 회사의 현재 상태를 재무제표평가적으로 분석해 요약해줘"
        let q = new wrtn()
        await q.loginByEmail("39siw7sm29@naver.com","39siw7sm29!")
        let roomId = await q.addRoom()
        let answer = await q.ask(question, 'GPT3.5', roomId)
        await q.removeRoom(roomId)
        data = {
            재무제표: result,
            AI: answer
        }
    });
    return data;
}

let a = (await analysisData("./222.pdf")).재무제표
let b = (await analysisData("./333.pdf")).재무제표
//let c = (await analysisData("./농산물통신판매업.pdf")).재무제표
let question = ""
question += "아래의 재무제표를 요약한 두개의 데이터를 확인하고 재무제표평가적으로 비교해서 분석해줘\n1번 데이터\n"+a
question += "\n\n2번 데이터\n"+b
let q = new wrtn()
await q.loginByEmail("39siw7sm29@naver.com","39siw7sm29!")
let roomId = await q.addRoom()
let answer = await q.ask(question, 'GPT4.0', roomId)
await q.removeRoom(roomId)
console.log(answer)