import * as fs from 'fs'
import PDFParser from 'pdf-parse';
import {
    wrtn
} from './wrtn.js';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'
// PDF 파일 읽기
async function analyzePDF(buffer) {
    try {
        const data = await PDFParser(buffer);
        const pdfText = data.text;
        const tableData = extractTableData(pdfText);
        return tableData; // 데이터 출력
    } catch (err) {
        console.error(err);
    }
}
function splitText(text, n) {
    const sentences = [];
    let remainingText = text;

    while (remainingText.length > 0) {
        let sentence = '';
        let index = remainingText.indexOf('\n');

        if (index !== -1 && index <= n) {
            sentence = remainingText.slice(0, index + 1);
            remainingText = remainingText.slice(index + 1);
        } else if (remainingText.length > n) {
            sentence = remainingText.slice(0, n);
            remainingText = remainingText.slice(n);
        } else {
            sentence = remainingText;
            remainingText = '';
        }

        sentences.push(sentence);
    }

    return sentences.map((e) => e.replace(" \n", "").replace("\n", "").replace("\n ", "").trim()).join('\n').slice(0, 789);
}

function 대출(업태,매출) {
    if(업태.includes("도매") || 업태.includes("소매")) {
        return 매출*0.35
    }
    if(업태.includes("제조") || 업태.includes("정보")) {
        return 매출*0.5
    }
    if(업태.includes("서비스")) {
        return 매출*0.25
    }
    if(업태.includes("건설")) {
        return 매출*0.2
    }
}

function 대출2(업태,매출) {
    if(업태.includes("도매") || 업태.includes("소매")) {
        return 매출*0.30
    }
    if(업태.includes("제조") || 업태.includes("정보")) {
        return 매출*0.4
    }
    if(업태.includes("서비스")) {
        return 매출*0.25
    }
    if(업태.includes("건설")) {
        return 매출*0.2
    }
}

function 대출3(업태,매출) {
    if(업태.includes("도매") || 업태.includes("소매")) {
        return 매출*0.40
    }
    if(업태.includes("제조") || 업태.includes("정보")) {
        return 매출*0.65
    }
    if(업태.includes("서비스")) {
        return 매출*0.35
    }
    if(업태.includes("건설")) {
        return 매출*0.35
    }
}

