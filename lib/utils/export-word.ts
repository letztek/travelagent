import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, BorderStyle } from 'docx'
import { Itinerary } from '@/schemas/itinerary'

export async function generateItineraryDoc(itinerary: Itinerary): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "旅遊行程表",
            heading: "Heading1",
            alignment: "center",
            spacing: { after: 400 },
          }),
          ...itinerary.days.flatMap(day => [
            new Paragraph({
              text: `Day ${day.day} - ${day.date}`,
              heading: "Heading2",
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              text: `住宿：${day.accommodation}`,
              spacing: { after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
              },
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "時段", bold: true })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "活動", bold: true })] })], width: { size: 25, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "描述", bold: true })] })], width: { size: 60, type: WidthType.PERCENTAGE } }),
                  ],
                }),
                ...day.activities.map(act => 
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(act.time_slot)] }),
                      new TableCell({ children: [new Paragraph(act.activity)] }),
                      new TableCell({ children: [new Paragraph(act.description)] }),
                    ],
                  })
                )
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "餐食：", bold: true }),
                new TextRun({ text: ` 早: ${day.meals.breakfast} | 午: ${day.meals.lunch} | 晚: ${day.meals.dinner}` }),
              ],
              spacing: { before: 200 },
            })
          ])
        ],
      },
    ],
  })

  return await Packer.toBlob(doc)
}
