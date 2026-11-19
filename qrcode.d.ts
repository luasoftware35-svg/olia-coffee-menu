declare module "qrcode" {
  type Level = "L" | "M" | "Q" | "H"

  export function toString(
    text: string,
    options: {
      type: "svg"
      errorCorrectionLevel: Level
      margin: number
      color: { dark: string; light: string }
    },
  ): Promise<string>

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options: {
      errorCorrectionLevel: Level
      margin: number
      width: number
      color: { dark: string; light: string }
    },
  ): Promise<void>
}
