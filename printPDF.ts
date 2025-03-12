import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
const printer = require("pdf-to-printer");
import NFCeSchema from "../../schemas/NFCeSchema/NFCeSchema";

export class PrintNFCe {

   public async printPDF(ref: string) {
      try {
         const operationPromise = await NFCeSchema.findOne({ ref: ref });

         if (!operationPromise) {
            return { status: 0, msg: "NFC-e não encontrada" };
         }

         //Gerar o PDF usando o HTML da NFC-e
         const pdfPath = await this.generatePDF(ref, operationPromise.html);

         //Enviar para a impressora
         await printer.print(pdfPath);

         //Remove o arquivo temporário após a impressão
         fs.unlinkSync(pdfPath);

         return {
            status: 1,
            msg: "NFC-e gerada e impressa com sucesso!"
         };

      } catch (err: any) {
         return { status: 0, msg: `Erro ao imprimir NFC-e: ${err.message}` };
      }
   }

   private async generatePDF(ref: string, htmlContent: string): Promise<string> {
      try {
         const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
         const page = await browser.newPage();
         await page.setContent(htmlContent);

         //Caminho do arquivo PDF temporario
         const pdfPath = path.join(__dirname, `../../temp/temp_${ref}.pdf`);

         await page.pdf({
            path: pdfPath,
            width: "210mm",
            height: "200mm",
         });
         await browser.close();

         return pdfPath;
      } catch (err: any) {
         throw new Error(`Erro ao gerar PDF: ${err.message}`);
      }
   }
}
