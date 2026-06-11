// Per-tool dynamic imports: each tool is its own chunk, loaded only when opened.
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ToolId } from "../tool-config";
import { ToolSkeleton } from "../shared";

export const TOOL_COMPONENTS: Record<ToolId, ComponentType> = {
  palette: dynamic(() => import("./Palette").then((m) => m.Palette), { ssr: false, loading: ToolSkeleton }),
  markdown: dynamic(() => import("./MarkdownPreview").then((m) => m.MarkdownPreview), { ssr: false, loading: ToolSkeleton }),
  inspo: dynamic(() => import("./Inspiration").then((m) => m.Inspiration), { ssr: false, loading: ToolSkeleton }),
  json: dynamic(() => import("./JSONFormatter").then((m) => m.JSONFormatter), { ssr: false, loading: ToolSkeleton }),
  regex: dynamic(() => import("./RegexTester").then((m) => m.RegexTester), { ssr: false, loading: ToolSkeleton }),
  timestamp: dynamic(() => import("./TimestampConverter").then((m) => m.TimestampConverter), { ssr: false, loading: ToolSkeleton }),
  contrast: dynamic(() => import("./ContrastChecker").then((m) => m.ContrastChecker), { ssr: false, loading: ToolSkeleton }),
  generator: dynamic(() => import("./GeneratorKit").then((m) => m.GeneratorKit), { ssr: false, loading: ToolSkeleton }),
  base64: dynamic(() => import("./Base64Tool").then((m) => m.Base64Tool), { ssr: false, loading: ToolSkeleton }),
  url: dynamic(() => import("./URLTool").then((m) => m.URLTool), { ssr: false, loading: ToolSkeleton }),
  lorem: dynamic(() => import("./LoremIpsum").then((m) => m.LoremIpsum), { ssr: false, loading: ToolSkeleton }),
  hash: dynamic(() => import("./HashGenerator").then((m) => m.HashGenerator), { ssr: false, loading: ToolSkeleton }),
  wordcount: dynamic(() => import("./WordCounter").then((m) => m.WordCounter), { ssr: false, loading: ToolSkeleton }),
  cssunit: dynamic(() => import("./CSSUnitConverter").then((m) => m.CSSUnitConverter), { ssr: false, loading: ToolSkeleton }),
  slug: dynamic(() => import("./SlugStudio").then((m) => m.SlugStudio), { ssr: false, loading: ToolSkeleton }),
  textcase: dynamic(() => import("./TextCaseStudio").then((m) => m.TextCaseStudio), { ssr: false, loading: ToolSkeleton }),
  csvjson: dynamic(() => import("./CSVJSONStudio").then((m) => m.CSVJSONStudio), { ssr: false, loading: ToolSkeleton }),
  httpstatus: dynamic(() => import("./HTTPStatusExplorer").then((m) => m.HTTPStatusExplorer), { ssr: false, loading: ToolSkeleton }),
  cron: dynamic(() => import("./CronBuilder").then((m) => m.CronBuilder), { ssr: false, loading: ToolSkeleton }),
  qrcode: dynamic(() => import("./QRCodeGenerator").then((m) => m.QRCodeGenerator), { ssr: false, loading: ToolSkeleton }),
  jwt: dynamic(() => import("./JWTDecoder").then((m) => m.JWTDecoder), { ssr: false, loading: ToolSkeleton }),
  pomodoro: dynamic(() => import("./PomodoroTimer").then((m) => m.PomodoroTimer), { ssr: false, loading: ToolSkeleton }),
  ipinfo: dynamic(() => import("./IPInfo").then((m) => m.IPInfo), { ssr: false, loading: ToolSkeleton }),
  diff: dynamic(() => import("./DiffChecker").then((m) => m.DiffChecker), { ssr: false, loading: ToolSkeleton }),
  baseconv: dynamic(() => import("./BaseConverter").then((m) => m.BaseConverter), { ssr: false, loading: ToolSkeleton }),
  gradient: dynamic(() => import("./GradientGenerator").then((m) => m.GradientGenerator), { ssr: false, loading: ToolSkeleton }),
  password: dynamic(() => import("./PasswordTester").then((m) => m.PasswordTester), { ssr: false, loading: ToolSkeleton }),
  eightball: dynamic(() => import("./Magic8Ball").then((m) => m.Magic8Ball), { ssr: false, loading: ToolSkeleton }),
  coinflip: dynamic(() => import("./CoinFlip").then((m) => m.CoinFlip), { ssr: false, loading: ToolSkeleton }),
  dice: dynamic(() => import("./DiceRoller").then((m) => m.DiceRoller), { ssr: false, loading: ToolSkeleton }),
  ascii: dynamic(() => import("./ASCIIArtGenerator").then((m) => m.ASCIIArtGenerator), { ssr: false, loading: ToolSkeleton }),
  colorgame: dynamic(() => import("./ColorGuessingGame").then((m) => m.ColorGuessingGame), { ssr: false, loading: ToolSkeleton }),
  sql: dynamic(() => import("./SQLFormatter").then((m) => m.SQLFormatter), { ssr: false, loading: ToolSkeleton }),
  emoji: dynamic(() => import("./EmojiPicker").then((m) => m.EmojiPicker), { ssr: false, loading: ToolSkeleton }),
  shadow: dynamic(() => import("./ShadowGenerator").then((m) => m.ShadowGenerator), { ssr: false, loading: ToolSkeleton }),
};
