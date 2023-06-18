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
        console.log('JSON 파일이 성공적으로 저장되었습니다.');
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

async function modifyPdf(resJson, id) {
    let 예상대출 = Math.floor(resJson.resultJson.매출액 * 0.5) > 1000000000 ? 1000000000 : Math.floor(resJson.resultJson.매출액 * 0.5)
    const pdfDoc = await PDFDocument.load(fs.readFileSync('./최종본V2.pdf').buffer)
    pdfDoc.registerFontkit(fontkit);
    const def = await pdfDoc.embedFont(fs.readFileSync("./fonts/Pretendard-Regular.ttf"))
    const light = await pdfDoc.embedFont(fs.readFileSync("./fonts/Pretendard-SemiBold.ttf"))
    const bold = await pdfDoc.embedFont(fs.readFileSync("./fonts/Pretendard-Bold.ttf"))

    const pages = pdfDoc.getPages()
    const main = pages[0]
    const airesult1 = pages[1]
    const airesult2 = pages[3]
    const createlab = pages[4]
    const airesult3 = pages[5]
    const final = pages[7]
    const { width, height } = airesult1.getSize()


    //1p 왼쪽 표 x좌표 공식 x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.당기순이익), 24) - 105
    //1p 왼쪽 표 y좌표 공식 y: height / 2 + 122 - (60.5 * n)
    //메인화면
    main.drawText(resJson.resultJson.기업명, {
        x: width / 2 - (def.widthOfTextAtSize(resJson.resultJson.기업명, 40) / 2),
        y: height / 2 - 168.5,
        size: 40,
        font: bold,
        color: rgb(1, 1, 1)
    })

    //기업명
    airesult1.drawText(resJson.resultJson.기업명, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.기업명, 24) - 105,
        y: height / 2 + 122,
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //대표자
    airesult1.drawText(resJson.resultJson.대표자, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.대표자, 24) - 105,
        y: height / 2 + 122 - (60.5 * 1),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //사업자등록번호
    airesult1.drawText(resJson.resultJson.사업자등록번호.replace(/-/gi, ' '), {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.사업자등록번호.replace(/-/gi, ' '), 24) - 105,
        y: height / 2 + 122 - (60.5 * 2),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //업태
    airesult1.drawText(resJson.resultJson.업태, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.업태, 24) - 105,
        y: height / 2 + 122 - (60.5 * 3),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //사업연도
    airesult1.drawText(resJson.resultJson.사업연도, {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.사업연도, 24) - 105,
        y: height / 2 + 122 - (60.5 * 4),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //매출액
    airesult1.drawText(addCommasToNumber(resJson.resultJson.매출액), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.매출액), 24) - 105 + 705,
        y: height / 2 + 122,
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //당기순이익
    airesult1.drawText(addCommasToNumber(resJson.resultJson.당기순이익), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.당기순이익), 24) - 105 + 705,
        y: height / 2 + 122 - (60.5),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //추정세금
    airesult1.drawText(addCommasToNumber(resJson.resultJson.세금), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.세금), 24) - 105 + 705,
        y: height / 2 + 122 - (60.5 * 2),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //자본금
    airesult1.drawText(addCommasToNumber(resJson.resultJson.자본총액), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.자본총액), 24) - 105 + 705,
        y: height / 2 + 122 - (60.5 * 3),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //이익잉여금
    airesult1.drawText(addCommasToNumber(resJson.resultJson.이익잉여금), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.이익잉여금), 24) - 105 + 705,
        y: height / 2 + 122 - (60.5 * 4),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //비유동부채
    airesult1.drawText(addCommasToNumber(resJson.resultJson.비유동부채), {
        x: width / 2 - bold.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.비유동부채), 24) - 105 + 705,
        y: height / 2 + 122 - (60.5 * 5),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //부채비율
    airesult1.drawText(resJson.resultJson.부채비율 + "%", {
        x: width / 2 - bold.widthOfTextAtSize(resJson.resultJson.부채비율 + "%", 24) - 105 + 705,
        y: height / 2 + 122 - (60.5 * 6),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //차입금/매출
    airesult1.drawText(Number(resJson.resultJson.장기차입금_매출액).toFixed(2) + "%", {
        x: width / 2 - bold.widthOfTextAtSize(Number(resJson.resultJson.장기차입금_매출액).toFixed(2) + "%", 24) - 105 + 705,
        y: height / 2 + 122 - (60.5 * 7),
        size: 24,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //AI추천 컨설팅[1]
    let 컨설팅 = ''
    컨설팅 += `당사의 '매출액’은 ${addCommasToNumber(resJson.resultJson.매출액)}원이며 '비유동부채'는 ${addCommasToNumber(resJson.resultJson.비유동부채)}원 이다.\n'비유동부제의 대출이 '운전자금이 아니라고 가정한 대출가능 금액을 주산 해봤습니다.`
    airesult2.drawText("[가정]", {
        x: width / 2 + 55,
        y: height / 2 + 130,
        size: 22,
        font: bold,
        color: rgb(0, 0, 0)
    })
    airesult2.drawText(splitText(컨설팅, 41), {
        x: width / 2 + 55,
        y: height / 2 + 101,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })

    airesult2.drawText("[시뮬레이션]", {
        x: width / 2 + 55,
        y: height / 2 - 60,
        size: 22,
        font: bold,
        color: rgb(0, 0, 0)
    })
    let max대출 = addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 330000000 ? 330000000 : Math.floor(resJson.resultJson.매출액 * 0.4))
    airesult2.drawText(`매출액 ${addCommasToNumber(resJson.resultJson.매출액)}원의 예상 최대 정책자금(운전자금)은의 `, {
        x: width / 2 + 55,
        y: height / 2 - 89,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })
    airesult2.drawText(`최고한도는`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`매출액 ${addCommasToNumber(resJson.resultJson.매출액)}원의 예상 최대 정책자금(운전자금)은의 `, 20),
        y: height / 2 - 89,
        size: 20,
        font: light,
        color: rgb(1, 0, 0)
    })
    airesult2.drawText(`${addCommasToNumber(예상대출)}원이며, 1회 최대 대출 한도는 ${max대출}원`, {
        x: width / 2 + 55,
        y: height / 2 - 89 - 24,
        size: 20,
        font: light,
        color: rgb(1, 0, 0)
    })
    airesult2.drawText("이다.", {
        x: width / 2 + 55 + light.widthOfTextAtSize(`${addCommasToNumber(예상대출)}원이며, 1회 최대 대출 한도는 ${max대출}원`, 20),
        y: height / 2 - 89 - 24,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })
    //연구소설립효과
    let createlaboratory = ''
    createlaboratory += `당사의 당기순이익 ${addCommasToNumber(resJson.resultJson.당기순이익)}원의 추정 납부 세금은 ${addCommasToNumber(resJson.resultJson.세금)}원이라고 가정한다.`
    createlab.drawText(splitText(createlaboratory, 46), {
        x: width / 2 + 55,
        y: height / 2 + 101 - 12,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })

    let createlaboratorySim = `'1명'의 연구원 임금을 각 1년 '35,000,000원으로 책정했을 경우\n35,000,000원 x 2명 x 25% = 17,500,000원의 세액이 공제 된다.\n당사의 최종 납부 세금은 ${addCommasToNumber(resJson.resultJson.세금)}원 - 17,500,000원 = ${addCommasToNumber(Number(resJson.resultJson.세금) - 17500000 < 0 ? 0 : Number(resJson.resultJson.세금) - 17500000)}원${Number(resJson.resultJson.세금) - 17500000 < 0 ? `\n(${addCommasToNumber(Number(resJson.resultJson.세금) - 17500000)}원 이월가능)` : ""}이다.\n하지만, 최저한세로 인해 ${addCommasToNumber(resJson.resultJson.당기순이익)}원 x 7% = `
    createlab.drawText(splitText(createlaboratorySim, 51), {
        x: width / 2 + 55,
        y: height / 2 - 79,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })

    createlab.drawText(`${addCommasToNumber(Math.floor(resJson.resultJson.당기순이익 * 0.07))}원을`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`하지만, 최저한세로 인해 ${addCommasToNumber(resJson.resultJson.당기순이익)}원 x 7% = `, 20),
        y: height / 2 - 79 - (24 * 4),
        size: 20,
        font: light,
        color: rgb(1, 0, 0)
    })

    createlab.drawText(`최종납부`, {
        x: width / 2 + 55,
        y: height / 2 - 79 - (24 * 5),
        size: 20,
        font: light,
        color: rgb(1, 0, 0)
    })

    createlab.drawText(`하게된다.`, {
        x: width / 2 + 55 + light.widthOfTextAtSize('최종납부', 20),
        y: height / 2 - 79 - (24 * 5),
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })

    createlab.drawText(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(Math.floor(resJson.resultJson.당기순이익 * 0.07))}원 = `, {
        x: width / 2 + 55,
        y: height / 2 - 79 - (24 * 7),
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })

    createlab.drawText(` ${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)))}원을 절약 가능`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(Math.floor(resJson.resultJson.당기순이익 * 0.07))}원 =  `, 20),
        y: height / 2 - 79 - (24 * 7),
        size: 20,
        font: light,
        color: rgb(1, 0, 0)
    })

    createlab.drawText(`하다.`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`즉, 당초 ${addCommasToNumber(resJson.resultJson.세금)}원 - ${addCommasToNumber(Math.floor(resJson.resultJson.당기순이익 * 0.07))}원 =  ` + ` ${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)))}원을 절약 가능`, 20),
        y: height / 2 - 79 - (24 * 7),
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })

    //AI 추천 컨설팅 [3]
    let 벤처 = `당사의 추정 납부 세금은 ${addCommasToNumber(resJson.resultJson.세금)}원이라고 가정한다.`
    airesult3.drawText(벤처, {
        x: width / 2 + 55,
        y: height / 2 + 101,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(resJson.resultJson.세금)}원 x 50% = `, {
        x: width / 2 + 55,
        y: height / 2 + 101 - 24,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(resJson.resultJson.세금 * 0.5))}원으로 감면`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`${addCommasToNumber(resJson.resultJson.세금)}원 x 50% = `, 20),
        y: height / 2 + 101 - 24,
        size: 20,
        font: light,
        color: rgb(1, 0, 0)
    })
    airesult3.drawText(`된다.`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`${addCommasToNumber(resJson.resultJson.세금)}원 x 50% = ` + `${addCommasToNumber(Math.floor(resJson.resultJson.세금 * 0.5))}원으로 감면`, 20),
        y: height / 2 + 101 - 24,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })

    let 대출한도 = (Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))
    let 메인비즈 = `당사의 1회 대출 최고 한도를 ${addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))}원이라고 가정한다`
    airesult3.drawText(메인비즈, {
        x: width / 2 + 55,
        y: height / 2 - 32,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))}원 X 125% = `, {
        x: width / 2 + 55,
        y: height / 2 - 32 - 25,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(대출한도 * 1.25))}원으로 증가`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`${addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))}원 X 125% = `, 20),
        y: height / 2 - 32 - 25,
        size: 20,
        font: light,
        color: rgb(1, 0, 0)
    })
    airesult3.drawText(`된다.`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`${addCommasToNumber(Math.floor(resJson.resultJson.매출액 * 0.4) > 500000000 ? 500000000 : Math.floor(resJson.resultJson.매출액 * 0.4))}원 X 125% = ` + `${addCommasToNumber(Math.floor(대출한도 * 1.25))}원으로 증가`, 20),
        y: height / 2 - 32 - 25,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })

    let 이노비즈 = `당사의 1회 대출 최고 한도를 ${addCommasToNumber(Math.floor(대출한도 * 1.25))}원으로 가정한다.`
    airesult3.drawText(이노비즈, {
        x: width / 2 + 55,
        y: height / 2 - 32 - 133,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(대출한도 * 1.25))}원 X 125% = `, {
        x: width / 2 + 55,
        y: height / 2 - 32 - 133 - 25,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })
    airesult3.drawText(`${addCommasToNumber(Math.floor(Math.floor(대출한도 * 1.25) * 1.25))}원으로 증가`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`${addCommasToNumber(Math.floor(대출한도 * 1.25))}원 X 125% = `, 20),
        y: height / 2 - 32 - 133 - 25,
        size: 20,
        font: light,
        color: rgb(1, 0, 0)
    })
    airesult3.drawText(`된다.`, {
        x: width / 2 + 55 + light.widthOfTextAtSize(`${addCommasToNumber(Math.floor(대출한도 * 1.25))}원 X 125% = ` + `${addCommasToNumber(Math.floor(Math.floor(대출한도 * 1.25) * 1.25))}원으로 증가`, 20),
        y: height / 2 - 32 - 133 - 25,
        size: 20,
        font: light,
        color: rgb(0, 0, 0)
    })


    //최종혜택

    //기업명 (타이틀)
    final.drawText(splitText(resJson.resultJson.기업명 + " 최종 혜택", 46), {
        x: width / 2 - 620,
        y: height - 134,
        size: 45,
        font: bold,
        color: rgb(0, 0, 0)
    })
    //기업명
    final.drawText(splitText(resJson.resultJson.기업명, 46), {
        x: width / 2 - 610,
        y: height / 2 + 74,
        size: 22,
        font: light,
        color: rgb(0, 0, 0)
    })

    //정책자금 한도 - 당초
    final.drawText(addCommasToNumber(예상대출), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber(예상대출), 22) / 2),
        y: height / 2 + 84,
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })

    //정책자금 한도 - 연구소설립
    final.drawText(addCommasToNumber(Math.floor(예상대출 * 1.2)), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber(Math.floor(예상대출 * 1.2)), 22) / 2) + 173.5,
        y: height / 2 + 84,
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })

    //정책자금 한도 - 기업인증
    final.drawText(addCommasToNumber(Math.floor(예상대출 * 1.25)), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber(Math.floor(예상대출 * 1.25)), 22) / 2) + (173.5 * 2),
        y: height / 2 + 84,
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })

    //정책자금 한도 - 혜택합계
    final.drawText(addCommasToNumber((Math.floor(예상대출 * 1.2) - 예상대출) + (Math.floor(예상대출 * 1.25) - 예상대출)), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber((Math.floor(예상대출 * 1.2) - 예상대출) + (Math.floor(예상대출 * 1.25) - 예상대출)), 22) / 2) + (173.5 * 3),
        y: height / 2 + 84,
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })

    //정책자금 이자 - 혜택합계
    final.drawText(addCommasToNumber(Math.floor(예상대출 * 0.015)), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber(Math.floor(예상대출 * 0.015)), 22) / 2) + (173.5 * 3),
        y: height / 2 + 84 - 57,
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })

    //정책자금이자 - 이름
    final.drawText("1년 이자 절감", {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize("1년 이자 절감", 22) / 2) - 174.5,
        y: height / 2 + 84 - (57 * 1) - 3,
        size: 22,
        font: bold,
        color: rgb(0, 0, 0)
    })


    //세금혜택 - 이름
    final.drawText("1년 세금 혜택", {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize("1년 세금 혜택", 22) / 2) - 174.5,
        y: height / 2 + 84 - (57 * 2) - 3,
        size: 22,
        font: bold,
        color: rgb(0, 0, 0)
    })

    //세금혜택 - 당초
    final.drawText(addCommasToNumber(resJson.resultJson.세금), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber(resJson.resultJson.세금), 22) / 2),
        y: height / 2 + 84 - (57 * 2),
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })
    let 이월 = Number(resJson.resultJson.세금) - 17500000 < 0 ? Number(resJson.resultJson.세금) - 17500000 : 0
    //세금혜택 - 연구소설립
    final.drawText(addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)) + Math.abs(이월)), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)) + Math.abs(이월)), 22) / 2) + 173.5,
        y: height / 2 + 84 - (57 * 2),
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })

    //세금혜택 - 혜택합계
    final.drawText(addCommasToNumber((((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)) + Math.abs(이월)) + Math.floor(resJson.resultJson.세금 * 0.5)) - resJson.resultJson.세금), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber((((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)) + Math.abs(이월)) + Math.floor(resJson.resultJson.세금 * 0.5)) - resJson.resultJson.세금), 22) / 2) + (173.5 * 3),
        y: height / 2 + 84 - (57 * 2),
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })

    //세금혜택 - 기업인증
    final.drawText(addCommasToNumber(Math.floor(resJson.resultJson.세금 * 0.5)), {
        x: width / 2 + 11.5 - (def.widthOfTextAtSize(addCommasToNumber(Math.floor(resJson.resultJson.세금 * 0.5)), 22) / 2) + (173.5 * 2),
        y: height / 2 + 84 - (57 * 2),
        size: 22,
        font: def,
        color: rgb(0, 0, 0)
    })
    //`${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)))}원 감소되며, 내년에 ${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)) + Math.abs(이월))}원 추가 감면됩니다.`
    //세금혜택 - 혜택합계
    final.drawText(`정책자금 한도는 `, {
        x: width / 2 + -245 - 7 + 1,
        y: height / 2 - 264.5 + 7 + 9 - 1,
        size: 22,
        font: light,
        color: rgb(128 / 255, 0, 128 / 255)
    })
    final.drawText(`최소 ${addCommasToNumber((Math.floor(예상대출 * 1.2) - 예상대출) + (Math.floor(예상대출 * 1.25) - 예상대출))}원 증가 `, {
        x: width / 2 + -245 - 7 + 1 + light.widthOfTextAtSize(`정책자금 한도는 `, 22),
        y: height / 2 - 264.5 + 7 + 9 - 1,
        size: 22,
        font: light,
        color: rgb(1, 0, 0)
    })
    final.drawText(`됩니다.`, {
        x: width / 2 + -245 - 7 + 1 + light.widthOfTextAtSize(`정책자금 한도는 ` + `최소 ${addCommasToNumber((Math.floor(예상대출 * 1.2) - 예상대출) + (Math.floor(예상대출 * 1.25) - 예상대출))}원 증가 `, 22),
        y: height / 2 - 264.5 + 7 + 9 - 1,
        size: 22,
        font: light,
        color: rgb(0, 0, 0)
    })


    final.drawText(`정책자금 이자는 `, {
        x: width / 2 + -245 - 7 + 1,
        y: height / 2 - 264.5 + 7 + 9 - 1 - 28,
        size: 22,
        font: light,
        color: rgb(128 / 255, 0, 128 / 255)
    })

    final.drawText(`최소 ${addCommasToNumber(Math.floor(예상대출 * 0.014))}원 감소`, {
        x: width / 2 + -245 - 7 + 1 + light.widthOfTextAtSize(`정책자금 이자는 `, 22),
        y: height / 2 - 264.5 + 7 + 9 - 1 - 28,
        size: 22,
        font: light,
        color: rgb(1, 0, 0)
    })

    final.drawText(`됩니다.`, {
        x: width / 2 + -245 - 7 + 1 + light.widthOfTextAtSize(`정책자금 이자는 ` + `최소 ${addCommasToNumber(Math.floor(예상대출 * 0.014))}원 감소`, 22),
        y: height / 2 - 264.5 + 7 + 9 - 1 - 28,
        size: 22,
        font: light,
        color: rgb(0, 0, 0)
    })


    final.drawText(`세금납부 금액은 `, {
        x: width / 2 + -245 - 7 + 1,
        y: height / 2 - 264.5 + 7 + 9 - 1 - 28 - 28,
        size: 22,
        font: light,
        color: rgb(128 / 255, 0, 128 / 255)
    })

    final.drawText(`${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)))}원 감소되며, 내년에 ${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)) + Math.abs(이월))}원 추가 감면`, {
        x: width / 2 + -245 - 7 + 1 + light.widthOfTextAtSize(`세금납부 금액은 `, 22),
        y: height / 2 - 264.5 + 7 + 9 - 1 - 28 - 28,
        size: 22,
        font: light,
        color: rgb(1, 0, 0)
    })

    final.drawText(`됩니다.`, {
        x: width / 2 + -245 - 7 + 1 + light.widthOfTextAtSize(`세금납부 금액은 ` + `${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)))}원 감소되며, 내년에 ${addCommasToNumber((resJson.resultJson.세금 - Math.floor(resJson.resultJson.당기순이익 * 0.07)) + Math.abs(이월))}원 추가 감면`, 22),
        y: height / 2 - 264.5 + 7 + 9 - 1 - 28 - 28,
        size: 22,
        font: light,
        color: rgb(0, 0, 0)
    })
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
            return {
                세율: 9,
                누진세액공제: 0
            }
        }
        if (값 > 200000000 && 값 <= 20000000000) {
            return {
                세율: 19,
                누진세액공제: 0
            }
        }
        if (값 > 20000000000 && 값 <= 300000000000) {
            return {
                세율: 21,
                누진세액공제: 0
            }
        }
        if (값 > 300000000000) {
            return {
                세율: 24,
                누진세액공제: 0
            }
        }
    } else {
        if (값 <= 14000000) {
            return {
                세율: 6,
                누진세액공제: 0
            }
        }
        if (값 > 14000000 && 값 <= 50000000) {
            return {
                세율: 15,
                누진세액공제: 1260000
            }
        }
        if (값 > 50000000 && 값 <= 88000000) {
            return {
                세율: 24,
                누진세액공제: 5760000
            }
        }
        if (값 > 88000000 && 값 <= 150000000) {
            return {
                세율: 35,
                누진세액공제: 15440000
            }
        }
        if (값 > 150000000 && 값 <= 300000000) {
            return {
                세율: 38,
                누진세액공제: 19940000
            }
        }
        if (값 > 300000000 && 값 <= 500000000) {
            return {
                세율: 40,
                누진세액공제: 25940000
            }
        }
        if (값 > 500000000 && 값 <= 1000000000) {
            return {
                세율: 42,
                누진세액공제: 49940000
            }
        }
        if (값 > 1000000000) {
            return {
                세율: 45,
                누진세액공제: 65940000
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
        let test = extractValuesWithSubstring(tableData, '법인명)', 2)[0]
        const 법인 = test.includes("주식회사") || test.includes("(주)") || test.includes("(유)") || test.includes("(합)") || test.includes("( 주 )") || test.includes("( 유 )") || test.includes("( 합 )") ? true : false;
        const 자본금 = extractValuesWithSubstring(tableData, '자본금');

        let 과세계산 = 과세표준계산(Number(당기순이익[0].replace(/,/gi, "")), 법인);
        let 세금 = Number(당기순이익[0].replace(/,/gi, "")) * (과세계산.세율 / 100) - 과세계산.누진세액공제;
        if(Number(당기순이익[0].replace(/,/gi, "")) > 200000000) 세금 = (Number(당기순이익[0].replace(/,/gi, "")) * 0.09) + (Number(당기순이익[0].replace(/,/gi, ""))-200000000) * (과세계산.세율 / 100) - 과세계산.누진세액공제

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