async function modifyPdf(resJson, id) {
    let 예상대출 = Math.floor(대출(resJson.resultJson.업태,resJson.resultJson.매출액)) > 1000000000 ? 1000000000 : Math.floor(대출(resJson.resultJson.업태,resJson.resultJson.매출액))
    const pdfDoc = await PDFDocument.load(fs.readFileSync('./보고서-빈칸 (1).pdf').buffer)
    pdfDoc.registerFontkit(fontkit);
    const light = await pdfDoc.embedFont(fs.readFileSync("./fonts/NanumGothicLight.ttf"))
    const bold = await pdfDoc.embedFont(fs.readFileSync("./fonts/NanumGothicBold.ttf"))

    const pages = pdfDoc.getPages()
    const airesult1 = pages[1]
    const airesult2 = pages[2]
    const createlab = pages[3]
    const airesult3 = pages[5]
    const final = pages[7]
    const { width, height } = airesult1.getSize()

    //1p 왼쪽 표 x좌표 공식 x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.당기순이익), 24) - 105
    //1p 왼쪽 표 y좌표 공식 y: height / 2 + 122 - (60.5 * n)
    //기업명
    airesult1.drawText(resJson.resultJson.기업명, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.기업명, 48) - 45 - 8 - 9 - 9 - 4 - 4,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //대표자
    airesult1.drawText(resJson.resultJson.대표자, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.대표자, 48) - 45 - 8 - 9 - 9 - 4 - 4,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //사업자등록번호
    airesult1.drawText(resJson.resultJson.사업자등록번호, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.사업자등록번호, 48) - 45 - 8 - 9 - 9 - 4 - 4,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //업태
    airesult1.drawText(resJson.resultJson.업태, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.업태, 48) - 45 - 8 - 9 - 9 - 4 - 4,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125 - 125 + 10,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //사업연도
    airesult1.drawText(resJson.resultJson.사업연도, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.사업연도, 48) - 45 - 8 - 9 - 9 - 4 - 4,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125 - 125 - 125 + 20,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //매출액
    airesult1.drawText(addCommasToNumber(resJson.resultJson.매출액), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.매출액), 48) - 45 - 8 - 9 - 9 - 4 - 4 + 1220,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //당기순이익
    airesult1.drawText(addCommasToNumber(resJson.resultJson.당기순이익), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.당기순이익), 48) - 45 - 8 - 9 - 9 - 4 - 4 + 1220,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //추정세금
    airesult1.drawText(addCommasToNumber(resJson.resultJson.세금), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.세금), 48) - 45 - 8 - 9 - 9 - 4 - 4 + 1220,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //자본금
    airesult1.drawText(addCommasToNumber(resJson.resultJson.자본총액), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.자본총액), 48) - 45 - 8 - 9 - 9 - 4 - 4 + 1220,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125 - 125 + 10,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //이익잉여금
    airesult1.drawText(addCommasToNumber(resJson.resultJson.이익잉여금), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.이익잉여금), 48) - 45 - 8 - 9 - 9 - 4 - 4 + 1220,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125 - 125 - 125 + 20,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //비유동부채
    airesult1.drawText(addCommasToNumber(resJson.resultJson.비유동부채), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.비유동부채), 48) - 45 - 8 - 9 - 9 - 4 - 4 + 1220,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125 - 125 - 125 - 125 +29,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //부채비율
    airesult1.drawText(resJson.resultJson.부채비율 + "%", {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.부채비율 + "%", 48) - 45 - 8 - 9 - 9 - 4 - 4 + 1220,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125 - 125 - 125 - 125 + 27 - 125 + 25 - 10,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //차입금/매출
    airesult1.drawText(Number(resJson.resultJson.장기차입금_매출액).toFixed(2) + "%", {
        x: width / 2 - bold.widthOfTextAtSize(Number(resJson.resultJson.장기차입금_매출액).toFixed(2) + "%", 48) - 45 - 8 - 9 - 9 - 4 - 4 + 1220,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 125 - 125 - 125 - 125 - 125 + 27 - 125 - 100,
        size: 48,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //AI추천 컨설팅[1]
    let 컨설팅 = ''
    컨설팅 += `당사의 매출은 ${addCommasToNumber(resJson.resultJson.매출액)}원이며 '비유동부채'는 ${addCommasToNumber(resJson.resultJson.비유동부채)}원 이다.\n\n'비유동부채의 대출이' 운전자금이 아니라고 가정한 대출가능 금액을 추산해봤습니다.`
    airesult2.drawText(splitText(컨설팅, 52), {
        x: width / 2 - 30,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    let max대출 = addCommasToNumber(Math.floor(대출2(resJson.resultJson.업태,resJson.resultJson.매출액)) > 330000000 ? 330000000 : Math.floor(대출2(resJson.resultJson.업태,resJson.resultJson.매출액)))
    airesult2.drawText(`매출액 ${addCommasToNumber(resJson.resultJson.매출액)}원의 예상 최대 정책자금(운전자금)은의 `, {
        x: width / 2 - 30,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 200 - 50,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult2.drawText(`최고한도는 ${addCommasToNumber(예상대출)}원이며, 1회 최대 대출 한도는 ${max대출}원`, {
        x: width / 2 - 30,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 200 - 50 - 33 - 5 - 5,
        size: 33,
        font: bold,
        color: rgb(1, 0, 0)
    })
    airesult2.drawText("이다.", {
        x: width / 2 - 30 + bold.widthOfTextAtSize(`최고한도는 ${addCommasToNumber(예상대출)}원이며, 1회 최대 대출 한도는 ${max대출}원`, 33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 200 - 50 - 33 - 5 - 5,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult2.drawText(`연구소, 각종 인증 등을 할 경우 상승시킬 수 있는 최대 정책자금 한도는`, {
        x: width / 2 - 30,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 200 - 50 - 33 - 5 - 5 - 33 - 5 - 5,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult2.drawText(addCommasToNumber(Math.floor(대출3(resJson.resultJson.업태,resJson.resultJson.매출액)))+"원이다.", {
        x: width / 2 - 30 ,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 200 - 50 - 33 - 5 - 5 - 33 - 5 - 5 - 33 - 5 - 5,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult2.drawText("1회 최대 대출 한도 금액은 "+addCommasToNumber(Math.floor(Number(max대출.replaceAll(",",""))*1.25))+"원이다.", {
        x: width / 2 - 30 ,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 200 - 50 - 33 - 5 - 5 - 33 - 5 - 5 - 33 - 5 - 5 - 33 - 5 - 5,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    //연구소설립효과
    let 절약
    let createlaboratory = ''
    createlaboratory += `당사의 당기순이익 ${addCommasToNumber(resJson.resultJson.당기순이익)}원의 추정 납부 세금은`
    createlab.drawText(createlaboratory, {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    createlab.drawText(`${addCommasToNumber(resJson.resultJson.세금)}원이라고 가정한다.`, {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    createlab.drawText('- 연구소 설립 후 연구요원 입명시 ', {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 33 - 5,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    createlab.drawText('인건비 총액의 25%가 세액 공제', {
        x: width / 2 + 45 + bold.widthOfTextAtSize('- 연구소 설립 후 연구요원 입명시 ',33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 33 - 5,
        size: 33,
        font: bold,
        color: rgb(1, 0, 0)
    })
    createlab.drawText('된다', {
        x: width / 2 + 45 + bold.widthOfTextAtSize('- 연구소 설립 후 연구요원 입명시 '+'인건비 총액의 25%가 세액 공제',33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 33 - 5,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    if (Number(resJson.resultJson.세금) - 17500000 < Math.floor(resJson.resultJson.당기순이익 * 0.07)) {
        if (Number(resJson.resultJson.세금) - 17500000 < 0) {
            let createlaboratorySim = `'1명'의 연구원 임금을 각 1년 '35,000,000원으로 책정했을 경우\n\n35,000,000원 x 2명 x 25% = 17,500,000원의 세액이 공제 된다.\n\n당사의 최종 납부 세금은 ${addCommasToNumber(resJson.resultJson.세금)}원 - 17,500,000원 = ${addCommasToNumber(Number(resJson.resultJson.세금) - 17500000 < 0 ? 0 : Number(resJson.resultJson.세금) - 17500000)}원${Number(resJson.resultJson.세금) - 17500000 < 0 ? `\n\n(${addCommasToNumber(Number(resJson.resultJson.세금) - 17500000)}원 이월가능)` : ""}이다.\n\n하지만, 최저한세로 인해 ${addCommasToNumber(resJson.resultJson.당기순이익)}원 x 7% = `
            createlab.drawText(splitText(createlaboratorySim, 51), {
                x: width / 2 + 45,
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250,
                size: 33,
                font: bold,
                color: rgb(0, 0, 0)
            })

            createlab.drawText(`${addCommasToNumber(Math.floor(resJson.resultJson.당기순이익 * 0.07))}원을`, {
                x: width / 2 + 45 + bold.widthOfTextAtSize(`하지만, 최저한세로 인해 ${addCommasToNumber(resJson.resultJson.당기순이익)}원 x 7% = `, 33),
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (38*5),
                size: 33,
                font: bold,
                color: rgb(1, 0, 0)
            })

            createlab.drawText(`최종납부`, {
                x: width / 2 + 45,
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (40*6) + 3.5,
                size: 33,
                font: bold,
                color: rgb(1, 0, 0)
            })

            createlab.drawText(`하게된다.`, {
                x: width / 2 + 45 + bold.widthOfTextAtSize('최종납부', 33),
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (40*6) + 3.5,
                size: 33,
                font: bold,
                color: rgb(0, 0, 0)
            })
            절약 = Math.floor(resJson.resultJson.당기순이익 * 0.07)
            createlab.drawText(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(절약)}원 = `, {
                x: width / 2 + 45,
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (40*7),
                size: 33,
                font: bold,
                color: rgb(0, 0, 0)
            })

            createlab.drawText(`${addCommasToNumber((resJson.resultJson.세금 - 절약))}원을 절약 가능`, {
                x: width / 2 + 45 + bold.widthOfTextAtSize(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(절약)}원 =  `, 33),
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (40*7),
                size: 33,
                font: bold,
                color: rgb(1, 0, 0)
            })
            createlab.drawText(`하다.`, {
                x: width / 2 + 45,
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (40*8),
                size: 33,
                font: bold,
                color: rgb(0, 0, 0)
            })
        } else {
            let createlaboratorySim = `'1명'의 연구원 임금을 각 1년 '35,000,000원으로 책정했을 경우\n\n35,000,000원 x 2명 x 25% = 17,500,000원의 세액이 공제 된다.\n\n당사의 최종 납부 세금은 \n\n${addCommasToNumber(resJson.resultJson.세금)}원 - 17,500,000원 = ${addCommasToNumber(Number(resJson.resultJson.세금) - 17500000 < 0 ? 0 : Number(resJson.resultJson.세금) - 17500000)}원${Number(resJson.resultJson.세금) - 17500000 < 0 ? `\n\n(${addCommasToNumber(Number(resJson.resultJson.세금) - 17500000)}원 이월가능)` : ""}이다.\n\n하지만, 최저한세로 인해 ${addCommasToNumber(resJson.resultJson.당기순이익)}원 x 7% = `
            createlab.drawText(splitText(createlaboratorySim, 51), {
                x: width / 2 + 45,
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250,
                size: 33,
                font: bold,
                color: rgb(0, 0, 0)
            })

            createlab.drawText(`${addCommasToNumber(Math.floor(resJson.resultJson.당기순이익 * 0.07))}원을`, {
                x: width / 2 + 45 + bold.widthOfTextAtSize(`하지만, 최저한세로 인해 ${addCommasToNumber(resJson.resultJson.당기순이익)}원 x 7% = `, 33),
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (38*5),
                size: 33,
                font: bold,
                color: rgb(1, 0, 0)
            })

            createlab.drawText(`최종납부`, {
                x: width / 2 + 45,
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (39*6),
                size: 33,
                font: bold,
                color: rgb(1, 0, 0)
            })

            createlab.drawText(`하게된다.`, {
                x: width / 2 + 45 + bold.widthOfTextAtSize('최종납부', 33),
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (39*6),
                size: 33,
                font: bold,
                color: rgb(0, 0, 0)
            })
            절약 = Math.floor(resJson.resultJson.당기순이익 * 0.07)
            createlab.drawText(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(절약)}원 = `, {
                x: width / 2 + 45,
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (39*7) - 9,
                size: 33,
                font: bold,
                color: rgb(0, 0, 0)
            })

            createlab.drawText(`${addCommasToNumber((resJson.resultJson.세금 - 절약))}원을 절약 가능`, {
                x: width / 2 + 45 + bold.widthOfTextAtSize(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(절약)}원 = `, 33),
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (39*7) - 9,
                size: 33,
                font: bold,
                color: rgb(1, 0, 0)
            })
            createlab.drawText(`하다.`, {
                x: width / 2 + 45,
                y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (39*8) - 9.3,
                size: 33,
                font: bold,
                color: rgb(0, 0, 0)
            })
        }


    } else {
        let createlaboratorySim = `'1명'의 연구원 임금을 각 1년 '35,000,000원으로 책정했을 경우\n\n35,000,000원 x 2명 x 25% = 17,500,000원의 세액이 공제 된다.`
        createlab.drawText(splitText(createlaboratorySim, 51), {
            x: width / 2 + 45,
            y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250,
            size: 33,
            font: bold,
            color: rgb(0, 0, 0)
        })

        createlab.drawText("당사의 최종 납부 세금은", {
            x: width / 2 + 45,
            y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (38*3),
            size: 33,
            font: bold,
            color: rgb(1, 0, 0)
        })

        createlab.drawText(`${addCommasToNumber(resJson.resultJson.세금)}원 - 17,500,000원 = ${addCommasToNumber(Number(resJson.resultJson.세금) - 17500000 < 0 ? 0 : Number(resJson.resultJson.세금) - 17500000)}원${Number(resJson.resultJson.세금) - 17500000 < 0 ? `\n(${addCommasToNumber(Number(resJson.resultJson.세금) - 17500000)}원 이월가능)` : ""}이다.`, {
            x: width / 2 + 45,
            y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (38*4),
            size: 33,
            font: bold,
            color: rgb(1, 0, 0)
        })
        절약 = Number(resJson.resultJson.세금) - 17500000 < 0 ? 0 : Number(resJson.resultJson.세금) - 17500000
        createlab.drawText(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(절약)}원 = `, {
            x: width / 2 + 45,
            y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (38*5),
            size: 33,
            font: bold,
            color: rgb(0, 0, 0)
        })

        createlab.drawText(` ${addCommasToNumber((resJson.resultJson.세금 - 절약))}원을 절약 가능`, {
            x: width / 2 + 45 + light.widthOfTextAtSize(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(절약)}원 =  `, 33),
            y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (38*5),
            size: 33,
            font: bold,
            color: rgb(1, 0, 0)
        })
        createlab.drawText(`하다.`, {
            x: width / 2 + 45,
            y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 33 - 5 - 5 - 250 - (38*6),
            size: 33,
            font: bold,
            color: rgb(0, 0, 0)
        })
    }

    //AI 추천 컨설팅 [3]
    let 벤처 = `당사의 추정 납부 세금은 ${addCommasToNumber(resJson.resultJson.세금)}원이라고 가정한다.`
    airesult3.drawText(벤처, {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(resJson.resultJson.세금)}원 x 50% = `, {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 38,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(resJson.resultJson.세금 * 0.5))}원으로 감면`, {
        x: width / 2 + 45 + bold.widthOfTextAtSize(`${addCommasToNumber(resJson.resultJson.세금)}원 x 50% = `, 33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 38,
        size: 33,
        font: bold,
        color: rgb(1, 0, 0)
    })
    airesult3.drawText(`된다.`, {
        x: width / 2 + 45 + bold.widthOfTextAtSize(`${addCommasToNumber(resJson.resultJson.세금)}원 x 50% = ` + `${addCommasToNumber(Math.floor(resJson.resultJson.세금 * 0.5))}원으로 감면`, 33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 38,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })

    let 대출한도 = (Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))
    let 메인비즈 = `당사의 1회 대출 최고 한도를 ${addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))}원이라고 가정한다`
    airesult3.drawText(메인비즈, {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 210,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))}원 X 125% = `, {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 210 - 38,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(대출한도 * 1.25))}원으로 증가`, {
        x: width / 2 + 45 + bold.widthOfTextAtSize(`${addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))}원 X 125% = `, 33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 210 - 38,
        size: 33,
        font: bold,
        color: rgb(1, 0, 0)
    })
    airesult3.drawText(`된다.`, {
        x: width / 2 + 45 + bold.widthOfTextAtSize(`${addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))}원 X 125% = ` + `${addCommasToNumber(Math.floor(대출한도 * 1.25))}원으로 증가`, 33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 210 - 38,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })

    let 이노비즈 = `당사의 1회 대출 최고 한도를 ${addCommasToNumber(Math.floor(대출한도 * 1.25))}원으로 가정한다.`
    airesult3.drawText(이노비즈, {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 210 - 210,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(대출한도 * 1.25))}원 X 125% = `, {
        x: width / 2 + 45,
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 210 - 210 - 38,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(Math.floor(대출한도 * 1.25) * 1.25))}원으로 증가`, {
        x: width / 2 + 45 + bold.widthOfTextAtSize(`${addCommasToNumber(Math.floor(대출한도 * 1.25))}원 X 125% = `, 33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 210 - 210 - 38,
        size: 33,
        font: bold,
        color: rgb(1, 0, 0)
    })
    airesult3.drawText(`된다.`, {
        x: width / 2 + 55 + bold.widthOfTextAtSize(`${addCommasToNumber(Math.floor(대출한도 * 1.25))}원 X 125% = ` + `${addCommasToNumber(Math.floor(Math.floor(대출한도 * 1.25) * 1.25))}원으로 증가`, 33),
        y: height / 2 + 112 + 100 + 15 + 60 + 100 - 40 - 5 - 70 - 20 - 5 - 5 - 210 - 210 - 38,
        size: 33,
        font: bold,
        color: rgb(0, 0, 0)
    })


    //최종혜택
    //정책자금 한도 - 당초
    final.drawText(addCommasToNumber(예상대출), {
        x: width / 2 - (bold.widthOfTextAtSize(addCommasToNumber(예상대출), 44) / 2) - 544,
        y: height / 2 + 200,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //정책자금 한도 - 연구소설립
    final.drawText(addCommasToNumber(Math.floor(예상대출 * 1.2)), {
        x: width / 2 - (bold.widthOfTextAtSize(addCommasToNumber(Math.floor(예상대출 * 1.2)), 44) / 2) - 544 + 390,
        y: height / 2 + 200,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //정책자금 한도 - 기업인증
    final.drawText(addCommasToNumber(Math.floor(예상대출 * 1.25)), {
        x: width / 2 - (bold.widthOfTextAtSize(addCommasToNumber(Math.floor(예상대출 * 1.25)), 44) / 2) - 544 + 390 + 380,
        y: height / 2 + 200,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //정책자금 한도 - 혜택합계
    final.drawText(addCommasToNumber((Math.floor(예상대출 * 1.2) - 예상대출) + (Math.floor(예상대출 * 1.25) - 예상대출)), {
        x: width / 2 - (bold.widthOfTextAtSize(addCommasToNumber((Math.floor(예상대출 * 1.2) - 예상대출) + (Math.floor(예상대출 * 1.25) - 예상대출)), 44) / 2) - 544 + 390 + 390 + 390,
        y: height / 2 + 200,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //정책자금 이자 - 혜택합계
    final.drawText(addCommasToNumber(Math.floor(예상대출 * 0.02)), {
        x: width / 2- (bold.widthOfTextAtSize(addCommasToNumber(Math.floor(예상대출 * 0.02)), 44) / 2) - 544 + 390 + 390 + 390,
        y: height / 2 + 70,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })


    //세금혜택 - 당초
    final.drawText(addCommasToNumber(resJson.resultJson.세금), {
        x: width / 2 - (bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.세금), 44) / 2) - 544 -5,
        y: height / 2 - 70 + 5,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })
    let 이월 = Number(resJson.resultJson.세금) - 17500000 < 0 ? Number(resJson.resultJson.세금) - 17500000 : 0

    //세금혜택 - 연구소설립
    final.drawText(addCommasToNumber((resJson.resultJson.세금 - 절약) + Math.abs(이월)), {
        x: width / 2 + 11.5 - (bold.widthOfTextAtSize(addCommasToNumber((resJson.resultJson.세금 - 절약) + Math.abs(이월)), 44) / 2) - 544 + 390 -5,
        y: height / 2 - 70 + 5,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //세금혜택 - 혜택합계
    final.drawText(addCommasToNumber((((resJson.resultJson.세금 - 절약) + Math.abs(이월)) + Math.floor(resJson.resultJson.세금 * 0.5))), {
        x: width / 2 + 11.5 - (bold.widthOfTextAtSize(addCommasToNumber((((resJson.resultJson.세금 - 절약) + Math.abs(이월)) + Math.floor(resJson.resultJson.세금 * 0.5))), 44) / 2) - 544 + 390 + 390 + 390 -5,
        y: height / 2 - 70 + 5,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //세금혜택 - 기업인증
    final.drawText(addCommasToNumber(Math.floor(resJson.resultJson.세금 * 0.5)), {
        x: width / 2 + 11.5 - (bold.widthOfTextAtSize(addCommasToNumber(Math.floor(resJson.resultJson.세금 * 0.5)), 44) / 2) - 544 + 390 + 380 -5,
        y: height / 2 - 70 + 5,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })
    //`${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)))}원 감소되며, 내년에 ${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)) + Math.abs(이월))}원 추가 감면됩니다.`

    //정책자금 한도
    final.drawText(`최소 ${addCommasToNumber((Math.floor(예상대출 * 1.2) - 예상대출) + (Math.floor(예상대출 * 1.25) - 예상대출))}원 증가 `, {
        x: width / 2 - 845 + 7.5 + 55.5,
        y: height / 2 - 264 - 46.5,
        size: 44,
        font: bold,
        color: rgb(1, 0, 0)
    })
    final.drawText(`됩니다.`, {
        x: width / 2 - 845 + 7.5 + 55.5 + bold.widthOfTextAtSize(`최소 ${addCommasToNumber((Math.floor(예상대출 * 1.2) - 예상대출) + (Math.floor(예상대출 * 1.25) - 예상대출))}원 증가 `, 44),
        y: height / 2 - 264 - 46.5,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })


    //정책자금이자
    final.drawText(`최소 ${addCommasToNumber(Math.floor(예상대출 * 0.02))}원 감소`, {
        x: width / 2 - 845 + 7.5 + 55.5,
        y: height / 2 - 264 - 46.5 - 77,
        size: 44,
        font: bold,
        color: rgb(1, 0, 0)
    })

    final.drawText(`됩니다.`, {
        x: width / 2 + - 845 + 7.5 + 55.5 + bold.widthOfTextAtSize(`최소 ${addCommasToNumber(Math.floor(예상대출 * 0.02))}원 감소`, 44),
        y: height / 2 - 264 - 46.5 - 77,
        size: 44,
        font: bold,
        color: rgb(0, 0, 0)
    })


    //세금납부
    if (Number(resJson.resultJson.세금) - 17500000 < 0) {
        let rd = Number(resJson.resultJson.세금) - 17500000 < Math.floor(resJson.resultJson.당기순이익 * 0.07) ? Math.floor(resJson.resultJson.당기순이익 * 0.07) : resJson.resultJson.세금 - 절약
        final.drawText(`${addCommasToNumber((rd))}원 감소되며, 내년에 ${addCommasToNumber((resJson.resultJson.세금 - 절약) + Math.abs(이월))}원 추가 감면`, {
            x: width / 2 - 845 + 7.5 + 55.5,
            y: height / 2 - 264 - 46.5 - 77 - 74,
            size: 44,
            font: bold,
            color: rgb(1, 0, 0)
        })

        final.drawText(`됩니다.`, {
            x: width / 2 - 845 + 7.5 + 55.5 + bold.widthOfTextAtSize(`${addCommasToNumber((resJson.resultJson.세금 - 절약))}원 감소되며, 내년에 ${addCommasToNumber((resJson.resultJson.세금 - 절약) + Math.abs(이월))}원 추가 감면`, 44),
            y: height / 2 -  264 - 46.5 - 77 - 74,
            size: 44,
            font: bold,
            color: rgb(0, 0, 0)
        })
    } else {
        let rd = Number(resJson.resultJson.세금) - 17500000 < Math.floor(resJson.resultJson.당기순이익 * 0.07) ? Math.floor(resJson.resultJson.당기순이익 * 0.07) : resJson.resultJson.세금 - 절약
        final.drawText(`${addCommasToNumber(rd)}원 감소`, {
            x: width / 2 - 845 + 7.5 + 55.5,
            y: height / 2 - 264 - 46.5 - 77 - 74,
            size: 44,
            font: bold,
            color: rgb(1, 0, 0)
        })

        final.drawText(`됩니다.`, {
            x: width / 2 - 845 + 7.5 + 55.5 + bold.widthOfTextAtSize(`${addCommasToNumber((resJson.resultJson.세금 - 절약))}원 감소`, 44),
            y: height / 2 -  264 - 46.5 - 77 - 74,
            size: 44,
            font: bold,
            color: rgb(0, 0, 0)
        })
    }
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync('data/' + id + '.pdf', pdfBytes)
    return true
}
function extractValuesWithSubstring(arr, substring, type) {
    const values = [];

    for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];

        // value 값이 특정 문자열을 포함하는 경우만 추출
        if (obj[''] && obj[''].includes(substring)) {
            if ((obj[''].indexOf(substring) + substring.length) == obj[''].length) {
                let ext = arr[i + 2]['']
                values.push(ext);
            } else {
                if (type == 2) {
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

function 과세표준계산(값, 법인) {
    if (법인 == true) {
        if (값 <= 200000000) {
            return 값*0.09
        }
        if (값 > 200000000 && 값 <= 20000000000) {
            return 값*0.119
        }
        if (값 > 20000000000 && 값 <= 300000000000) {
            return 값*0.21
        }
        if (값 > 300000000000) {
            return 값*0.24
        }
    } else {
        if (값 <= 14000000) {
            return 값*0.06
        }
        if (값 > 14000000 && 값 <= 50000000) {
            return (14000000*0.06) + (값-14000000)*0.15 - 1260000
        }
        if (값 > 50000000 && 값 <= 88000000) {
            return (50000000*0.15) + (값-50000000)*0.24 - 5760000
        }
        if (값 > 88000000 && 값 <= 150000000) {
            return (88000000*0.24) + (값-88000000)*0.35 - 15440000
        }
        if (값 > 150000000 && 값 <= 300000000) {
            return (150000000*0.35) + (값-150000000)*0.38 - 19940000
        }
        if (값 > 300000000 && 값 <= 500000000) {
            return (300000000*0.38) + (값-300000000)*0.40 - 25940000
        }
        if (값 > 500000000 && 값 <= 1000000000) {
            return (500000000*0.40) + (값-500000000)*0.42 - 49940000
        }
        if (값 > 1000000000) {
            return (1000000000*0.42) + (값-1000000000)*0.45 - 65940000
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
        if (장기차입금.length == 0) 장기차입금.push("0")
        let 당기순이익 = extractValuesWithSubstring(tableData, '당기순이익');
        if (당기순이익.length == 0) {
            당기순이익 = extractValuesWithSubstring(tableData, '당기순손익');
        }
        let test = extractValuesWithSubstring(tableData, '법인명)', 2)[0]
        const 법인 = test.includes("주식회사") || test.includes("(주)") || test.includes("(유)") || test.includes("(합)") || test.includes("( 주 )") || test.includes("( 유 )") || test.includes("( 합 )") ? true : false;
        const 자본금 = extractValuesWithSubstring(tableData, '자본금');

        let 과세계산 = 과세표준계산(Number(당기순이익[0].replace(/,/gi, "")), 법인);
        let 세금 = 과세계산
        let 자본총액 = Number(당기순이익[0].replace(/,/gi, "")) + Number(자본금[0].replace(/,/gi, ""));

        let 부채비율 = Number(장기차입금[0].replace(/,/gi, "")) / 자본총액;

        let ROE = Number(당기순이익[0].replace(/,/gi, "")) / 자본총액;

        let 이익잉여금 = test.includes("주식회사") || test.includes("(주)") || test.includes("( 주 )") ? extractValuesWithSubstring(tableData, '이익잉여금')[0] : "0"
        let 대표자 = extractValuesWithSubstring(tableData, '대표자)', 2)[0]

        let result = ""
        result += "매출액 : " + numberToKorean(Number(매출액[0].replace(/,/gi, ""))) + "원\n"
        result += "당기순이익 : " + numberToKorean(Number(당기순이익[0].replace(/,/gi, ""))) + "원\n"
        result += "당기순이익에 따른 세금 : " + numberToKorean(Math.round(세금)) + "원\n"
        result += "자본총액 : " + numberToKorean(자본총액) + "원\n"
        result += "자기자본이익률 : " + (ROE * 100).toFixed(2) + "%\n"
        result += "부채비율 : " + (부채비율 * 100).toFixed(2) + "%\n"
        result += "장기차입금 : " + numberToKorean(Number(장기차입금[0].replace(/,/gi, ""))) + "원\n"
        result += "장기차입금/매출액 : " + ((Number(장기차입금[0].replace(/,/gi, "")) / Number(매출액[0].replace(/,/gi, ""))).toFixed(5) * 100).toFixed(3) + "%"
        let resultJson = {
            장기차입금: Number(장기차입금[0].replace(/,/gi, "")),
            매출액: Number(매출액[0].replace(/,/gi, "")),
            당기순이익: Number(당기순이익[0].replace(/,/gi, "")),
            세금: Math.round(세금),
            장기차입금_매출액: (Number(장기차입금[0].replace(/,/gi, "")) / Number(매출액[0].replace(/,/gi, ""))).toFixed(5) * 100,
            자본총액: 자본총액,
            부채비율: (부채비율 * 100).toFixed(2),
            자기자본이익률: (ROE * 100).toFixed(2),
            기업명: test.slice(0, test.indexOf("사업자등록번호")),
            사업자등록번호: test.slice(test.indexOf("사업자등록번호") + 7, test.length),
            업태: extractValuesWithSubstring(tableData, '업태', 2)[0],
            비유동부채: Number(extractValuesWithSubstring(tableData, '비유동부채')[0].replace(/,/gi, "")),
            이익잉여금: Number(이익잉여금.replace(/,/gi, "")),
            대표자: 대표자.slice(0, 대표자.indexOf("주민(법인")),
            사업연도: extractValuesWithSubstring(tableData, '사업연도')[0].replace('~', '')
        }
        data = {
            재무제표: result,
            AI: "",
            resultJson: resultJson
        }
    }).catch((e) => {
        data = false
    })
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
import { table } from 'console';
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
        if (data[0] == false) res.status(500).send("error")
        else res.status(200).json(data);
    } catch (e) {
        res.status(500);
    }
});
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
    await modifyPdf(pdf1, id)
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


